import type {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import type { Environment, FetchFunction } from './http';

interface GeneratedOntology {
  name: string;
  entityTypes: unknown[];
  relationships: unknown[];
}

export interface GenerateOntologyDependencies {
  fetch: FetchFunction;
  environment: Environment;
}

type GenerateOntologyRequest = Pick<HttpRequest, 'json'>;
type GenerateOntologyContext = Pick<InvocationContext, 'error'>;

const SYSTEM_PROMPT = `You are an expert ontology extraction system. Given a business scenario description, extract entities, relationships, and properties to create a complete ontology.

Output ONLY valid JSON matching this exact schema:
{
  "name": "string - Name for this ontology",
  "entityTypes": [
    {
      "id": "string - lowercase, snake_case identifier",
      "name": "string - Display name",
      "description": "string - Brief description",
      "properties": [
        {
          "name": "string - camelCase property name",
          "type": "string|integer|decimal|boolean|date|datetime|enum",
          "isIdentifier": boolean (true for primary key),
          "values": ["array of enum values if type is enum"],
          "unit": "string - optional unit like USD, kg, etc."
        }
      ],
      "icon": "string - single emoji representing this entity",
      "color": "string - hex color code like #0078D4, #107C10, #5C2D91, #FFB900, #D83B01, #00A9E0"
    }
  ],
  "relationships": [
    {
      "id": "string - lowercase identifier like entity1_verb_entity2",
      "name": "string - verb describing the relationship",
      "from": "string - id of source entity",
      "to": "string - id of target entity",
      "cardinality": "one-to-one|one-to-many|many-to-one|many-to-many",
      "description": "string - optional description"
    }
  ]
}

Rules:
1. Extract nouns as entities, verbs as relationships
2. Each entity MUST have at least one property with isIdentifier: true
3. Include 3-6 meaningful properties per entity
4. Use appropriate cardinality based on business logic
5. Generate descriptive relationship names (verbs like "places", "contains", "manages")
6. Use relevant emojis for icons
7. Assign unique hex colors to each entity (use Microsoft palette: #0078D4, #107C10, #5C2D91, #FFB900, #D83B01, #00A9E0, #8764B8, #00B294)
8. Output ONLY the JSON, no explanations`;

const defaultDependencies: GenerateOntologyDependencies = {
  fetch: (input, init) => globalThis.fetch(input, init),
  environment: process.env,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError';
}

function readOpenAIContent(value: unknown): string | undefined {
  if (!isRecord(value) || !Array.isArray(value.choices)) return undefined;

  const firstChoice = value.choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return undefined;
  }

  return typeof firstChoice.message.content === 'string'
    ? firstChoice.message.content
    : undefined;
}

function isGeneratedOntology(value: unknown): value is GeneratedOntology {
  return isRecord(value)
    && typeof value.name === 'string'
    && value.name.trim().length > 0
    && Array.isArray(value.entityTypes)
    && Array.isArray(value.relationships);
}

function buildAzureOpenAIUrl(endpoint: string, deployment: string): URL {
  const baseUrl = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  const url = new URL(
    `openai/deployments/${encodeURIComponent(deployment)}/chat/completions`,
    baseUrl,
  );
  url.searchParams.set('api-version', '2024-02-15-preview');
  return url;
}

export async function handleGenerateOntology(
  request: GenerateOntologyRequest,
  context: GenerateOntologyContext,
  dependencies: GenerateOntologyDependencies = defaultDependencies,
): Promise<HttpResponseInit> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      status: 400,
      jsonBody: { error: 'Request body must be valid JSON' },
    };
  }

  const description = isRecord(body) ? body.description : undefined;
  if (typeof description !== 'string' || description.trim().length === 0) {
    return {
      status: 400,
      jsonBody: { error: "Missing 'description' in request body" },
    };
  }

  const endpoint = dependencies.environment.AZURE_OPENAI_ENDPOINT;
  const apiKey = dependencies.environment.AZURE_OPENAI_API_KEY;
  const deployment = dependencies.environment.AZURE_OPENAI_DEPLOYMENT
    || 'gpt-4o-mini';

  if (!endpoint || !apiKey) {
    return {
      status: 500,
      jsonBody: {
        error: 'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.',
      },
    };
  }

  let requestUrl: URL;
  try {
    requestUrl = buildAzureOpenAIUrl(endpoint, deployment);
  } catch (error) {
    context.error(
      'Invalid Azure OpenAI endpoint configuration',
      errorName(error),
    );
    return {
      status: 500,
      jsonBody: { error: 'Azure OpenAI endpoint is not configured correctly' },
    };
  }

  let response: Response;
  try {
    response = await dependencies.fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description.trim() },
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });
  } catch (error) {
    context.error('Azure OpenAI request failed', errorName(error));
    return {
      status: 502,
      jsonBody: { error: 'Failed to generate ontology from Azure OpenAI' },
    };
  }

  if (!response.ok) {
    context.error('Azure OpenAI returned an error response', response.status);
    return {
      status: 502,
      jsonBody: { error: 'Failed to generate ontology from Azure OpenAI' },
    };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    context.error('Azure OpenAI returned malformed JSON', errorName(error));
    return {
      status: 502,
      jsonBody: { error: 'Invalid response from Azure OpenAI' },
    };
  }

  const content = readOpenAIContent(data);
  if (!content) {
    context.error('Azure OpenAI response did not contain message content');
    return {
      status: 502,
      jsonBody: { error: 'Invalid response from Azure OpenAI' },
    };
  }

  let ontology: unknown;
  try {
    ontology = JSON.parse(content);
  } catch (error) {
    context.error(
      'Azure OpenAI returned invalid ontology JSON',
      errorName(error),
    );
    return {
      status: 502,
      jsonBody: { error: 'Invalid ontology returned by Azure OpenAI' },
    };
  }

  if (!isGeneratedOntology(ontology)) {
    context.error('Azure OpenAI returned an invalid ontology structure');
    return {
      status: 502,
      jsonBody: { error: 'Invalid ontology returned by Azure OpenAI' },
    };
  }

  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    jsonBody: { ontology },
  };
}

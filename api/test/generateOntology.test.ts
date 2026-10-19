import { HttpRequest, InvocationContext } from '@azure/functions';
import { describe, expect, it } from 'vitest';
import {
  handleGenerateOntology,
  type GenerateOntologyDependencies,
} from '../src/handlers/generateOntology';

const configuredEnvironment = {
  AZURE_OPENAI_ENDPOINT: 'https://example.openai.azure.com/',
  AZURE_OPENAI_API_KEY: 'test-api-key',
  AZURE_OPENAI_DEPLOYMENT: 'test-deployment',
};

function createRequest(body: string): HttpRequest {
  return new HttpRequest({
    method: 'POST',
    url: 'https://example.test/api/generate-ontology',
    headers: { 'Content-Type': 'application/json' },
    body: { string: body },
  });
}

function createContext(logs: unknown[][] = []): InvocationContext {
  return new InvocationContext({
    functionName: 'generateOntology',
    logHandler: (level, ...args) => logs.push([level, ...args]),
  });
}

describe('handleGenerateOntology', () => {
  it('returns a generated ontology for a valid request', async () => {
    const ontology = {
      name: 'Retail',
      entityTypes: [{ id: 'customer' }],
      relationships: [],
    };
    let capturedUrl = '';
    let capturedInit: RequestInit | undefined;
    const dependencies: GenerateOntologyDependencies = {
      environment: configuredEnvironment,
      fetch: async (input, init) => {
        capturedUrl = input.toString();
        capturedInit = init;
        return new Response(JSON.stringify({
          choices: [{ message: { content: JSON.stringify(ontology) } }],
        }), { status: 200 });
      },
    };

    const response = await handleGenerateOntology(
      createRequest(JSON.stringify({ description: 'A retail business' })),
      createContext(),
      dependencies,
    );

    expect(response).toMatchObject({
      status: 200,
      jsonBody: { ontology },
    });
    expect(capturedUrl).toBe(
      'https://example.openai.azure.com/openai/deployments/test-deployment/chat/completions?api-version=2024-02-15-preview',
    );
    expect(capturedInit?.method).toBe('POST');
    expect(JSON.parse(capturedInit?.body as string)).toMatchObject({
      messages: expect.arrayContaining([
        { role: 'user', content: 'A retail business' },
      ]),
      response_format: { type: 'json_object' },
    });
  });

  it.each([
    ['malformed JSON', '{', 'Request body must be valid JSON'],
    ['missing description', '{}', "Missing 'description' in request body"],
    ['blank description', '{"description":"   "}', "Missing 'description' in request body"],
  ])('rejects %s', async (_case, body, expectedError) => {
    const response = await handleGenerateOntology(
      createRequest(body),
      createContext(),
      {
        environment: configuredEnvironment,
        fetch: async () => {
          throw new Error('fetch should not be called');
        },
      },
    );

    expect(response).toMatchObject({
      status: 400,
      jsonBody: { error: expectedError },
    });
  });

  it('reports missing configuration without making an upstream request', async () => {
    let fetchCalled = false;

    const response = await handleGenerateOntology(
      createRequest(JSON.stringify({ description: 'A retail business' })),
      createContext(),
      {
        environment: {},
        fetch: async () => {
          fetchCalled = true;
          throw new Error('fetch should not be called');
        },
      },
    );

    expect(fetchCalled).toBe(false);
    expect(response).toMatchObject({
      status: 500,
      jsonBody: {
        error: 'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY.',
      },
    });
  });

  it('returns a secret-safe response when Azure OpenAI rejects the request', async () => {
    const logs: unknown[][] = [];
    const response = await handleGenerateOntology(
      createRequest(JSON.stringify({ description: 'A retail business' })),
      createContext(logs),
      {
        environment: configuredEnvironment,
        fetch: async () => new Response(
          'upstream details containing test-api-key',
          { status: 401 },
        ),
      },
    );

    expect(response).toMatchObject({
      status: 502,
      jsonBody: { error: 'Failed to generate ontology from Azure OpenAI' },
    });
    expect(JSON.stringify(response)).not.toContain('test-api-key');
    expect(JSON.stringify(logs)).not.toContain('test-api-key');
  });

  it('returns a secret-safe response when the upstream request fails', async () => {
    const logs: unknown[][] = [];
    const response = await handleGenerateOntology(
      createRequest(JSON.stringify({ description: 'A retail business' })),
      createContext(logs),
      {
        environment: configuredEnvironment,
        fetch: async () => {
          throw new Error('network failure containing test-api-key');
        },
      },
    );

    expect(response).toMatchObject({
      status: 502,
      jsonBody: { error: 'Failed to generate ontology from Azure OpenAI' },
    });
    expect(JSON.stringify(response)).not.toContain('test-api-key');
    expect(JSON.stringify(logs)).not.toContain('test-api-key');
  });

  it('rejects malformed ontology output from Azure OpenAI', async () => {
    const response = await handleGenerateOntology(
      createRequest(JSON.stringify({ description: 'A retail business' })),
      createContext(),
      {
        environment: configuredEnvironment,
        fetch: async () => new Response(JSON.stringify({
          choices: [{ message: { content: '{"name":"Missing arrays"}' } }],
        }), { status: 200 }),
      },
    );

    expect(response).toMatchObject({
      status: 502,
      jsonBody: { error: 'Invalid ontology returned by Azure OpenAI' },
    });
  });
});

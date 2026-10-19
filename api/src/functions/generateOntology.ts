import { app, type HttpHandler } from '@azure/functions';
import { handleGenerateOntology } from '../handlers/generateOntology';

const generateOntology: HttpHandler = (request, context) =>
  handleGenerateOntology(request, context);

app.http('generateOntology', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'generate-ontology',
  handler: generateOntology,
});

export const LARGE_GRAPH_ELEMENT_THRESHOLD = 1_000;
export const LARGE_ONTOLOGY_LIST_LIMIT = 100;

interface OntologyGraph {
  entityTypes: readonly unknown[];
  relationships: readonly unknown[];
}

export function ontologyGraphElementCount(ontology: OntologyGraph): number {
  return ontology.entityTypes.length + ontology.relationships.length;
}

export function isLargeOntologyGraph(ontology: OntologyGraph): boolean {
  return ontologyGraphElementCount(ontology) >= LARGE_GRAPH_ELEMENT_THRESHOLD;
}

export function limitOntologyList<T>(
  items: readonly T[],
  limit = LARGE_ONTOLOGY_LIST_LIMIT,
): { items: readonly T[]; hiddenCount: number } {
  return {
    items: items.slice(0, limit),
    hiddenCount: Math.max(0, items.length - limit),
  };
}

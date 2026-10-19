import { describe, expect, it } from 'vitest';
import {
  LARGE_GRAPH_ELEMENT_THRESHOLD,
  isLargeOntologyGraph,
  limitOntologyList,
  ontologyGraphElementCount,
} from './ontologyScale';

describe('ontology scale guardrails', () => {
  it('counts entity and relationship graph elements', () => {
    const ontology = {
      entityTypes: Array.from({ length: 3 }),
      relationships: Array.from({ length: 2 }),
    };
    expect(ontologyGraphElementCount(ontology)).toBe(5);
  });

  it('switches to large-graph handling at the threshold', () => {
    const ontology = {
      entityTypes: Array.from({ length: LARGE_GRAPH_ELEMENT_THRESHOLD - 1 }),
      relationships: [],
    };
    expect(isLargeOntologyGraph(ontology)).toBe(false);
    ontology.entityTypes.push({});
    expect(isLargeOntologyGraph(ontology)).toBe(true);
  });

  it('limits long UI lists and reports omitted items', () => {
    const result = limitOntologyList([1, 2, 3, 4], 2);
    expect(result.items).toEqual([1, 2]);
    expect(result.hiddenCount).toBe(2);
  });
});

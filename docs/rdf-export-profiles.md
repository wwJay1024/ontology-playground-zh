# RDF export profiles

Ontology Playground exposes two RDF/XML export profiles with different
contracts. Choose the profile based on whether the file needs to return to the
editor or be consumed primarily by standards-based RDF tooling.
For generator-side input requirements, supported declarations, and parser
limits, see [Generating RDF from External Tools](external-rdf-generators.md).

## Playground round-trip

The **Playground round-trip** profile is the default. It preserves the editable
visual model, including:

- entity icons and colors;
- original property types, units, identifiers, and enum values;
- relationship cardinality and relationship attributes;
- entity IDs used by relationship endpoints; and
- Playground data bindings.

These values use the declared Ontology Playground metadata vocabulary:

```text
https://microsoft.github.io/Ontology-Playground/ns/metadata#
```

The terms are declared as annotation properties, or as a metadata class where
appropriate. They are not Microsoft Fabric vocabulary and are kept separate
from the generated domain ontology namespace. Imports created with older
Playground releases remain supported even though those files placed the same
local term names in the generated domain namespace.

This profile is valid RDF/XML, but its Playground metadata requires knowledge of
the project vocabulary. It is intended for lossless editor round trips rather
than as a standards-neutral interchange contract.

## Standards-oriented OWL + SHACL

The **standards-oriented OWL + SHACL** profile omits Playground-only
presentation and binding metadata. It retains only the minimal Playground
annotations needed to identify a generated subset and record source
provenance. It represents the supported domain model with standard
vocabularies:

| Model feature | Representation |
| --- | --- |
| Entities and taxonomy | `owl:Class` and `rdfs:subClassOf` |
| Entity properties | `owl:DatatypeProperty` with XSD ranges |
| Relationships | Distinct `owl:ObjectProperty` IRIs with domain and range |
| Property order | `sh:order` |
| Enum constraints | `sh:in` with an RDF list of typed string literals |
| Identifier properties | `owl:hasKey`, plus `sh:minCount 1` and `sh:maxCount 1` |
| Relationship cardinality | Forward and inverse SHACL property shapes using `sh:maxCount` |
| Relationship attributes | An association class derived from `rdf:Statement`, with typed properties |
| Source provenance | `dcterms:source` plus explicit Playground source-version and source-import annotations |

Relationship participation is treated as optional because the visual model does
not currently store optionality. The exporter therefore does not invent a
relationship `sh:minCount`. A one-to-many relationship constrains only the
inverse path to at most one source, while a many-to-one relationship constrains
the forward path to at most one target.

Relationships that share a display label remain separate properties when their
IDs, domains, or ranges differ. RDF labels do not establish semantic identity,
and multiple `rdfs:domain` or `rdfs:range` statements would be conjunctive
rather than a union.

Relationship attributes use a first-class association model because RDF/XML
cannot serialize RDF-star quoted triples. The generated association class is a
subclass of `rdf:Statement`, identifies the related predicate with
`dcterms:relation`, and constrains its subject, predicate, and object through OWL
restrictions.

## Import behavior and limits

The importer understands the generated OWL, SHACL order, enum lists,
`owl:hasKey`, cardinality shapes, and association classes. Statement order may
change in a triplestore without changing the reconstructed property order. It
also accepts equivalent RDF/XML that references RDF lists and inverse SHACL
paths through blank nodes.

Both profiles mint a generated base IRI from the ontology name and retain the
ontology label and description. When RDF was imported from a catalogue source,
the editable model also retains its ontology IRI, version IRI and label,
license, and import IRIs. Generated RDF records those values as provenance
rather than declaring that the reduced graph is the authoritative upstream
ontology or version. In particular, recorded source imports are not emitted as
active `owl:imports` on the generated subset.

Unsupported source triples remain only in the catalogue's byte-preserving
original artifact. Source SHACL is inert: it is not copied into a generated
profile unless represented by supported visual-model constraints, and the
Playground does not execute a SHACL validation engine.

The standards-oriented profile intentionally omits icons, colors, units, data
bindings, and other editor-only values that have no selected standards mapping.
Use the round-trip profile when those values must be preserved. Neither
generated profile substitutes for retaining the original imported source file.

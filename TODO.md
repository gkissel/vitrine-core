# TODO

- Replace the temporary disabled Meilisearch-based storefront/backend search integration with ParadeDB `pg_search` using the existing PostgreSQL stack.
- Implement product search, autocomplete, filters, and ranking on top of ParadeDB instead of Meilisearch.
- Remove the remaining backend Meilisearch module/routes/subscribers/workflows once the ParadeDB search flow is in place.

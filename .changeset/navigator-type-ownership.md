---
'@ankhorage/navigator': major
---

Move shared planning, generation, and extension type exports to `@ankhorage/contracts/navigator`; import those types from Contracts rather than Navigator. Keep CustomTabsLayout's implementation-only props private; derive component props with `ComponentProps<typeof CustomTabsLayout>` when needed. Group reused native-icon adapter types under `src/types/`, inline private helper types, and consume general serialization/import validation from Utility. Runtime exports and generated navigation behavior remain unchanged.

# @dpid/needs-based-ai

TypeScript npm package for needs-based AI simulation, ported from C# Unity.

## What It Does

Agents have **stats** (traits they have) and **desires** (traits they want). Items broadcast **advertisements** about available traits. Agents receive advertisements and decide which targets to pursue based on desire priority.

## Key Concepts

- **Traits** - Named properties with quantities (e.g., "health: 50")
- **Advertisements** - Messages broadcasting that traits exist at a location
- **Agents** - Entities with stats and desires, receive advertisements
- **Items** - Entities that broadcast stats (no desires)
- **Maps** - Spatial tracking for positions and radius queries

## Integration

Peer dependency on `@dpid/command-state-machine` - agents implement `StateTransitionHandler`.

## Conventions

- Static `.create()` factory methods on all classes
- Interfaces for all public types (no `I` prefix)
- Null object pattern (`NullMap`, `NullAgentData`, etc.)
- Kebab-case filenames: `trait-collection.class.ts`, `advertisement.interface.ts`

## Commands

```bash
npm run build       # Build with tsup
npm run typecheck   # Type check
npm test            # Run tests
```

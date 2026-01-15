# Tech Stack

## Language & Runtime

- **TypeScript** 5.x with strict mode
- **Target**: ES2020
- **Module**: ESNext (native ES modules)

## Build Tools

| Tool | Purpose | Command |
|------|---------|---------|
| tsup | Build/bundle | `npm run build` |
| tsc | Type checking | `npm run typecheck` |
| Vitest | Testing | `npm test` |

## Package Output

Dual module support:
- CommonJS (`.cjs`) for Node.js require()
- ES Modules (`.js`) for modern bundlers
- Type declarations (`.d.ts`)

## Key Commands

```bash
# Build the project
npm run build

# Type check without emitting
npm run typecheck

# Run tests once
npm test
```

## Dependencies

**Peer dependency:**
- `@dpid/command-state-machine` - State machine integration for agents/items

**Dev only** (no runtime dependencies):
- `tsup` - Fast TypeScript bundler
- `typescript` - Language compiler
- `vitest` - Test framework

## Git Workflow

- Branch naming: `feature/<short-kebab-description>`
- Example: `feature/add-agent-memory`, `feature/fix-broadcast-range`
- PRs target `main` branch

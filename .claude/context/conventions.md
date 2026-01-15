# Code Conventions

## File Naming

- **Kebab-case** for all source files: `trait-collection.ts`, `grid-map.class.ts`
- Interfaces: `*.interface.ts`
- Classes with `.class.ts` suffix when disambiguating from interfaces

## Naming Conventions

- **Classes**: PascalCase, descriptive names
  - `Agent`, `Item`, `GridMap`, `AdvertisementBroadcaster`
- **Interfaces**: PascalCase, no `I` prefix: `Trait`, `Map`, `Advertisement`
- **Variables/methods**: camelCase

## Patterns

### Factory Pattern
Use static `.create()` methods instead of exposing constructors:
```typescript
// Good
const trait = Trait.create('health', 100);
const agent = Agent.create(agentData);
const map = GridMap.create(100, 100);

// Avoid
const trait = new Trait('health', 100);
```

### Null Object Pattern
Provide safe defaults instead of null checks:
```typescript
// Available null objects
NullMap         // No-op map operations
NullAgentData   // Default agent configuration
NullItemData    // Default item configuration
```

### Event Emitter Pattern
Typed event subscription for state changes:
```typescript
trait.onUpdated.addListener((oldQuantity, newQuantity) => {});
map.onElementAdded.addListener((element) => {});
agent.onAdvertisementReceived.addListener((ad) => {});
```

### Event Listener Registration
Use `addListener`/`removeListener` for external event subscription:
```typescript
// Good - clear distinction from lifecycle hooks
onUpdated.addListener(listener);
onUpdated.removeListener(listener);

// Reserve on* prefix for protected lifecycle hooks
protected onStart() {}
```

### Exports
- Interfaces exported as `type`
- Classes/utilities exported as values
- Barrel exports via `index.ts` files

## Testing

- Use descriptive test names that explain the scenario
- Test both happy path and edge cases
- Use `vi.fn()` for mocking callbacks
- Delta time tests should use realistic values (0.016s for 60fps frame)

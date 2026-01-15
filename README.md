# @dpid/needs-based-ai

Needs-based AI simulation for TypeScript. Agents have stats and desires; items broadcast traits via advertisements. Ported from a C# Unity implementation.

## Installation

```bash
npm install @dpid/needs-based-ai
```

**Peer dependency:** Requires `@dpid/command-state-machine` for state handling.

## Quick Start

```typescript
import { GridMap, Item, ItemData, Agent, AgentData, Trait, AdvertisementBroadcaster, BroadcastStats, vector2 } from '@dpid/needs-based-ai';
import { CommandableState, StateMachine } from '@dpid/command-state-machine';

// Create a map
const map = GridMap.create(20, 20);

// Create an item that broadcasts food
// broadcastDistance=5 means it broadcasts to cells within 5 units
// broadcastInterval=1 means it broadcasts every 1 second
const item = Item.create('food-sources', vector2(0, 0));
const itemData = ItemData.create('Apple Tree', 5, 1);
itemData.stats.addTrait(Trait.create('food', 100));
item.data = itemData;
item.addToMap(map);

// Create an agent that desires food
const agent = Agent.create('creatures', vector2(3, 3));
const agentData = AgentData.create('Hungry Creature', 10, 1);
agentData.desires.addTrait(Trait.create('food', 50));
agent.data = agentData;
agent.addToMap(map);

// Set up broadcasting
const broadcaster = AdvertisementBroadcaster.create();
item.broadcaster = broadcaster;
broadcaster.addReceiver(agent);

// Listen for advertisements
agent.onAdvertisementReceived.addListener((ad) => {
  console.log('Received ad for:', ad.traits.map(t => t.id).join(', '));
});

// Set up automatic broadcasting with state machine
const sm = StateMachine.create();
const broadcastState = CommandableState.create('broadcasting');
broadcastState.addCommand(BroadcastStats.create(item));
sm.addState(broadcastState);
sm.setState('broadcasting');

// In your game loop, call update with delta time
// This will automatically broadcast the item's stats at the configured interval
sm.update(1); // 1 second - triggers broadcast
```

## Core Concepts

### Traits

Named properties with quantities. Used for both stats (what an entity has) and desires (what an entity wants).

```typescript
import { Trait, TraitCollection } from '@dpid/needs-based-ai';

const health = Trait.create('health', 100, 0, 100); // id, quantity, min, max
health.quantity = 50; // clamped to min/max

health.onUpdated.addListener((trait) => {
  console.log(`Health changed to ${trait.quantity}`);
});

const stats = TraitCollection.create();
stats.addTrait(health);
stats.getTrait('health'); // returns the trait
```

### Maps

Spatial containers for elements. `GridMap` uses a spatial hash for efficient queries.

```typescript
import { GridMap, SimpleMapElement, vector2 } from '@dpid/needs-based-ai';

const map = GridMap.create(100, 100); // width, height

const element = SimpleMapElement.create('group-id', vector2(10, 10));
element.addToMap(map);

// Spatial queries
map.getElementsAtCell(vector2(10, 10));
map.getElementsInsideRadius(vector2(10, 10), 5);
map.inBounds(vector2(50, 50)); // true
```

### Advertisements

Messages that broadcast traits exist at a location. Agents receive advertisements and can rank them by priority.

```typescript
import { Advertisement, RankedAdvertisement } from '@dpid/needs-based-ai';

const ad = Advertisement.create(
  traits,           // array of Trait
  map,              // the Map
  location,         // source location (Vector2)
  broadcastLocations, // where to broadcast (Vector2[])
  groupId           // identifier string
);

// Ranked advertisements include a priority
const ranked = RankedAdvertisement.create(ad, 10); // rank = 10
```

### Items

Map elements that broadcast their stats. Items have no desires - they're passive entities like resources or objects.

```typescript
import { Item, ItemData, Trait } from '@dpid/needs-based-ai';

const item = Item.create('items', vector2(0, 0));

const data = ItemData.create('Gold Pile', 5, 1); // description, broadcastDistance, broadcastInterval
data.stats.addTrait(Trait.create('gold', 500));
item.data = data;

item.addToMap(map);
item.broadcaster = broadcaster;
```

### Agents

Map elements with both stats and desires. Agents receive advertisements and track targets.

```typescript
import { Agent, AgentData, Trait } from '@dpid/needs-based-ai';

const agent = Agent.create('agents', vector2(5, 5));

const data = AgentData.create('Goblin', 10, 2);
data.stats.addTrait(Trait.create('health', 50));
data.desires.addTrait(Trait.create('gold', 100)); // wants gold!
agent.data = data;

agent.addToMap(map);

// Register to receive advertisements
broadcaster.addReceiver(agent);

// Listen for incoming advertisements
agent.onAdvertisementReceived.addListener((ad) => {
  // Check if ad has traits we desire
  for (const desire of agent.desires.traits) {
    const adTrait = ad.getTrait(desire.id);
    if (adTrait) {
      console.log(`Found ${adTrait.id} we want!`);
      agent.targetLocation = ad.location;
    }
  }
});
```

## Integration with command-state-machine

Both `Item` and `Agent` implement `StateTransitionHandler` from `@dpid/command-state-machine`:

```typescript
import { Agent } from '@dpid/needs-based-ai';
import { StateMachine, SimpleState } from '@dpid/command-state-machine';

const agent = Agent.create('agents', vector2(0, 0));

// Create states for agent behavior
const sm = StateMachine.create();
const idle = SimpleState.create('idle');
const seeking = SimpleState.create('seeking');

idle.addTransition('foundTarget', seeking);
seeking.addTransition('reachedTarget', idle);

sm.addState(idle);
sm.addState(seeking);
sm.setState('idle');

// Agent can trigger transitions
agent.handleTransition('foundTarget'); // Override in subclass to connect to state machine
```

## API Reference

### Common

| Export | Description |
|--------|-------------|
| `Vector2` | 2D point interface `{ x, y }` |
| `Vector3` | 3D point interface `{ x, y, z }` |
| `vector2(x, y)` | Create Vector2 |
| `vector2Distance(a, b)` | Euclidean distance |
| `EventEmitter<T>` | Typed event emitter |

### Traits

| Export | Description |
|--------|-------------|
| `Trait` | Named property with quantity |
| `TraitCollection` | Collection of traits |

### Maps

| Export | Description |
|--------|-------------|
| `Map` | Spatial container interface |
| `MapElement` | Element on a map |
| `GridMap` | Hash-based spatial map |
| `NullMap` | No-op map implementation |
| `SimpleMapElement` | Basic map element |

### Advertisements

| Export | Description |
|--------|-------------|
| `Advertisement` | Traits at a location |
| `RankedAdvertisement` | Advertisement with priority |
| `AdvertisementReceiver` | Interface for receiving ads |
| `AdvertisementBroadcaster` | Broadcasts to receivers |
| `Advertiser` | Interface for entities that advertise |

### Items

| Export | Description |
|--------|-------------|
| `Item` | Map element that broadcasts stats |
| `ItemData` | Item configuration |
| `NullItemData` | No-op item data |

### Agents

| Export | Description |
|--------|-------------|
| `Agent` | Map element with stats and desires |
| `AgentData` | Agent configuration |
| `NullAgentData` | No-op agent data |

## License

MIT

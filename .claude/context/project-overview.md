# Project Overview

## What It Is

`@dpid/needs-based-ai` is a TypeScript library for needs-based AI simulation, ported from C# Unity. It enables agents to make autonomous decisions by:

- **Advertisements**: Items and agents broadcast traits they offer
- **Desires**: Agents prioritize which advertised traits to pursue
- **Spatial Awareness**: Maps track positions for radius-based discovery

## Target Users

Game developers building simulations where AI entities need to:
- Seek out resources or other agents based on needs
- Make prioritized decisions about what to pursue
- Operate within a spatial environment with range constraints

## High-Level Architecture

```
src/
├── agents/           # Entities with stats AND desires
│   ├── Agent (MapElement + StateTransitionHandler)
│   └── AgentData (config with broadcast params)
│
├── items/            # Entities with stats only (passive)
│   ├── Item (MapElement with broadcasting)
│   └── ItemData (config)
│
├── traits/           # Named properties with quantities
│   ├── Trait (min/max clamped values)
│   └── TraitCollection (grouped traits)
│
├── advertisements/   # Broadcasting system
│   ├── Advertisement (traits + location + cells)
│   ├── RankedAdvertisement (with priority)
│   └── AdvertisementBroadcaster (delivery)
│
├── maps/             # Spatial tracking
│   ├── GridMap (spatial hash, radius queries)
│   └── MapElement (positioned entity)
│
├── commands/         # State machine integration
│   └── BroadcastStats (periodic broadcasting)
│
└── common/           # Vectors, events, utilities
```

## Key Concepts

- **Traits**: Named properties with min/max bounds (e.g., "hunger: 50")
- **Advertisements**: Messages broadcasting available traits at a location
- **Agents**: Active entities that both broadcast stats and receive/rank advertisements
- **Items**: Passive entities that only broadcast stats (no desires)
- **Maps**: Spatial hash for efficient radius queries

## Data Flow

```
Item/Agent broadcasts stats periodically
    ↓
Advertisement created (traits + location + cells)
    ↓
AdvertisementBroadcaster delivers to receivers
    ↓
Agent receives, ranks by desire priority
    ↓
Agent sets targetLocation for pathfinding
```

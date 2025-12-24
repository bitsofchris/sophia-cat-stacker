// Cat Stack Dash - Game Configuration
// All tunables in one place for easy adjustment

export const CONFIG = {
    // Lane System
    LANE_POSITIONS: [-2, 0, 2],  // x-coordinates for left, center, right
    LANE_WIDTH: 1.5,
    
    // Movement Speeds
    FORWARD_SPEED: 0.15,         // units per frame
    WATER_SPEED: 0.08,           // slower during water crossing
    LANE_SWITCH_DURATION: 150,   // milliseconds
    
    // Distances
    LEVEL_END_DISTANCE: 100,
    SPAWN_AHEAD_DISTANCE: 50,
    DESPAWN_BEHIND_DISTANCE: 10,
    ROW_SPACING: 3,              // distance between spawn rows
    
    // Collision
    COLLISION_THRESHOLD: 1.5,    // Z-distance for collision detection
    
    // Entity Sizes
    CAT: {
        WIDTH: 0.8,
        HEIGHT: 1.2,
        DEPTH: 0.8,
        COLOR: 0xFF8C00          // Orange
    },
    
    YARN: {
        RADIUS: 0.4,
        HOVER_HEIGHT: 1.0,
        ROTATION_SPEED: 0.02,
        STACK_SPACING: 0.5,
        COLORS: [0xFF69B4, 0x9370DB, 0x4169E1, 0xFFD700]  // pink, purple, blue, yellow
    },
    
    TRIANGLE: {
        RADIUS: 0.6,
        HEIGHT: 1.2,
        HOVER_HEIGHT: 0.6,
        ROTATION_SPEED: 0.03,
        COLOR: 0xDC143C           // Crimson red
    },
    
    GROUND: {
        WIDTH: 6,
        DEPTH: 3,
        HEIGHT: 0.3,
        COLOR: 0x808080           // Gray
    },
    
    BRIDGE: {
        WIDTH: 2,
        DEPTH: 1,
        HEIGHT: 0.2,
        COLOR: 0xFFD700           // Golden yellow
    },
    
    WATER: {
        WIDTH: 8,                 // Wider than track
        DEPTH: 25,                // Longer gap
        COLOR: 0x0a1929,          // Dark navy blue
        OPACITY: 0.95,
        START_Z: -105
    },
    
    // Scoring
    YARN_POINTS: 10,
    BRIDGE_POINTS: 20,
    DISTANCE_POINTS: 1,
    YARN_BRIDGE_DISTANCE: 1,     // Each yarn = 1 unit of bridge
    
    // Difficulty Patterns
    // Y = Yarn, T = Triangle, X = Empty
    // RULE: Always at least one safe lane (X or Y) - never all T's
    PATTERNS: {
        easy: ['YXY', 'YYX', 'XYY', 'XXX', 'YXX', 'XYX', 'YYY', 'XXY'],
        medium: ['YTX', 'XTY', 'YXX', 'XYX', 'TXX', 'XXY', 'YXY', 'XXT'],
        hard: ['TYX', 'XTY', 'TXX', 'YTX', 'XYT', 'TXY', 'YXT', 'XXY']
    },
    
    // Difficulty thresholds (by distance traveled)
    DIFFICULTY: {
        EASY_END: 30,
        MEDIUM_END: 60
    },
    
    // Camera
    CAMERA: {
        FOV: 75,
        OFFSET_Y: 4,
        OFFSET_Z: 6,
        FOLLOW_SPEED: 0.1
    },
    
    // Scene
    BACKGROUND_COLOR: 0x87CEEB,  // Sky blue
    
    // Lighting
    AMBIENT_LIGHT: {
        COLOR: 0x404040,
        INTENSITY: 0.6
    },
    DIRECTIONAL_LIGHT: {
        COLOR: 0xFFFFFF,
        INTENSITY: 0.8,
        POSITION: { x: 5, y: 10, z: 5 }
    }
};


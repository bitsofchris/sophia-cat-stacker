# Cat Stack Dash - Asset Guide

## Game Overview

**Cat Stack Dash** is an endless runner game built with Three.js where players control a cat running down a 3-lane path. The cat collects yarn balls (which form a wavy tail behind it) while avoiding spike obstacles. At the end of the run, the collected yarn is converted into bridge pieces to cross a water gap and reach a grassy island.

### Visual Style Reference
- **Perspective**: Behind-and-above camera angle with 2D sprite art (similar to Temple Run or Subway Surfers, but with flat sprites)
- **Tone**: Cute, playful, casual mobile game aesthetic
- **Color Palette**: Bright and cheerful - orange cat, colorful yarn (pink/purple/blue/yellow), sky blue background, green island destination

### Technical Specs
- **Engine**: Three.js (WebGL)
- **Format Needed**: PNG with transparency (power-of-2 dimensions recommended: 256×256, 512×512, etc.)

---

## Asset Shopping List

### 1. Cat (Player Character)

**Current**: Orange box (0.8 × 1.2 × 0.8 units)

**Search Prompt**:
> Cute cartoon cat character, orange/ginger tabby, standing or running pose, back view or 3/4 view, simple kawaii style, 2D game sprite, transparent background PNG

**Specifications**:
- Size: Roughly square proportions, slightly taller than wide
- Orientation: Facing forward (away from camera) - player sees cat's back
- Style: Cute, round features, expressive

**Color**: Orange (#FF8C00) or similar warm orange/ginger

---

### 2. Yarn Balls (Collectibles)

**Current**: Colored spheres (0.4 unit radius)

**Search Prompt**:
> Cartoon yarn ball, wool ball, knitting yarn, cute game collectible, simple round yarn texture, 2D game sprite, transparent background PNG

**Specifications**:
- Shape: Spherical
- Size: Small, about 1/3 the size of the cat
- Need 4 color variations OR one that can be tinted:
  - Pink (#FF69B4)
  - Purple (#9370DB)
  - Blue (#4169E1)
  - Yellow (#FFD700)
- Should show yarn/thread texture wrapping around the ball
- Bonus: Slight glow or sparkle effect for collectible feel

---

### 3. Obstacle / Spike (Hazard)

**Current**: Red spinning cone (0.6 radius × 1.2 height)

**Search Prompt**:
> Game obstacle spike, danger hazard, red warning cone, spiky obstacle, cartoon game trap, 2D game sprite, transparent background PNG

**Specifications**:
- Shape: Pointed/spiky (cone, spike, or sharp geometry)
- Color: Red/crimson (#DC143C) - needs to read as "danger"
- Size: Similar height to the cat
- Style: Should be immediately recognizable as something to avoid
- The obstacle rotates slowly in-game for visibility

**Alternative ideas**: Cactus, thorn, fire, or any cat-unfriendly obstacle

---

### 4. Bridge Pieces

**Current**: Golden/yellow boxes (2 × 0.2 × 1 units)

**Search Prompt**:
> Wooden plank, bridge segment, wooden board game asset, simple wood plank top-down, cartoon wooden bridge piece, 2D game sprite, transparent background PNG

**Specifications**:
- Shape: Flat rectangular plank
- Dimensions: Wide enough for cat to walk on, thin profile
- Color: Warm wood tones or golden yellow (#FFD700)
- Texture: Wood grain pattern
- These stack/tile together to form a bridge across water

---

### 5. Ground/Path Texture (Tileable)

**Current**: Gray boxes (6 × 0.3 × 3 units per tile)

**Search Prompt**:
> Seamless stone path texture, tileable road texture, cartoon ground tile, game floor texture, cobblestone or dirt path, top-down view, PNG

**Specifications**:
- Type: Seamless/tileable texture
- Dimensions: 256×256 or 512×512 pixels
- View: Top-down (texture is applied to horizontal surface)
- Style: Stone, cobblestone, dirt path, or stylized road
- Should tile seamlessly in the Z direction (forward/back)
- Needs to contrast with the blue water

---

### 6. Water Texture (Tileable)

**Current**: Dark navy blue box with transparency (#0A1929)

**Search Prompt**:
> Cartoon water texture, seamless water surface, stylized ocean texture, game water tile, blue water pattern, top-down view, PNG

**Specifications**:
- Type: Seamless/tileable texture
- Dimensions: 256×256 or 512×512 pixels
- Color: Dark blue/navy tones
- Style: Can show ripples, waves, or simple color variation
- Should look like a gap/hazard the cat cannot cross without a bridge
- Bonus: Could be animated (multiple frames for wave motion)

---

### 7. Grass/Island Texture (Tileable)

**Current**: Forest green box (#228B22)

**Search Prompt**:
> Cartoon grass texture, seamless meadow tile, stylized green grass, game grass texture, lush lawn pattern, top-down view, PNG

**Specifications**:
- Type: Seamless/tileable texture
- Dimensions: 256×256 or 512×512 pixels
- Color: Lush green (forest green, grass green)
- Style: Should look inviting - this is the goal/destination!
- Simple grass pattern with some variation

---

### 8. Trees (Island Decoration) - Optional

**Current**: Green cones (simple placeholder trees)

**Search Prompt**:
> Cute cartoon tree, simple pine tree game asset, stylized forest tree, kawaii tree sprite, 2D game sprite, transparent background PNG

**Specifications**:
- Style: Simple, cute, matches the playful aesthetic
- Size: 2-3x the height of the cat
- Variations: 2-3 different tree types would add variety
- These are just decoration on the destination island

---

## Recommended Asset Packs to Search

These sources often have cohesive packs that would give you matching styles:

1. **Kenney.nl** - Search for:
   - "Animal Pack" (might have cats)
   - "Nature Pack" (trees, grass textures)
   - "Platformer Pack" (collectibles, obstacles)

2. **itch.io/game-assets** - Search for:
   - "Cute animal sprites"
   - "Kawaii game assets"
   - "Casual game pack"

3. **OpenGameArt.org** - Search for:
   - "Cat sprite"
   - "Yarn ball"
   - "Seamless textures"

4. **Game-Icons.net** - Search for:
   - Simple icon-style sprites for UI elements

---

## Integration Notes

Once you have assets, they'll be integrated like this:

### For 2D Sprites (PNG)
```javascript
const textureLoader = new THREE.TextureLoader();
const catTexture = textureLoader.load('assets/sprites/cat.png');
const spriteMaterial = new THREE.SpriteMaterial({ map: catTexture });
const catSprite = new THREE.Sprite(spriteMaterial);
```

### For Textures on Existing Geometry
```javascript
const texture = textureLoader.load('assets/textures/ground.png');
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 1);
const material = new THREE.MeshLambertMaterial({ map: texture });
```

---

## File Organization Suggestion

```
cat-stacker/
├── assets/
│   ├── sprites/
│   │   ├── cat.png
│   │   ├── yarn.png
│   │   ├── obstacle.png
│   │   ├── bridge.png
│   │   └── tree.png
│   └── textures/
│       ├── ground.png
│       ├── water.png
│       └── grass.png
```


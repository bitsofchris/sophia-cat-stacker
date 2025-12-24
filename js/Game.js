// Game Controller - Main game logic and render loop
import { CONFIG } from './config.js';
import { Cat } from './entities/Cat.js';
import { Spawner } from './systems/Spawner.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { LevelManager } from './systems/LevelManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.phase = 'collection';  // 'collection', 'transition', 'water', 'end'
        
        // Stun state (when hitting obstacles)
        this.isStunned = false;
        this.stunEndTime = 0;
        this.stunDuration = 500;  // milliseconds
        
        // Stats
        this.distanceTraveled = 0;
        this.yarnCollected = 0;
        this.bridgeDistance = 0;
        
        // Objects
        this.groundTiles = [];
        this.yarns = [];
        this.triangles = [];
        this.bridges = [];
        
        // Spawning state
        this.lastSpawnZ = 0;
        this.nextRowZ = -10;  // First row spawns at Z = -10
        
        // Three.js setup
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        
        // Create player
        this.cat = new Cat(this.scene);
        
        // Create spawner system
        this.spawner = new Spawner(this.scene);
        
        // Create collision system
        this.collisionSystem = new CollisionSystem();
        this.collisionSystem.setCallbacks(
            (yarn) => this.onYarnCollect(yarn),
            (triangle) => this.onTriangleHit(triangle)
        );
        
        // Create level manager
        this.levelManager = new LevelManager(this.scene);
        
        // Initial ground tiles
        this.spawnInitialGround();
        
        // Position camera to follow cat
        this.updateCameraPosition(true);
        
        // UI references
        this.yarnCountEl = document.getElementById('yarn-count');
        this.distanceCountEl = document.getElementById('distance-count');
        this.messageEl = document.getElementById('message-display');
        this.endScreenEl = document.getElementById('end-screen');
        this.scoreBreakdownEl = document.getElementById('score-breakdown');
        
        // Input handling
        this.setupInput();
        
        // Bind animate for requestAnimationFrame
        this.animate = this.animate.bind(this);
        
        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(CONFIG.BACKGROUND_COLOR);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // Initial position - will be updated properly once cat exists
        this.camera.position.set(0, CONFIG.CAMERA.OFFSET_Y, CONFIG.CAMERA.OFFSET_Z);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(
            CONFIG.AMBIENT_LIGHT.COLOR,
            CONFIG.AMBIENT_LIGHT.INTENSITY
        );
        this.scene.add(ambient);
        
        // Directional light
        const directional = new THREE.DirectionalLight(
            CONFIG.DIRECTIONAL_LIGHT.COLOR,
            CONFIG.DIRECTIONAL_LIGHT.INTENSITY
        );
        directional.position.set(
            CONFIG.DIRECTIONAL_LIGHT.POSITION.x,
            CONFIG.DIRECTIONAL_LIGHT.POSITION.y,
            CONFIG.DIRECTIONAL_LIGHT.POSITION.z
        );
        this.scene.add(directional);
    }
    
    setupInput() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Touch/click controls
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        // Restart button
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restart());
        }
    }
    
    handleKeyDown(e) {
        // Restart any time
        if (e.key === 'r' || e.key === 'R') {
            this.restart();
            return;
        }
        
        // Skip end sequence
        if (this.phase === 'water' && (e.key === ' ' || e.code === 'Space')) {
            // Could skip to end - for now just ignore
            return;
        }
        
        // Lane switching (only during collection phase)
        if (this.phase !== 'collection') return;
        
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            this.cat.switchLane(-1);
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            this.cat.switchLane(1);
        }
    }
    
    handleClick(e) {
        if (this.phase !== 'collection') return;
        
        // Left half = left, right half = right
        const halfWidth = window.innerWidth / 2;
        if (e.clientX < halfWidth) {
            this.cat.switchLane(-1);
        } else {
            this.cat.switchLane(1);
        }
    }
    
    spawnInitialGround() {
        // Create ground tiles from behind the cat to ahead
        for (let z = 10; z > -CONFIG.SPAWN_AHEAD_DISTANCE; z -= CONFIG.GROUND.DEPTH) {
            this.spawnGroundTile(z);
        }
    }
    
    spawnGroundTile(z) {
        const geometry = new THREE.BoxGeometry(
            CONFIG.GROUND.WIDTH,
            CONFIG.GROUND.HEIGHT,
            CONFIG.GROUND.DEPTH
        );
        const material = new THREE.MeshLambertMaterial({ 
            color: CONFIG.GROUND.COLOR 
        });
        const tile = new THREE.Mesh(geometry, material);
        
        tile.position.set(0, -CONFIG.GROUND.HEIGHT / 2, z);
        this.scene.add(tile);
        this.groundTiles.push(tile);
        
        return tile;
    }
    
    updateGround() {
        const catZ = this.cat.z;
        
        // Spawn new tiles ahead
        const spawnThreshold = catZ - CONFIG.SPAWN_AHEAD_DISTANCE;
        const lastTile = this.groundTiles[this.groundTiles.length - 1];
        
        if (lastTile && lastTile.position.z > spawnThreshold) {
            const newZ = lastTile.position.z - CONFIG.GROUND.DEPTH;
            this.spawnGroundTile(newZ);
        }
        
        // Remove tiles behind
        const despawnThreshold = catZ + CONFIG.DESPAWN_BEHIND_DISTANCE;
        while (this.groundTiles.length > 0 && this.groundTiles[0].position.z > despawnThreshold) {
            const tile = this.groundTiles.shift();
            this.scene.remove(tile);
            tile.geometry.dispose();
            tile.material.dispose();
        }
    }
    
    updateCameraPosition(instant = false) {
        const targetX = 0;
        const targetY = this.cat.y + CONFIG.CAMERA.OFFSET_Y;
        const targetZ = this.cat.z + CONFIG.CAMERA.OFFSET_Z;
        
        if (instant) {
            this.camera.position.set(targetX, targetY, targetZ);
        } else {
            // Smooth follow
            const speed = CONFIG.CAMERA.FOLLOW_SPEED;
            this.camera.position.x += (targetX - this.camera.position.x) * speed;
            this.camera.position.y += (targetY - this.camera.position.y) * speed;
            this.camera.position.z += (targetZ - this.camera.position.z) * speed;
        }
        
        // Look at cat
        this.camera.lookAt(this.cat.mesh.position);
    }
    
    updateUI() {
        if (this.yarnCountEl) {
            this.yarnCountEl.textContent = this.cat.getStackCount();
        }
        if (this.distanceCountEl) {
            this.distanceCountEl.textContent = Math.floor(this.distanceTraveled);
        }
    }
    
    showMessage(text) {
        if (this.messageEl) {
            this.messageEl.textContent = text;
            this.messageEl.classList.remove('hidden');
        }
    }
    
    hideMessage() {
        if (this.messageEl) {
            this.messageEl.classList.add('hidden');
        }
    }
    
    showEndScreen(title, scoreData) {
        if (this.endScreenEl) {
            const h1 = this.endScreenEl.querySelector('h1');
            if (h1) h1.textContent = title;
            
            if (this.scoreBreakdownEl) {
                this.scoreBreakdownEl.innerHTML = `
                    <div class="score-line">Distance: ${Math.floor(scoreData.distance)} × ${CONFIG.DISTANCE_POINTS} = ${scoreData.distance * CONFIG.DISTANCE_POINTS}</div>
                    <div class="score-line">Yarn Collected: ${scoreData.yarn} × ${CONFIG.YARN_POINTS} = ${scoreData.yarn * CONFIG.YARN_POINTS}</div>
                    <div class="score-line">Bridge Distance: ${scoreData.bridge} × ${CONFIG.BRIDGE_POINTS} = ${scoreData.bridge * CONFIG.BRIDGE_POINTS}</div>
                    <div class="total">Total Score: ${scoreData.total}</div>
                `;
            }
            
            this.endScreenEl.classList.remove('hidden');
        }
    }
    
    hideEndScreen() {
        if (this.endScreenEl) {
            this.endScreenEl.classList.add('hidden');
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        requestAnimationFrame(this.animate);
        
        if (this.isPaused) return;
        
        // Update game based on phase
        switch (this.phase) {
            case 'collection':
                this.updateCollection();
                break;
            case 'transition':
                this.updateTransition();
                break;
            case 'water':
                this.updateWater();
                break;
            case 'end':
                // Just render, no updates
                break;
        }
        
        // Always update these
        this.cat.update();
        this.updateCameraPosition();
        this.updateUI();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    updateCollection() {
        // Check if stunned
        if (this.isStunned) {
            if (performance.now() >= this.stunEndTime) {
                this.isStunned = false;
                // Reset cat color
                this.cat.mesh.material.color.setHex(CONFIG.CAT.COLOR);
            } else {
                // Flash cat red while stunned
                const flash = Math.sin(performance.now() * 0.02) > 0;
                this.cat.mesh.material.color.setHex(flash ? 0xFF0000 : CONFIG.CAT.COLOR);
                
                // Still update cat position (for tail) but don't move forward
                this.cat.update();
                return;
            }
        }
        
        // Move cat forward
        this.cat.moveForward(CONFIG.FORWARD_SPEED);
        this.distanceTraveled = Math.abs(this.cat.z);
        
        // Update ground
        this.updateGround();
        
        // Update spawner (spawn/despawn objects)
        this.spawner.update(this.cat.z, this.distanceTraveled);
        
        // Check collisions
        this.collisionSystem.checkCollisions(
            this.cat,
            this.spawner.getYarns(),
            this.spawner.getTriangles()
        );
        
        // Check for level end
        if (this.distanceTraveled >= CONFIG.LEVEL_END_DISTANCE) {
            this.startTransition();
        }
    }
    
    onYarnCollect(yarn) {
        this.yarnCollected++;
        // Add visual yarn to cat's stack (Phase 5 will enhance this)
        this.cat.addToStack(yarn.getColor());
    }
    
    onTriangleHit(triangle) {
        // Stun the cat - stop scrolling briefly
        this.isStunned = true;
        this.stunEndTime = performance.now() + this.stunDuration;
        
        // Remove yarn from stack if we have any
        if (this.cat.getStackCount() > 0) {
            this.cat.removeFromStack();
        }
        
        // Screen shake effect
        this.triggerScreenShake();
    }
    
    triggerScreenShake() {
        const originalPosition = this.camera.position.clone();
        const shakeIntensity = 0.3;
        const shakeDuration = 200;
        const startTime = performance.now();
        
        const shake = () => {
            const elapsed = performance.now() - startTime;
            if (elapsed < shakeDuration) {
                const decay = 1 - (elapsed / shakeDuration);
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * shakeIntensity * decay;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * shakeIntensity * decay;
                requestAnimationFrame(shake);
            }
        };
        shake();
    }
    
    updateTransition() {
        // Force cat to center lane
        this.cat.forceLane(1);
        
        // Slow forward movement
        this.cat.moveForward(CONFIG.WATER_SPEED);
        this.distanceTraveled = Math.abs(this.cat.z);
        
        // Update ground
        this.updateGround();
        
        // Check if reached water
        if (this.cat.z <= CONFIG.WATER.START_Z) {
            this.startWater();
        }
    }
    
    updateWater() {
        // Move cat forward slowly onto the bridge
        const lastBridgeZ = this.levelManager.getLastBridgeZ();
        
        // Only move forward if there's bridge to walk on
        if (this.cat.z > lastBridgeZ + 0.5) {
            this.cat.moveForward(CONFIG.WATER_SPEED);
        }
        
        // Build bridge using yarn
        const done = this.levelManager.buildBridge(this.cat, () => {
            // Bridge building complete
            this.bridgeDistance = this.levelManager.getBridgeDistance();
            this.endGame();
        });
        
        // Update ground behind (keep some visible)
        this.updateGround();
    }
    
    startTransition() {
        this.phase = 'transition';
        this.showMessage('Approaching Water!');
        
        // Create water section
        this.levelManager.createWater();
    }
    
    startWater() {
        this.phase = 'water';
        this.hideMessage();
        this.showMessage('Building Bridge...');
    }
    
    endGame() {
        this.phase = 'end';
        this.hideMessage();
        
        // Calculate score
        const distance = Math.floor(this.distanceTraveled);
        const yarn = this.yarnCollected;
        const bridge = this.bridgeDistance;
        const total = (distance * CONFIG.DISTANCE_POINTS) + 
                      (yarn * CONFIG.YARN_POINTS) + 
                      (bridge * CONFIG.BRIDGE_POINTS);
        
        // Determine title
        let title = 'Game Over!';
        if (bridge >= 15) {
            title = 'Amazing! Perfect Crossing!';
        } else if (bridge >= 10) {
            title = 'Good Job!';
        } else if (bridge >= 5) {
            title = 'Not Bad!';
        } else if (this.cat.getStackCount() === 0) {
            title = 'Collect More Yarn!';
        }
        
        this.showEndScreen(title, { distance, yarn, bridge, total });
    }
    
    restart() {
        // Reset state
        this.phase = 'collection';
        this.distanceTraveled = 0;
        this.yarnCollected = 0;
        this.bridgeDistance = 0;
        this.nextRowZ = -10;
        this.isStunned = false;
        this.stunEndTime = 0;
        
        // Reset cat
        this.cat.reset();
        
        // Reset spawner
        this.spawner.reset();
        
        // Reset level manager
        this.levelManager.reset();
        
        // Clear objects
        this.clearObjects();
        
        // Respawn ground
        this.groundTiles = [];
        this.spawnInitialGround();
        
        // Hide UI
        this.hideMessage();
        this.hideEndScreen();
        
        // Update camera instantly
        this.updateCameraPosition(true);
    }
    
    clearObjects() {
        // Clear ground tiles
        for (const tile of this.groundTiles) {
            this.scene.remove(tile);
            tile.geometry.dispose();
            tile.material.dispose();
        }
        this.groundTiles = [];
        
        // Clear yarns
        for (const yarn of this.yarns) {
            this.scene.remove(yarn.mesh);
            yarn.dispose();
        }
        this.yarns = [];
        
        // Clear triangles
        for (const tri of this.triangles) {
            this.scene.remove(tri.mesh);
            tri.dispose();
        }
        this.triangles = [];
        
        // Clear bridges
        for (const bridge of this.bridges) {
            this.scene.remove(bridge.mesh);
            bridge.dispose();
        }
        this.bridges = [];
    }
    
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
    
    dispose() {
        this.isRunning = false;
        this.clearObjects();
        this.cat.dispose();
        this.renderer.dispose();
    }
}


// Cat Entity - Player character
import { CONFIG } from '../config.js';

export class Cat {
    constructor(scene) {
        this.scene = scene;
        
        // Position state
        this.laneIndex = 1;  // 0=left, 1=center, 2=right
        this.x = CONFIG.LANE_POSITIONS[this.laneIndex];
        this.y = CONFIG.CAT.HEIGHT / 2;
        this.z = 0;
        
        // Lane switching state
        this.isTransitioning = false;
        this.transitionStart = 0;
        this.transitionFromX = 0;
        this.transitionToX = 0;
        
        // Stack of collected yarn (visual meshes) - now a tail!
        this.stack = [];
        this.tailPositions = [];  // Track X positions for wave effect
        
        // Create the mesh
        this.mesh = this.createMesh();
        this.mesh.position.set(this.x, this.y, this.z);
        scene.add(this.mesh);
        
        // Tail config
        this.tailSpacing = 0.6;  // Distance between tail segments
        this.tailHeight = 0.5;   // Height of tail above ground
        this.waveSpeed = 0.15;   // How fast tail follows (0-1)
    }
    
    createMesh() {
        // Simple box for MVP - can be swapped for sprite later
        const geometry = new THREE.BoxGeometry(
            CONFIG.CAT.WIDTH,
            CONFIG.CAT.HEIGHT,
            CONFIG.CAT.DEPTH
        );
        const material = new THREE.MeshLambertMaterial({ 
            color: CONFIG.CAT.COLOR 
        });
        return new THREE.Mesh(geometry, material);
    }
    
    update(deltaTime) {
        // Handle lane transition
        if (this.isTransitioning) {
            const elapsed = performance.now() - this.transitionStart;
            const progress = Math.min(elapsed / CONFIG.LANE_SWITCH_DURATION, 1);
            
            // Smooth easing (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);
            this.x = this.transitionFromX + (this.transitionToX - this.transitionFromX) * eased;
            
            if (progress >= 1) {
                this.isTransitioning = false;
                this.x = this.transitionToX;
            }
        }
        
        // Update mesh position
        this.mesh.position.x = this.x;
        this.mesh.position.z = this.z;
        
        // Update tail with wave effect
        this.updateTail();
    }
    
    updateTail() {
        // Each tail segment follows the one in front with a delay
        // First segment follows the cat, rest follow each other
        
        for (let i = 0; i < this.stack.length; i++) {
            const yarn = this.stack[i];
            
            // Target X position (follows the segment in front)
            let targetX;
            if (i === 0) {
                targetX = this.x;  // First segment follows cat
            } else {
                targetX = this.tailPositions[i - 1];  // Follow previous segment
            }
            
            // Smooth follow (wave effect)
            if (this.tailPositions[i] === undefined) {
                this.tailPositions[i] = this.x;
            }
            this.tailPositions[i] += (targetX - this.tailPositions[i]) * this.waveSpeed;
            
            // Position the yarn ball
            const zOffset = (i + 1) * this.tailSpacing;  // Behind the cat
            
            // Add subtle wave motion
            const waveOffset = Math.sin(Date.now() * 0.005 + i * 0.5) * 0.05;
            const bounceOffset = Math.sin(Date.now() * 0.008 + i * 0.3) * 0.08;
            
            yarn.position.set(
                this.tailPositions[i] + waveOffset,
                this.tailHeight + bounceOffset,
                this.z + zOffset
            );
        }
    }
    
    moveForward(speed) {
        this.z -= speed;  // Negative Z is forward
    }
    
    switchLane(direction) {
        // direction: -1 = left, +1 = right
        if (this.isTransitioning) return false;
        
        const newLaneIndex = this.laneIndex + direction;
        
        // Bounds check
        if (newLaneIndex < 0 || newLaneIndex > 2) return false;
        
        // Start transition
        this.laneIndex = newLaneIndex;
        this.isTransitioning = true;
        this.transitionStart = performance.now();
        this.transitionFromX = this.x;
        this.transitionToX = CONFIG.LANE_POSITIONS[newLaneIndex];
        
        return true;
    }
    
    // Force cat to specific lane (for water section)
    forceLane(laneIndex) {
        if (this.laneIndex === laneIndex && !this.isTransitioning) return;
        
        this.laneIndex = laneIndex;
        this.isTransitioning = true;
        this.transitionStart = performance.now();
        this.transitionFromX = this.x;
        this.transitionToX = CONFIG.LANE_POSITIONS[laneIndex];
    }
    
    // Add yarn to visual tail
    addToStack(color) {
        const geometry = new THREE.SphereGeometry(CONFIG.YARN.RADIUS, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color });
        const yarnMesh = new THREE.Mesh(geometry, material);
        
        // Position behind cat (will be updated in updateTail)
        const zOffset = (this.stack.length + 1) * this.tailSpacing;
        yarnMesh.position.set(this.x, this.tailHeight, this.z + zOffset);
        
        // Add to scene directly (not as child, for independent positioning)
        this.scene.add(yarnMesh);
        this.stack.push(yarnMesh);
        this.tailPositions.push(this.x);
        
        return yarnMesh;
    }
    
    // Remove last yarn from tail (the one furthest back)
    removeFromStack() {
        if (this.stack.length === 0) return null;
        
        const lastYarn = this.stack.pop();
        this.tailPositions.pop();
        this.scene.remove(lastYarn);
        lastYarn.geometry.dispose();
        lastYarn.material.dispose();
        
        return lastYarn;
    }
    
    getStackCount() {
        return this.stack.length;
    }
    
    // Get current lane for collision detection
    getLane() {
        return this.laneIndex;
    }
    
    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }
    
    // Reset for game restart
    reset() {
        // Clear stack/tail
        while (this.stack.length > 0) {
            this.removeFromStack();
        }
        this.tailPositions = [];
        
        // Reset position
        this.laneIndex = 1;
        this.x = CONFIG.LANE_POSITIONS[1];
        this.z = 0;
        this.isTransitioning = false;
        
        this.mesh.position.set(this.x, this.y, this.z);
    }
    
    dispose() {
        // Clean up stack
        while (this.stack.length > 0) {
            this.removeFromStack();
        }
        
        // Clean up main mesh
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}


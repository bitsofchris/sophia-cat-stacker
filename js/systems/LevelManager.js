// Level Manager - Phases, water section, scoring
import { CONFIG } from '../config.js';
import { Bridge } from '../entities/Bridge.js';

export class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.bridges = [];
        this.waterPlane = null;
        this.shorePlane = null;
        
        // Bridge building state
        this.nextBridgeZ = CONFIG.WATER.START_Z;
        this.bridgeTimer = 0;
        this.bridgeBuildInterval = 200; // ms between bridge pieces
    }
    
    createWater() {
        // Water plane
        const waterGeometry = new THREE.PlaneGeometry(
            CONFIG.WATER.WIDTH,
            CONFIG.WATER.DEPTH
        );
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: CONFIG.WATER.COLOR,
            transparent: true,
            opacity: CONFIG.WATER.OPACITY,
            side: THREE.DoubleSide
        });
        this.waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
        
        // Rotate to be horizontal and position
        this.waterPlane.rotation.x = -Math.PI / 2;
        this.waterPlane.position.set(0, -0.1, CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH / 2);
        this.scene.add(this.waterPlane);
        
        // Far shore (goal)
        const shoreGeometry = new THREE.BoxGeometry(
            CONFIG.GROUND.WIDTH,
            CONFIG.GROUND.HEIGHT,
            6
        );
        const shoreMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22  // Forest green
        });
        this.shorePlane = new THREE.Mesh(shoreGeometry, shoreMaterial);
        this.shorePlane.position.set(0, -CONFIG.GROUND.HEIGHT / 2, CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH - 3);
        this.scene.add(this.shorePlane);
    }
    
    buildBridge(cat, onBridgeComplete) {
        const now = performance.now();
        
        // Rate limit bridge building
        if (now - this.bridgeTimer < this.bridgeBuildInterval) {
            return false;
        }
        
        // Check if cat has yarn to spend
        if (cat.getStackCount() <= 0) {
            onBridgeComplete();
            return true;  // Done building (no more yarn)
        }
        
        // Consume one yarn and build bridge piece
        cat.removeFromStack();
        
        const bridge = new Bridge(this.scene, this.nextBridgeZ);
        this.bridges.push(bridge);
        
        // Move to next position
        this.nextBridgeZ -= CONFIG.YARN_BRIDGE_DISTANCE;
        this.bridgeTimer = now;
        
        // Check if reached the shore
        const shoreZ = CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH;
        if (this.nextBridgeZ <= shoreZ) {
            onBridgeComplete();
            return true;
        }
        
        return false;
    }
    
    getBridgeDistance() {
        return this.bridges.length * CONFIG.YARN_BRIDGE_DISTANCE;
    }
    
    getBridgeCount() {
        return this.bridges.length;
    }
    
    getLastBridgeZ() {
        if (this.bridges.length === 0) {
            return CONFIG.WATER.START_Z;
        }
        return this.bridges[this.bridges.length - 1].getZ();
    }
    
    reset() {
        // Clean up bridges
        for (const bridge of this.bridges) {
            bridge.dispose();
        }
        this.bridges = [];
        
        // Remove water
        if (this.waterPlane) {
            this.scene.remove(this.waterPlane);
            this.waterPlane.geometry.dispose();
            this.waterPlane.material.dispose();
            this.waterPlane = null;
        }
        
        // Remove shore
        if (this.shorePlane) {
            this.scene.remove(this.shorePlane);
            this.shorePlane.geometry.dispose();
            this.shorePlane.material.dispose();
            this.shorePlane = null;
        }
        
        this.nextBridgeZ = CONFIG.WATER.START_Z;
        this.bridgeTimer = 0;
    }
    
    dispose() {
        this.reset();
    }
}


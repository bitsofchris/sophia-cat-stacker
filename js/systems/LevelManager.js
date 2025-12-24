// Level Manager - Phases, water section, scoring
import { CONFIG } from '../config.js';
import { Bridge } from '../entities/Bridge.js';

export class LevelManager {
    constructor(scene, waterTexture = null) {
        this.scene = scene;
        this.waterTexture = waterTexture;
        this.bridges = [];
        this.waterPlane = null;
        this.waterSurface = null;
        this.shorePlane = null;
        
        // Bridge building state
        this.nextBridgeZ = CONFIG.WATER.START_Z;
        this.bridgeTimer = 0;
        this.bridgeBuildInterval = 200; // ms between bridge pieces
    }
    
    createWater() {
        // Water surface - solid plane with texture at ground level
        const surfaceGeometry = new THREE.PlaneGeometry(
            CONFIG.WATER.WIDTH + 4,  // Wider than track
            CONFIG.WATER.DEPTH
        );
        
        let surfaceMaterial;
        if (this.waterTexture) {
            surfaceMaterial = new THREE.MeshLambertMaterial({
                map: this.waterTexture,
                color: 0x2266aa,  // Blue tint
                side: THREE.DoubleSide
            });
        } else {
            surfaceMaterial = new THREE.MeshLambertMaterial({
                color: 0x1a3a5c,
                side: THREE.DoubleSide
            });
        }
        
        this.waterSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        this.waterSurface.rotation.x = -Math.PI / 2;
        this.waterSurface.position.set(0, 0, CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH / 2);
        this.scene.add(this.waterSurface);
        
        // Dark water sides (walls to show depth)
        const sideGeometry = new THREE.BoxGeometry(
            CONFIG.WATER.WIDTH + 4,
            1.5,  // Depth visible
            CONFIG.WATER.DEPTH
        );
        const sideMaterial = new THREE.MeshLambertMaterial({
            color: 0x0a1520  // Very dark blue
        });
        this.waterPlane = new THREE.Mesh(sideGeometry, sideMaterial);
        this.waterPlane.position.set(0, -0.75, CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH / 2);
        this.scene.add(this.waterPlane);
        
        // Green island (goal) - lush destination
        const islandGroup = new THREE.Group();
        
        // Main island platform
        const islandGeometry = new THREE.BoxGeometry(8, 1, 12);
        const islandMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22  // Forest green
        });
        const island = new THREE.Mesh(islandGeometry, islandMaterial);
        island.position.set(0, 0, 0);
        islandGroup.add(island);
        
        // Add some "trees" (simple cones) on the island
        const treeColors = [0x228B22, 0x2E8B57, 0x006400];
        for (let i = 0; i < 5; i++) {
            const treeGeometry = new THREE.ConeGeometry(0.5, 1.5, 6);
            const treeMaterial = new THREE.MeshLambertMaterial({
                color: treeColors[i % treeColors.length]
            });
            const tree = new THREE.Mesh(treeGeometry, treeMaterial);
            tree.position.set(
                (Math.random() - 0.5) * 5,
                1.25,
                (Math.random() - 0.5) * 6 - 2
            );
            islandGroup.add(tree);
        }
        
        // Position the whole island
        islandGroup.position.set(0, -0.5, CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH - 6);
        this.scene.add(islandGroup);
        this.shorePlane = islandGroup;
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
        
        // Remove water surface
        if (this.waterSurface) {
            this.scene.remove(this.waterSurface);
            this.waterSurface.geometry.dispose();
            this.waterSurface.material.dispose();
            this.waterSurface = null;
        }
        
        // Remove shore/island
        if (this.shorePlane) {
            this.scene.remove(this.shorePlane);
            // If it's a group, dispose all children
            if (this.shorePlane.children) {
                this.shorePlane.children.forEach(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
            } else {
                if (this.shorePlane.geometry) this.shorePlane.geometry.dispose();
                if (this.shorePlane.material) this.shorePlane.material.dispose();
            }
            this.shorePlane = null;
        }
        
        this.nextBridgeZ = CONFIG.WATER.START_Z;
        this.bridgeTimer = 0;
    }
    
    dispose() {
        this.reset();
    }
}


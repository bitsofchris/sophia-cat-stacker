// Level Manager - Phases, water section, scoring
import { CONFIG } from '../config.js';
import { Bridge } from '../entities/Bridge.js';

export class LevelManager {
    constructor(scene, iceTexture = null, groundTexture = null) {
        this.scene = scene;
        this.iceTexture = iceTexture;
        this.groundTexture = groundTexture;
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
        // Wide ICE plane - extends full visible area
        const iceGeometry = new THREE.PlaneGeometry(
            24,  // Extra wide to fill the view beyond snow banks
            CONFIG.WATER.DEPTH
        );
        
        // Shiny icy blue material with specular highlights
        const iceMaterial = new THREE.MeshPhongMaterial({
            map: this.iceTexture,
            color: 0x88ddff,       // Light icy blue
            specular: 0xffffff,    // White specular highlights
            shininess: 80,         // High shininess for icy look
            reflectivity: 0.8
        });
        
        this.waterSurface = new THREE.Mesh(iceGeometry, iceMaterial);
        this.waterSurface.rotation.x = -Math.PI / 2;
        this.waterSurface.position.set(0, 0.02, CONFIG.WATER.START_Z - CONFIG.WATER.DEPTH / 2);
        this.scene.add(this.waterSurface);
        
        // No extra geometry - keeping it clean
        this.waterPlane = null;
        
        // Island (goal) - uses same texture as road
        const islandGroup = new THREE.Group();
        
        // Main island platform with road texture on top
        const islandGeometry = new THREE.BoxGeometry(8, 1, 12);
        
        // Create materials array for island: textured top, solid sides
        const islandTopMaterial = new THREE.MeshLambertMaterial({
            map: this.groundTexture,
            color: 0xCCCCCC  // Same tint as road
        });
        const islandSideMaterial = new THREE.MeshLambertMaterial({
            color: 0x555555  // Dark sides like the road
        });
        
        // Materials: [right, left, top, bottom, front, back]
        const islandMaterials = [
            islandSideMaterial, islandSideMaterial,
            islandTopMaterial, islandSideMaterial,
            islandSideMaterial, islandSideMaterial
        ];
        
        const island = new THREE.Mesh(islandGeometry, islandMaterials);
        island.position.set(0, 0, 0);
        islandGroup.add(island);
        
        // Christmas Tree - big cone with lights on brown trunk
        const christmasTreeGroup = new THREE.Group();
        
        // Tree trunk (brown vertical rectangle/cylinder)
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Saddle brown
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(0, 0.6, 0);
        christmasTreeGroup.add(trunk);
        
        // Tree cone (green)
        const treeConeGeometry = new THREE.ConeGeometry(1.5, 4, 12);
        const treeConeMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest green
        const treeCone = new THREE.Mesh(treeConeGeometry, treeConeMaterial);
        treeCone.position.set(0, 3.2, 0);
        christmasTreeGroup.add(treeCone);
        
        // Star on top
        const starGeometry = new THREE.OctahedronGeometry(0.3, 0);
        const starMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700, emissive: 0xFFD700, emissiveIntensity: 0.3 }); // Gold
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(0, 5.4, 0);
        star.rotation.y = Math.PI / 4;
        christmasTreeGroup.add(star);
        
        // Christmas lights (small colored spheres around the tree)
        const lightColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF69B4, 0x00FFFF]; // Red, green, blue, yellow, pink, cyan
        for (let layer = 0; layer < 4; layer++) {
            const y = 1.8 + layer * 0.9;
            const radius = 1.2 - layer * 0.25;
            const lightsPerLayer = 6 - layer;
            for (let i = 0; i < lightsPerLayer; i++) {
                const angle = (i / lightsPerLayer) * Math.PI * 2 + layer * 0.5;
                const lightGeometry = new THREE.SphereGeometry(0.12, 8, 8);
                const lightMaterial = new THREE.MeshLambertMaterial({
                    color: lightColors[(layer + i) % lightColors.length],
                    emissive: lightColors[(layer + i) % lightColors.length],
                    emissiveIntensity: 0.5
                });
                const light = new THREE.Mesh(lightGeometry, lightMaterial);
                light.position.set(
                    Math.cos(angle) * radius,
                    y,
                    Math.sin(angle) * radius
                );
                christmasTreeGroup.add(light);
            }
        }
        
        christmasTreeGroup.position.set(0, 0.5, -3);
        islandGroup.add(christmasTreeGroup);
        
        // Presents - boxes with ribbons
        const presentConfigs = [
            { size: [0.8, 0.6, 0.8], pos: [-2, 0.8, -1], boxColor: 0xDC143C, ribbonColor: 0xFFFFFF }, // Red with white
            { size: [0.6, 0.5, 0.6], pos: [-1.2, 0.75, 0.5], boxColor: 0x228B22, ribbonColor: 0xFFD700 }, // Green with gold
            { size: [0.7, 0.7, 0.7], pos: [1.8, 0.85, -0.5], boxColor: 0x4169E1, ribbonColor: 0xFFFFFF }, // Blue with white
            { size: [0.5, 0.4, 0.5], pos: [1.2, 0.7, 1], boxColor: 0x9370DB, ribbonColor: 0xFFD700 }, // Purple with gold
            { size: [0.6, 0.55, 0.6], pos: [-0.5, 0.775, 1.5], boxColor: 0xFF69B4, ribbonColor: 0xFFFFFF }, // Pink with white
        ];
        
        for (const config of presentConfigs) {
            const presentGroup = new THREE.Group();
            
            // Box
            const boxGeometry = new THREE.BoxGeometry(...config.size);
            const boxMaterial = new THREE.MeshLambertMaterial({ color: config.boxColor });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            presentGroup.add(box);
            
            // Horizontal ribbon (wraps around box)
            const hRibbonGeometry = new THREE.BoxGeometry(config.size[0] + 0.02, 0.08, config.size[2] + 0.02);
            const ribbonMaterial = new THREE.MeshLambertMaterial({ color: config.ribbonColor });
            const hRibbon = new THREE.Mesh(hRibbonGeometry, ribbonMaterial);
            hRibbon.position.y = config.size[1] * 0.2;
            presentGroup.add(hRibbon);
            
            // Vertical ribbon (crosses the horizontal)
            const vRibbonGeometry = new THREE.BoxGeometry(0.08, config.size[1] + 0.02, config.size[2] + 0.02);
            const vRibbon = new THREE.Mesh(vRibbonGeometry, ribbonMaterial);
            presentGroup.add(vRibbon);
            
            // Bow on top (two small tilted boxes)
            const bowGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.15);
            const bow1 = new THREE.Mesh(bowGeometry, ribbonMaterial);
            bow1.position.set(-0.1, config.size[1] / 2 + 0.05, 0);
            bow1.rotation.z = 0.4;
            presentGroup.add(bow1);
            
            const bow2 = new THREE.Mesh(bowGeometry, ribbonMaterial);
            bow2.position.set(0.1, config.size[1] / 2 + 0.05, 0);
            bow2.rotation.z = -0.4;
            presentGroup.add(bow2);
            
            presentGroup.position.set(...config.pos);
            presentGroup.rotation.y = Math.random() * 0.5 - 0.25; // Slight random rotation
            islandGroup.add(presentGroup);
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
        
        // Remove water (waterPlane may be null in new simpler approach)
        if (this.waterPlane) {
            this.scene.remove(this.waterPlane);
            if (this.waterPlane.geometry) this.waterPlane.geometry.dispose();
            if (this.waterPlane.material) this.waterPlane.material.dispose();
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


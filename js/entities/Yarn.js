// Yarn Entity - Collectible item
import { CONFIG } from '../config.js';

export class Yarn {
    constructor(scene, x, z) {
        this.scene = scene;
        this.laneIndex = CONFIG.LANE_POSITIONS.indexOf(x);
        this.x = x;
        this.z = z;
        this.collected = false;
        
        // Random color from palette
        this.color = CONFIG.YARN.COLORS[Math.floor(Math.random() * CONFIG.YARN.COLORS.length)];
        
        // Create mesh
        this.mesh = this.createMesh();
        this.mesh.position.set(x, CONFIG.YARN.HOVER_HEIGHT, z);
        scene.add(this.mesh);
    }
    
    createMesh() {
        const geometry = new THREE.SphereGeometry(CONFIG.YARN.RADIUS, 16, 16);
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        return new THREE.Mesh(geometry, material);
    }
    
    update(deltaTime) {
        // Rotate for visual appeal
        this.mesh.rotation.y += CONFIG.YARN.ROTATION_SPEED;
        
        // Slight bobbing motion
        this.mesh.position.y = CONFIG.YARN.HOVER_HEIGHT + Math.sin(Date.now() * 0.003) * 0.1;
    }
    
    collect() {
        this.collected = true;
        this.scene.remove(this.mesh);
    }
    
    getPosition() {
        return { x: this.x, z: this.z };
    }
    
    getLane() {
        return this.laneIndex;
    }
    
    isCollected() {
        return this.collected;
    }
    
    getColor() {
        return this.color;
    }
    
    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}


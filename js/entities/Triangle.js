// Triangle Entity - Obstacle
import { CONFIG } from '../config.js';

export class Triangle {
    constructor(scene, x, z) {
        this.scene = scene;
        this.laneIndex = CONFIG.LANE_POSITIONS.indexOf(x);
        this.x = x;
        this.z = z;
        this.hit = false;
        
        // Create mesh
        this.mesh = this.createMesh();
        this.mesh.position.set(x, CONFIG.TRIANGLE.HOVER_HEIGHT, z);
        scene.add(this.mesh);
    }
    
    createMesh() {
        // Cone geometry for triangle/spike look
        const geometry = new THREE.ConeGeometry(
            CONFIG.TRIANGLE.RADIUS,
            CONFIG.TRIANGLE.HEIGHT,
            8  // segments
        );
        const material = new THREE.MeshLambertMaterial({ 
            color: CONFIG.TRIANGLE.COLOR 
        });
        return new THREE.Mesh(geometry, material);
    }
    
    update(deltaTime) {
        // Rotate for visibility
        this.mesh.rotation.y += CONFIG.TRIANGLE.ROTATION_SPEED;
    }
    
    onHit() {
        this.hit = true;
        this.scene.remove(this.mesh);
    }
    
    getPosition() {
        return { x: this.x, z: this.z };
    }
    
    getLane() {
        return this.laneIndex;
    }
    
    isHit() {
        return this.hit;
    }
    
    dispose() {
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}


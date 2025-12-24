// Spawner System - Procedural object generation
import { CONFIG } from '../config.js';
import { Yarn } from '../entities/Yarn.js';
import { Triangle } from '../entities/Triangle.js';

export class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.yarns = [];
        this.triangles = [];
        this.nextRowZ = -10;  // First row spawn position
    }
    
    getDifficulty(distance) {
        if (distance < CONFIG.DIFFICULTY.EASY_END) return 'easy';
        if (distance < CONFIG.DIFFICULTY.MEDIUM_END) return 'medium';
        return 'hard';
    }
    
    selectPattern(difficulty) {
        const patterns = CONFIG.PATTERNS[difficulty];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    spawnRow(zPosition, difficulty) {
        const pattern = this.selectPattern(difficulty);
        
        // Parse pattern: Y = Yarn, T = Triangle, X = Empty
        for (let i = 0; i < 3; i++) {
            const char = pattern[i];
            const x = CONFIG.LANE_POSITIONS[i];
            
            if (char === 'Y') {
                const yarn = new Yarn(this.scene, x, zPosition);
                this.yarns.push(yarn);
            } else if (char === 'T') {
                const triangle = new Triangle(this.scene, x, zPosition);
                this.triangles.push(triangle);
            }
            // 'X' = empty, do nothing
        }
    }
    
    update(catZ, distance) {
        // Spawn new rows ahead of cat
        const spawnThreshold = catZ - CONFIG.SPAWN_AHEAD_DISTANCE;
        
        while (this.nextRowZ > spawnThreshold) {
            const difficulty = this.getDifficulty(distance);
            this.spawnRow(this.nextRowZ, difficulty);
            this.nextRowZ -= CONFIG.ROW_SPACING;
        }
        
        // Update all objects
        for (const yarn of this.yarns) {
            if (!yarn.isCollected()) {
                yarn.update();
            }
        }
        
        for (const triangle of this.triangles) {
            if (!triangle.isHit()) {
                triangle.update();
            }
        }
        
        // Despawn objects behind cat
        this.despawn(catZ);
    }
    
    despawn(catZ) {
        const despawnThreshold = catZ + CONFIG.DESPAWN_BEHIND_DISTANCE;
        
        // Remove yarns behind camera
        this.yarns = this.yarns.filter(yarn => {
            if (yarn.z > despawnThreshold || yarn.isCollected()) {
                yarn.dispose();
                return false;
            }
            return true;
        });
        
        // Remove triangles behind camera
        this.triangles = this.triangles.filter(triangle => {
            if (triangle.z > despawnThreshold || triangle.isHit()) {
                triangle.dispose();
                return false;
            }
            return true;
        });
    }
    
    getYarns() {
        return this.yarns.filter(y => !y.isCollected());
    }
    
    getTriangles() {
        return this.triangles.filter(t => !t.isHit());
    }
    
    reset() {
        // Clean up all objects
        for (const yarn of this.yarns) {
            yarn.dispose();
        }
        for (const triangle of this.triangles) {
            triangle.dispose();
        }
        
        this.yarns = [];
        this.triangles = [];
        this.nextRowZ = -10;
    }
    
    dispose() {
        this.reset();
    }
}


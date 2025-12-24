// Spawner System - Pre-generated level
import { CONFIG } from '../config.js';
import { Yarn } from '../entities/Yarn.js';
import { Triangle } from '../entities/Triangle.js';

export class Spawner {
    constructor(scene) {
        this.scene = scene;
        this.yarns = [];
        this.triangles = [];
        this.generated = false;
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
    
    // Pre-generate the entire level at once
    generateFullLevel() {
        if (this.generated) return;
        
        // Generate rows from start to just before water
        // Leave some empty space before water for visual clarity
        const startZ = -10;
        const endZ = -(CONFIG.LEVEL_END_DISTANCE - 5);  // Stop 5 units before water
        
        for (let z = startZ; z > endZ; z -= CONFIG.ROW_SPACING) {
            const distance = Math.abs(z);
            const difficulty = this.getDifficulty(distance);
            this.spawnRow(z, difficulty);
        }
        
        this.generated = true;
    }
    
    update(catZ, distance) {
        // No dynamic spawning - level is pre-generated
        
        // Update all objects (rotation animations)
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
        this.generated = false;
    }
    
    dispose() {
        this.reset();
    }
}


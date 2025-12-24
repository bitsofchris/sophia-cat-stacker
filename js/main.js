// Cat Stack Dash - Entry Point
import { Game } from './Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }
    
    // Create and start the game
    const game = new Game(canvas);
    game.start();
    
    // Expose for debugging (optional)
    window.game = game;
    
    console.log('Cat Stack Dash initialized!');
    console.log('Controls: A/D or Arrow Keys to switch lanes, R to restart');
});


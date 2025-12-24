// Cat Stack Dash - Entry Point
import { Game } from './Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const titleScreen = document.getElementById('title-screen');
    const startBtn = document.getElementById('start-btn');
    
    if (!canvas) {
        console.error('Game canvas not found!');
        return;
    }
    
    // Create game instance (renders scene in background)
    const game = new Game(canvas);
    
    // Render initial frame so scene is visible behind title
    game.renderOnce();
    
    // Start game when start button is clicked
    const startGame = () => {
        // Fade out title screen
        titleScreen.classList.add('fade-out');
        
        // Start game after fade animation
        setTimeout(() => {
            titleScreen.classList.add('hidden');
            game.start();
        }, 500);
    };
    
    startBtn.addEventListener('click', startGame);
    
    // Expose for debugging (optional)
    window.game = game;
    
    console.log('Sophia\'s Cat Stacker initialized!');
    console.log('Controls: A/D or Arrow Keys to switch lanes, R to restart');
});



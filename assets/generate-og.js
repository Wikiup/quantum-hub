// Simple Node script to generate OG image using canvas
const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(1200, 630);
const ctx = canvas.getContext('2d');

// Background gradient
const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
gradient.addColorStop(0, '#0f172a');
gradient.addColorStop(0.5, '#1e293b');
gradient.addColorStop(1, '#0f172a');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Grid pattern
ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
ctx.lineWidth = 1;
for (let i = 0; i < canvas.width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
}
for (let i = 0; i < canvas.height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
}

// Draw wheel
function drawWheel(x, y, r) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#6C5CE7', '#A8E6CF'];
    const segments = 6;
    const arc = (2 * Math.PI) / segments;
    
    ctx.save();
    ctx.translate(x, y);
    
    for (let i = 0; i < segments; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, r, i * arc, (i + 1) * arc);
        ctx.lineTo(0, 0);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.restore();
}

// Draw dice
function drawDice(x, y, size) {
    const diceGradient = ctx.createLinearGradient(x, y, x + size, y + size);
    diceGradient.addColorStop(0, '#10b981');
    diceGradient.addColorStop(1, '#059669');
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 12);
    
    const radius = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.fillStyle = diceGradient;
    ctx.fill();
    
    ctx.fillStyle = 'white';
    const dotSize = size * 0.12;
    const positions = [[size*0.25,size*0.25],[size*0.75,size*0.25],[size*0.5,size*0.5],[size*0.25,size*0.75],[size*0.75,size*0.75]];
    positions.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, dotSize, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    ctx.restore();
}

// Draw coin
function drawCoin(x, y, r) {
    const coinGradient = ctx.createRadialGradient(x, y, r * 0.3, x, y, r);
    coinGradient.addColorStop(0, '#fbbf24');
    coinGradient.addColorStop(0.7, '#f59e0b');
    coinGradient.addColorStop(1, '#d97706');
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = coinGradient;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(x, y, r * 0.85, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = `bold ${r * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x, y);
}

drawWheel(950, 150, 120);
drawDice(100, 100, 100);
drawCoin(1050, 480, 60);

// Main text with glow
ctx.shadowBlur = 40;
ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
ctx.font = 'bold 96px Arial, sans-serif';
ctx.fillStyle = 'white';
ctx.textAlign = 'left';
ctx.fillText('Quantum Hub', 80, 300);
ctx.shadowBlur = 0;

// Subtitle
const textGradient = ctx.createLinearGradient(80, 350, 600, 350);
textGradient.addColorStop(0, '#06b6d4');
textGradient.addColorStop(1, '#3b82f6');
ctx.font = 'bold 48px Arial, sans-serif';
ctx.fillStyle = textGradient;
ctx.fillText('Ultimate Randomizer', 80, 380);

// Tagline
ctx.font = '32px Arial, sans-serif';
ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
ctx.fillText('Spin • Roll • Flip • Decide', 80, 460);

// Feature pills
const features = ['Spin Wheel', 'Dice Roll', 'Coin Flip'];
let pillX = 80;
const pillY = 530;

ctx.font = 'bold 18px Arial, sans-serif';
features.forEach((feature) => {
    const pillWidth = ctx.measureText(feature).width + 40;
    
    ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillWidth, 40, 20);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#06b6d4';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(feature, pillX + 20, pillY + 20);
    
    pillX += pillWidth + 15;
});

// URL
ctx.font = '24px Arial, sans-serif';
ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
ctx.fillText('quantum-hub-fuk.pages.dev', 80, 600);

// Save
const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });
fs.writeFileSync('og-image.jpg', buffer);
console.log('✅ OG image generated: og-image.jpg');

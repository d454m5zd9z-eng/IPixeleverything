// --- INTENSE EARTH DEFENSE SHOOTER ---
function initAsteroidShooter() {
    // Player flying in orbit above the Earth
    let player = { x: 370, y: 520, w: 60, h: 40, speed: 9.5 };
    let lasers = [];
    let asteroids = [];
    let particles = [];
    let stars = [];
    let score = 0;
    let maxHealth = 20;
    let health = 20;
    let spawnTimer = 0;
    let gameOver = false;
    let leaderboardChecked = false;
    
    let shakeIntensity = 0;

    restartCallback = () => { initAsteroidShooter(); };

    keys = {};

    for (let i = 0; i < 60; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.4 + 0.1
        });
    }

    function createExplosion(x, y, color, count = 16) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                radius: Math.random() * 3 + 1,
                alpha: 1,
                decay: Math.random() * 0.015 + 0.01,
                color: color
            });
        }
    }

    function fireSingleLaser() {
        if (gameOver) return;
        lasers.push({ x: player.x + player.w/2 - 3, y: player.y, w: 6, h: 18, speed: 15.5 });
    }

    function triggerDamage(amount) {
        health -= amount;
        shakeIntensity = 12; 
        if (health <= 0) { 
            health = 0; 
            gameOver = true; 
            shakeIntensity = 0; 
        }
    }

    function update() {
        if (gameOver) {
            if (!leaderboardChecked) {
                leaderboardChecked = true;
                checkAndSaveScore('asteroidshooter', score);
            }
            return;
        }

        if (shakeIntensity > 0) {
            shakeIntensity *= 0.88;
            if (shakeIntensity < 0.2) shakeIntensity = 0;
        }

        let moveLeft = keys['arrowleft'] || keys['keya'] || keys['a'] || keys['ArrowLeft'];
        let moveRight = keys['arrowright'] || keys['keyd'] || keys['d'] || keys['ArrowRight'];

        if (moveLeft && player.x > 10) player.x -= player.speed;
        if (moveRight && player.x < canvas.width - player.w - 10) player.x += player.speed;

        if (spawnTimer % 2 === 0) {
            particles.push({
                x: player.x + player.w / 2 + (Math.random() - 0.5) * 14,
                y: player.y + player.h - 4,
                vx: (Math.random() - 0.5) * 1.5,
                vy: Math.random() * 3 + 2,
                radius: Math.random() * 2.5 + 1,
                alpha: 0.7,
                decay: 0.035,
                color: Math.random() > 0.4 ? '#3adfff' : '#df4f39'
            });
        }

        stars.forEach(s => {
            s.y += s.speed;
            if (s.y > canvas.height) s.y = 0;
        });

        lasers.forEach((l, index) => {
            l.y -= l.speed;
            if (l.y < 0) lasers.splice(index, 1);
        });

        let currentBaseSpeed = 1.1 + (score / 4000);
        if (currentBaseSpeed > 5.5) currentBaseSpeed = 5.5; 

        spawnTimer++;
        let spawnInterval = Math.max(45, 90 - Math.floor(score / 1500));
        
        if (spawnTimer % spawnInterval === 0) {
            let size = Math.random() * 25 + 38; 
            
            let points = [];
            let jaggedness = 5;
            for (let p = 0; p < 8; p++) {
                let angle = (p / 8) * Math.PI * 2;
                let offset = (Math.random() - 0.5) * jaggedness;
                points.push({
                    x: Math.cos(angle) * (size / 2 + offset),
                    y: Math.sin(angle) * (size / 2 + offset)
                });
            }

            asteroids.push({
                x: Math.random() * (canvas.width - 80) + 40,
                y: -60,
                size: size,
                points: points,
                speed: currentBaseSpeed + Math.random() * 0.7,
                rotation: 0,
                rotSpeed: (Math.random() - 0.5) * 0.025
            });
        }

        // Atmosphere collision boundary
        let earthCollisionY = canvas.height - 40;

        asteroids.forEach((ast, aIndex) => {
            ast.y += ast.speed;
            ast.rotation += ast.rotSpeed;

            // ASTEROID HITS THE EARTH
            if (ast.y + ast.size/2 >= earthCollisionY) {
                createExplosion(ast.x, earthCollisionY, '#44aaff', 16);
                asteroids.splice(aIndex, 1);
                triggerDamage(2); 
                return;
            }

            // ASTEROID HITS PLAYER SHIP
            if (ast.x - ast.size/2 < player.x + player.w && ast.x + ast.size/2 > player.x &&
                ast.y - ast.size/2 < player.y + player.h && ast.y + ast.size/2 > player.y) {
                    createExplosion(ast.x, ast.y, '#df4f39', 25);
                    asteroids.splice(aIndex, 1);
                    triggerDamage(3); 
                    return;
            }

            lasers.forEach((l, lIndex) => {
                let dist = Math.hypot(l.x - ast.x, l.y - ast.y);
                let hitTolerance = (ast.size / 2) + 22; 
                if (dist < hitTolerance) {
                    createExplosion(ast.x, ast.y, '#ff8800', 16);
                    createExplosion(ast.x, ast.y, '#ffff55', 6);
                    asteroids.splice(aIndex, 1);
                    lasers.splice(lIndex, 1);
                    score += 100;
                }
            });
        });

        particles.forEach((p, pIdx) => {
            p.x += p.vx; p.y += p.vy; p.alpha -= p.decay;
            if (p.alpha <= 0) particles.splice(pIdx, 1);
        });
    }

    function draw() {
        ctx.save();
        
        if (shakeIntensity > 0) {
            let dx = (Math.random() - 0.5) * shakeIntensity;
            let dy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(dx, dy);
        }

        ctx.fillStyle = '#030407';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.speed * 1.8})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // --- BACKGROUND GRAPHIC: PLANET EARTH ---
        // Sits perfectly at the bottom of the new 750px tall screen
        let earthY = canvas.height + 180; 
        let earthRadius = 300;
        
        // 1. Atmosphere Glow (Flashes red when taking damage!)
        let glowColorStart = shakeIntensity > 0 ? 'rgba(255, 50, 50, 0.25)' : 'rgba(0, 140, 255, 0.25)';
        let glowColorMid = shakeIntensity > 0 ? 'rgba(255, 50, 50, 0.12)' : 'rgba(0, 80, 220, 0.12)';
        
        let glowGrd = ctx.createRadialGradient(canvas.width/2, earthY, earthRadius - 20, canvas.width/2, earthY, earthRadius + 60);
        glowGrd.addColorStop(0, glowColorStart);
        glowGrd.addColorStop(0.4, glowColorMid);
        glowGrd.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGrd;
        ctx.beginPath();
        ctx.arc(canvas.width/2, earthY, earthRadius + 60, 0, Math.PI * 2);
        ctx.fill();

        // 2. Earth Planet Body Surface
        let earthGrd = ctx.createRadialGradient(canvas.width/2, earthY - 50, 10, canvas.width/2, earthY, earthRadius);
        earthGrd.addColorStop(0, '#0d2b45'); 
        earthGrd.addColorStop(0.7, '#061624'); 
        earthGrd.addColorStop(1, '#02070d'); 
        ctx.fillStyle = earthGrd;
        ctx.beginPath();
        ctx.arc(canvas.width/2, earthY, earthRadius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Continental Landmass
        ctx.fillStyle = 'rgba(16, 145, 100, 0.15)'; 
        ctx.beginPath();
        ctx.arc(canvas.width/2 - 120, earthY - 60, 90, 0, Math.PI * 2);
        ctx.arc(canvas.width/2 + 160, earthY - 40, 75, 0, Math.PI * 2);
        ctx.arc(canvas.width/2, earthY - 90, 50, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // Draw tactical spacecraft fighter jet
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#df4f39';
        ctx.fillStyle = '#df4f39';
        ctx.strokeStyle = '#ff7755';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(player.x + player.w/2, player.y);
        ctx.lineTo(player.x + player.w, player.y + player.h);
        ctx.lineTo(player.x + player.w - 12, player.y + player.h - 6);
        ctx.lineTo(player.x + 12, player.y + player.h - 6);
        ctx.lineTo(player.x, player.y + player.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        lasers.forEach(l => {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#3adfff';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(l.x, l.y, l.w, l.h);
            ctx.fillStyle = 'rgba(58, 223, 255, 0.4)';
            ctx.fillRect(l.x - 2, l.y, l.w + 4, l.h);
            ctx.restore();
        });

        asteroids.forEach(ast => {
            ctx.save();
            ctx.translate(ast.x, ast.y);
            ctx.rotate(ast.rotation);
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff5500';
            ctx.fillStyle = '#171a24';
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(ast.points[0].x, ast.points[0].y);
            for (let i = 1; i < ast.points.length; i++) {
                ctx.lineTo(ast.points[i].x, ast.points[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });

        // HUD - Scoreboard
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Space Grotesk", sans-serif';
        ctx.fillText(`SCORE: ${score}`, 30, 45);

        // HUD - Escort Hull Integrity Gauge
        ctx.font = '12px monospace';
        ctx.fillStyle = '#8b95a1';
        ctx.fillText(`EARTH SHIELDS:`, 500, 45);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 2;
        ctx.strokeRect(615, 34, 155, 14);
        
        let healthRatio = health / maxHealth;
        ctx.fillStyle = health > 9 ? '#10b981' : health > 4 ? '#f59e0b' : '#df4f39';
        ctx.fillRect(618, 37, 149 * healthRatio, 8);

        if (gameOver) {
            ctx.fillStyle = 'rgba(3, 4, 7, 0.92)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#df4f39';
            ctx.font = '700 36px "Space Grotesk"';
            ctx.textAlign = 'center';
            ctx.fillText("EARTH DEFENSES COMPROMISED", canvas.width/2, 220);

            ctx.fillStyle = '#8b95a1';
            ctx.font = '14px monospace';
            ctx.fillText("PRESS 'R' TO RESTART SEQUENCE", canvas.width/2, 260);
            ctx.textAlign = 'left';

            drawLeaderboard('asteroidshooter', canvas.width/2 - 85, 330);
        }
        
        ctx.restore();
    }

    const handleKeyDown = (e) => {
        if (gameOver) return;
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            fireSingleLaser();
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    function loop() {
        update(); draw();
        animationFrameId = requestAnimationFrame(loop);
    }
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    loop();
}
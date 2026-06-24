// --- VERTICAL NEON ASCENT (UPWARD JUMPER) ---
function initRetroJumper() {
    let player = { 
        x: canvas.width / 2 - 15, 
        y: canvas.height - 150, 
        w: 30, h: 30, 
        vx: 0, vy: 0, 
        speed: 7, 
        jumpPower: -14, 
        gravity: 0.5 
    };

    let platforms = [];
    let particles = [];
    let stars = [];
    
    let score = 0;
    let cameraY = 0;
    let gameOver = false;
    let leaderboardChecked = false;

    restartCallback = () => { initRetroJumper(); };
    keys = {};

    // Generate initial background stars
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            alpha: Math.random()
        });
    }

    // Function to generate platforms
    function spawnPlatform(yLevel) {
        let width = Math.random() * 40 + 50; // Random width between 50 and 90
        platforms.push({
            x: Math.random() * (canvas.width - width),
            y: yLevel,
            w: width,
            h: 12,
            type: Math.random() > 0.8 ? 'moving' : 'static',
            vx: Math.random() > 0.5 ? 2 : -2
        });
    }

    // Initial setup: create the starting platform and the first upward sequence
    platforms.push({ x: canvas.width / 2 - 50, y: canvas.height - 20, w: 100, h: 12, type: 'static', vx: 0 });
    for (let i = 1; i < 12; i++) {
        spawnPlatform(canvas.height - (i * 85)); // Space them vertically
    }

    function createBounceDust(px, py) {
        for (let i = 0; i < 8; i++) {
            particles.push({
                x: px + Math.random() * player.w,
                y: py + player.h,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 2,
                size: Math.random() * 3 + 1,
                life: 1,
                color: '#ff007a'
            });
        }
    }

    function update() {
        if (gameOver) {
            if (!leaderboardChecked) {
                leaderboardChecked = true;
                checkAndSaveScore('retrojumper', Math.floor(score));
            }
            return;
        }

        // Horizontal Movement
        let moveLeft = keys['arrowleft'] || keys['keya'] || keys['a'] || keys['ArrowLeft'];
        let moveRight = keys['arrowright'] || keys['keyd'] || keys['d'] || keys['ArrowRight'];

        if (moveLeft) player.vx = -player.speed;
        else if (moveRight) player.vx = player.speed;
        else player.vx *= 0.8; // Friction

        player.x += player.vx;

        // Screen Wrap-around (Left to Right)
        if (player.x + player.w < 0) player.x = canvas.width;
        if (player.x > canvas.width) player.x = -player.w;

        // Vertical Movement (Gravity)
        player.vy += player.gravity;
        player.y += player.vy;

        // Platform Collision (Only bounce when falling downward)
        if (player.vy > 0) {
            platforms.forEach(plat => {
                if (player.x + player.w - 5 > plat.x && 
                    player.x + 5 < plat.x + plat.w && 
                    player.y + player.h > plat.y && 
                    player.y + player.h < plat.y + 20) { // 20 is tolerance so we don't fall through
                        
                        player.y = plat.y - player.h;
                        player.vy = player.jumpPower;
                        createBounceDust(player.x, player.y);
                }
            });
        }

        // Camera Scrolling (Move everything down when player reaches upper half)
        if (player.y < canvas.height / 2) {
            let diff = (canvas.height / 2) - player.y;
            player.y = canvas.height / 2;
            score += diff / 10; // Increase score as you go higher

            // Move platforms down
            platforms.forEach(plat => {
                plat.y += diff;
            });
            
            // Move stars down for parallax effect
            stars.forEach(s => {
                s.y += diff * 0.2;
                if (s.y > canvas.height) {
                    s.y = 0;
                    s.x = Math.random() * canvas.width;
                }
            });
        }

        // Manage Platforms (Remove ones below screen, spawn new ones above)
        for (let i = platforms.length - 1; i >= 0; i--) {
            let plat = platforms[i];
            
            // Handle moving platforms
            if (plat.type === 'moving') {
                plat.x += plat.vx;
                if (plat.x < 0 || plat.x + plat.w > canvas.width) {
                    plat.vx *= -1; // Reverse direction at walls
                }
            }

            // Remove if off bottom
            if (plat.y > canvas.height) {
                platforms.splice(i, 1);
                // Spawn a new platform high up above the screen
                let highestPlatY = Math.min(...platforms.map(p => p.y));
                spawnPlatform(highestPlatY - (Math.random() * 40 + 60)); // Randomize jump gaps slightly
            }
        }

        // Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.04;
            if (p.life <= 0) particles.splice(i, 1);
        }

        // Game Over Condition (Falling off the bottom)
        if (player.y > canvas.height) {
            gameOver = true;
        }
    }

    function draw() {
        ctx.save();
        
        // Deep Space Background
        ctx.fillStyle = '#0a0514';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Stars
        stars.forEach(s => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            ctx.fill();
        });

        // Draw Platforms
        platforms.forEach(plat => {
            ctx.shadowBlur = 10;
            ctx.shadowColor = plat.type === 'moving' ? '#ffaa00' : '#ff007a';
            ctx.fillStyle = plat.type === 'moving' ? '#ffaa00' : '#ff007a';
            
            ctx.beginPath();
            ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 6);
            ctx.fill();
            
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // Draw Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        });

        // Draw Player (Neon Cyan Box)
        if (!gameOver) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#3adfff';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(player.x, player.y, player.w, player.h);
            
            ctx.strokeStyle = '#3adfff';
            ctx.lineWidth = 3;
            ctx.strokeRect(player.x - 2, player.y - 2, player.w + 4, player.h + 4);
        }
        ctx.shadowBlur = 0;

        // HUD
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px "Space Grotesk", sans-serif';
        ctx.fillText(`HEIGHT: ${Math.floor(score)}`, 20, 40);

        if (gameOver) {
            ctx.fillStyle = 'rgba(10, 5, 20, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ff007a';
            ctx.font = '700 42px "Space Grotesk"';
            ctx.textAlign = 'center';
            ctx.fillText("FREEFALL DETECTED", canvas.width/2, 220);

            ctx.fillStyle = '#8b95a1';
            ctx.font = '16px monospace';
            ctx.fillText("PRESS 'R' TO RESTART ASCENT", canvas.width/2, 270);
            ctx.textAlign = 'left';

            drawLeaderboard('retrojumper', canvas.width/2 - 85, 340);
        }

        ctx.restore();
    }

    function loop() {
        update();
        draw();
        animationFrameId = requestAnimationFrame(loop);
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    loop();
}
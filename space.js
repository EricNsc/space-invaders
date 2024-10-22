
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;


let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
};

let shipImg;
let shipVelocityX = tileSize;


let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;


let bulletArray = [];
let bulletVelocityY = -10;


let alienBulletArray = [];
let alienBulletVelocityY = 5;


let particleArray = [];
let score = 0;
let highScore = localStorage.getItem("highScore") || 0; 
let gameOver = false;


let backgroundImg;

window.onload = function () {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    
    backgroundImg = new Image();
    backgroundImg.src = "./FUNDO720P.png"; 

    shipImg = new Image();
    shipImg.src = "./navedoeco.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./Monstro_de_Gas.png";
    createAliens();

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        renderGameOver(); 
        return;
    }

    
    context.drawImage(backgroundImg, 0, 0, boardWidth, boardHeight);

    
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true; 
            }

            
            if (Math.random() < 0.001) {
                shootAlienBullet(alien);
            }
        }
    }

    
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;

                
                createParticles(alien, 'orange');
            }
        }
    }

    
    for (let i = 0; i < alienBulletArray.length; i++) {
        let alienBullet = alienBulletArray[i];
        alienBullet.y += alienBulletVelocityY;
        context.fillStyle = "red";
        context.fillRect(alienBullet.x, alienBullet.y, alienBullet.width, alienBullet.height);

        
        if (detectCollision(alienBullet, ship)) {
            gameOver = true; 
             
        }
    }

    
    bulletArray = bulletArray.filter(b => !b.used && b.y > 0);
    alienBulletArray = alienBulletArray.filter(b => b.y < boardHeight);

    
    for (let i = 0; i < particleArray.length; i++) {
        let particle = particleArray[i];
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.size *= 0.95;
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
    }

    particleArray = particleArray.filter(p => p.size > 0.5);

    
    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        alienVelocityX = alienVelocityX > 0 ? alienVelocityX + 0.2 : alienVelocityX - 0.2;
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Pontuação
    context.fillStyle = "black";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function renderGameOver() {
    context.fillStyle = "red";
    context.font = "48px courier";
    context.fillText("GAME OVER", boardWidth / 4, boardHeight / 2);
    
    
    context.fillStyle = "black";
    context.font = "24px courier";
    context.fillText("Score: " + score, boardWidth / 4, boardHeight / 2 + 50);

    
    if (score > highScore) {
        highScore = score; 
        localStorage.setItem("highScore", highScore); 
    }
    context.fillText("High Score: " + highScore, boardWidth / 4, boardHeight / 2 + 100);
}

function createParticles(object, color) {
    let numParticles = 20;
    for (let i = 0; i < numParticles; i++) {
        let particle = {
            x: object.x + object.width / 2,
            y: object.y + object.height / 2,
            size: Math.random() * 3 + 1,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: (Math.random() - 0.5) * 4,
            color: color
        };
        particleArray.push(particle);
    }
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }
        bulletArray.push(bullet);
    }
}

function shootAlienBullet(alien) {
    let bullet = {
        x: alien.x + alien.width / 2 - tileSize / 16,
        y: alien.y + alien.height,
        width: tileSize / 8,
        height: tileSize / 2,
        used: false
    };
    alienBulletArray.push(bullet);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

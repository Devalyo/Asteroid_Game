const game = document.getElementById('game');
const player = document.getElementById('player');
const menu = document.querySelector('.menu');
const start = document.querySelector('.start')
const engine = document.getElementById('engine');

let score = 0;
let melhorScore = localStorage.getItem("score")? localStorage.getItem("score") : 0;

msMenu = document.getElementById('melhorScore');
msMenu.textContent = `${melhorScore}`

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveLeft = true;
    if (e.key === 'ArrowRight') moveRight = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') moveLeft = false;
    if (e.key === 'ArrowRight') moveRight = false;
});


player.style.display = "none"; 
engine.style.display = "none";

let width = game.offsetWidth - 60; 
let height = game.offsetHeight;
let playerPosition = width / 2; 
player.style.left = `${playerPosition}px`;

let moveLeft = false;
let moveRight = false;
let velocity = 0;
const maxSpeed = 15;
const acceleration = 0.5;
const deceleration = 0.8;

/// elementos pro touch, não consegui pensar em outra forma de fazer isso
const metadeEsquerda = document.createElement('div');
metadeEsquerda.style.height = `${game.offsetHeight}px`;
metadeEsquerda.style.width = `${game.offsetWidth / 2}px`;
metadeEsquerda.style.position = 'absolute';
metadeEsquerda.style.left = '0';
game.appendChild(metadeEsquerda);

const metadeDireita = document.createElement('div');
metadeDireita.style.height = `${game.offsetHeight}px`;
metadeDireita.style.width = `${game.offsetWidth / 2}px`;
metadeDireita.style.position = 'absolute';
metadeDireita.style.left = `${game.offsetWidth / 2}px`;
game.appendChild(metadeDireita);

metadeDireita.addEventListener('touchstart', (e) => {
    moveRight = true;
});

metadeDireita.addEventListener('touchend', (e) => {
    moveRight = false;
})

metadeEsquerda.addEventListener('touchstart', (e) => {
    moveLeft = true;
});

metadeEsquerda.addEventListener('touchend', (e) => {
    moveLeft = false;
})

function updatePlayerPosition() {
    if (moveLeft) {
        velocity = Math.max(velocity - acceleration, -maxSpeed); 
    } else if (moveRight) {
        velocity = Math.min(velocity + acceleration, maxSpeed); 
    } else {
        
        if (velocity > 0) {
            velocity = Math.max(velocity - deceleration, 0);
        } else if (velocity < 0) {
            velocity = Math.min(velocity + deceleration, 0);
        }
    }
    
    if (playerPosition <= -20) {
        playerPosition = -20;
        velocity += 5 ; 
    } else if (playerPosition >= width) {
        playerPosition = width;
        velocity -= 5; 
    }
    
    playerPosition += velocity;

    playerPosition = Math.max(-20, Math.min(width, playerPosition));
    player.style.left = `${playerPosition}px`;

    const tiltAngle = (velocity / maxSpeed) * 20; 
    player.style.transform = `rotate(${tiltAngle}deg)`;
}

function animateEngine() {
    let frame = 0; 
    const frames = 4; 
    const frameWidth = 48; 

    setInterval(() => {
        frame = (frame + 1) % frames; 

        engine.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
        engine.style.left = `${playerPosition + 16}px`
        const tiltAngle = (velocity / maxSpeed) * 20; 
        engine.style.transform = `rotate(${tiltAngle}deg)`;
    }, 10); 
}


function isColliding(rect1, rect2) {
    return !(
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom ||
        rect1.right < rect2.left ||
        rect1.left > rect2.right
    );
}

function updateScore() {
    score += 1;
    displayScore(); 
}

function displayScore() {
    const scoreElement = document.querySelector('.score');
    scoreElement.textContent = `Score: ${score}`;
}

function spawnEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.left = `${playerPosition +  Math.random() * width - 200}px`; 
    enemy.style.bottom = `${height}px`; 
    enemy.style.width = `${Math.random() * 20 + 50}px`;
    
    let speed = Math.random() * (5 + (score / 50)) + 2;
    let left = Math.random() * 4 - 2;
    let rotation = 0; 
    game.appendChild(enemy);
    
    const enemyInterval = setInterval(() => {
        const enemyBottom = parseInt(enemy.style.bottom);
        const enemyLeft = parseInt(enemy.style.left);
        if (enemyBottom < -80) {
            enemy.remove();
            clearInterval(enemyInterval);
        }
        if(enemyLeft < 0 || enemyLeft > width + 30)
            {
                left = -left;
            }
            
            rotation += speed * 0.5; 
            enemy.style.transform = `rotate(${rotation}deg)`;
            
            const playerRect = getShrunkRect(player, 50)
            const enemyRect = enemy.getBoundingClientRect();
            
            if (isColliding(playerRect, enemyRect)) {
                clearInterval(enemyInterval);
                gameOver();
    }
            enemy.style.bottom = `${enemyBottom - speed}px`;
            enemy.style.left = `${enemyLeft + left}px`;
        }
        , 20);
        
    }
    
    
    /// a colisão fica muito errada se eu não encolher o retangulo da nave
    function getShrunkRect(element, incremento) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + incremento,
            bottom: rect.bottom - incremento,
            left: rect.left + incremento,
            right: rect.right - incremento,
        };
    }
    
    let musica = null;
    
    function startGame() {
        menu.style.display = "none"; 
        player.style.display = "inline"; 
        engine.style.display = "inline";
        scoreInterval = setInterval(updateScore, 1000)
        movementInterval = setInterval(updatePlayerPosition, 20); 
        setTimeout(() => {
            enemiesInterval = setInterval(spawnEnemy, 500);
        }, 3000);
        musica = new Audio('./veridis.mp3');
        musica.volume = 0.25;
        musica.play();
    }
    
    animateEngine();
    function gameOver()
    {
        clearInterval(scoreInterval);
        clearInterval(movementInterval);
        clearInterval(enemiesInterval);
        musica.pause()
        musica = null;
        
        if(score > melhorScore)
            {
                localStorage.setItem("score", score)
                melhorScore = score;
                msMenu.textContent = `${melhorScore}`
            }
            
            score = 0;
    
    
    let enemies = document.querySelectorAll(".enemy")
    enemies.forEach(enemy => {
        enemy.remove();
        
    });
    
    player.style.display = "none";
    engine.style.display = "none";
    menu.style.display = "flex"
    
}
start.addEventListener('click', startGame); 

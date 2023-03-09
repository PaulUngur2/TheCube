const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const card = document.getElementById("card");
const cardScore = document.getElementById("card-score");

let scoreSFX = new Audio("Sounds/score.wav");
let gameOverSfx = new Audio("Sounds/gameover.mp3");
let newgameSFX = new Audio("Sounds/newgame.mp3");
let restartSFX = new Audio("Sounds/restart.mp3");
//For setInterval, around a second
let presetTime = 1000;   

//Obstacle speed
let enemySpeed = 5;

//Score
let score = 0;
//At score 10, game speeds up
let scoreIncrement = 0;
//Making the user able to score only when jumping over a square
let canScore = true; 

var bg = new Image();
bg.src = "bg1.png";
// Function to start the game   
function startGame() {
    newgameSFX.play();
    player = new Player(150,550,50,"black");
    arrayBlocks = [];
    score = 0;
    scoreIncrement = 0;
    enemySpeed = 5;
    canScore = true;
    presetTime = 1000;
    
}

//Function to restart the game
function restartGame(button){
    card.style.display = "none";
    button.blur();
    startGame();
    requestAnimationFrame(animate);
}

//Infinite line
function drawBackgroundLine() {
    ctx.beginPath();
    ctx.moveTo(0,600);
    ctx.lineTo(1280,600);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.stroke();
}

//Scoreboard
function drawScore() {
    ctx.font = "80px Bradley Hand ITC";
    ctx.fillStyle = 'black';
    let scoreString = score.toString();
    let xOffset = ((scoreString.length - 1)*20);
    ctx.fillText(scoreString, 150 - xOffset, 660);
}

//Random Number Generator
function getRandomNumber(min,max){
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function randomNumberInterval(timeInterval){
    let returnTime = timeInterval;
    if(Math.random() < 0.5){
        returnTime += getRandomNumber(presetTime / 3, presetTime * 1.5);
    }else{
        returnTime -= getRandomNumber(presetTime / 5, presetTime / 2);
    }
    return returnTime;
}

class Player {
    constructor(x,y,size,color){
        //Player
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;

        //These are used for the jump
        this.jumpHeight = 20;
        this.shouldJump = false;
        this.jumpCounter = 0;

    }
    
    draw () {
        this.jump();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }

    jump() {
        if(this.shouldJump){
            this.jumpCounter++;
            if(this.jumpCounter < 15){

                //Goes up
                this.y -=this.jumpHeight;
            }else if(this.jumpCounter>14 && this.jumpCounter < 35){
                this.y += 0;
            }else if(this.jumpCounter < 49){

                //Goes down
                this.y +=this.jumpHeight;
            }
                //End
            if(this.jumpCounter >=48) {
                this.shouldJump = false;
            }
        }
    }
}
let player = new Player(150,550,50,"black");

class AvoidBlock {
    constructor(size,speed){
        this.x = canvas.width + size;
        this.y = 600 - size;
        this.size = size;
        this.color = "red";
        this.slideSpeed = speed;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }
    slide() {
        this.draw();
        this.x -= this.slideSpeed;
    }
}

let arrayBlocks = [];

//Generate blocks
function generateBlocks() {
    let timeDelay = randomNumberInterval(presetTime);
    arrayBlocks.push(new AvoidBlock(50, enemySpeed));

    setTimeout(generateBlocks, timeDelay);

}

//Collision
function squaresColliding(player, block){
    let s1 = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
    let s2 = Object.assign(Object.create(Object.getPrototypeOf(block)), block);

    s2.size = s1.size - 10;
    s2.x = s2.x + 10;
    s2.y = s2.y + 10;
    return !(
        s1.x>s2.x+s2.size || s1.x+s1.size<s2.x || s1.y>s2.y+s2.size || s1.y+s1.size<s2.y
    )
}

// Return true if the player is past the block
function isPastBlock(player,block){
    return(
        player.x + (player.size / 2) > block.x + (block.size / 4) &&
        player.x + (player.size / 2) < block.x + (block.size / 4)*3
    )
}

function IncreaseSpeed() {
    //Checks to see ifit should increase the speed
    if(scoreIncrement + 10 === score){
        scoreIncrement = score;
        enemySpeed++;
        presetTime >= 100 ? presetTime -=100 : presetTime = presetTime / 2;
        //Update Spped
        arrayBlocks.forEach(block => {
            block.slideSpeed = enemySpeed;
        });
    }

}

function Background(){
    this.x = 0;
    this.y = 0;
    this.width = bg.width;
    this.height = bg.height;
    this.render = function() {
        ctx.drawImage(bg, this.x--, 0);
        if ( this.x <= -1580) {
            this.x = 0;
        }
    }
}

var background = new Background();
let animationId = null;
//Renders the animations
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    background.render();
    //Canvas logic
    drawBackgroundLine();
    //Score
    drawScore();
    //Foreground
    player.draw();
    //Increase the speed
    IncreaseSpeed();
    
    arrayBlocks.forEach((arrayBlock, index) => {
        arrayBlock.slide();
        //End game if you hit the square
        if(squaresColliding(player, arrayBlock)){
            gameOverSfx.play();
            cardScore.textContent = score;
            card.style.display = "block";
            cancelAnimationFrame(animationId);
        }
        //Player will get a point
        if(isPastBlock(player, arrayBlock) && canScore){
            canScore = false;
            scoreSFX.currentTime = 0;
            scoreSFX.play();
            score++;
        }
    })
    

}
function playAudio(){
    restartSFX.play();
}

animate();
setTimeout(() => {
    generateBlocks();
}, randomNumberInterval(presetTime))

//Keyboard 
addEventListener("keydown", e=>{
    if(e.code === "Space"){
        if(!player.shouldJump){
            player.jumpCounter = 0;
            player.shouldJump = true;
            canScore = true;
        }
    }
})

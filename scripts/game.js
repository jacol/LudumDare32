// ----------------------- variables
var currentBlocks = [], score, noMistakesText, goodSound, wrongSound;

// ----------------------- consts
var GAME_HEIGHT = 600;
var GAME_WIDTH = 900;
var NEW_WORD_Y_POS = 40;
var GLOBAL_SPEED_MULTIPLIER = 1;
var CAN_MAKE_MISTAKE = true;

var BLOCKS = [
        { word: 'black_square',         score: 3, fallSpeed: 0.9, color: '#000000', type: 'square', x: 25, y: NEW_WORD_Y_POS },
        { word: 'blue_square',          score: 3, fallSpeed: 1.0, color: '#0000ff', type: 'square', x: 25, y: NEW_WORD_Y_POS },
        { word: 'red_square',           score: 3, fallSpeed: 1.1, color: '#ff0000', type: 'square', x: 25, y: NEW_WORD_Y_POS },
        { word: 'black_circle',         score: 2, fallSpeed: 1.4, color: '#000000', type: 'circle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'blue_circle',          score: 2, fallSpeed: 1.5, color: '#0000ff', type: 'circle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'red_circle',           score: 2, fallSpeed: 1.6, color: '#ff0000', type: 'circle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'black_rectangle',      score: 4, fallSpeed: 0.5, color: '#000000', type: 'rectangle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'blue_rectangle',       score: 4, fallSpeed: 0.6, color: '#0000ff', type: 'rectangle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'red_rectangle',        score: 4, fallSpeed: 0.7, color: '#ff0000', type: 'rectangle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'black_arc',            score: 1, fallSpeed: 1.8, color: '#000000', type: 'arc', x: 25, y: NEW_WORD_Y_POS },
        { word: 'blue_arc',             score: 1, fallSpeed: 1.9, color: '#0000ff', type: 'arc', x: 25, y: NEW_WORD_Y_POS },
        { word: 'red_arc',              score: 1, fallSpeed: 2.0, color: '#ff0000', type: 'arc', x: 25, y: NEW_WORD_Y_POS },
        
        
        { word: 'blue_square',          score: -1, fallSpeed: 0.9, color: '#000000', type: 'square', x: 25, y: NEW_WORD_Y_POS },
        { word: 'blue_circle',          score: -1, fallSpeed: 1.0, color: '#0000ff', type: 'square', x: 25, y: NEW_WORD_Y_POS },
        { word: 'red_arc',              score: -1, fallSpeed: 1.1, color: '#ff0000', type: 'square', x: 25, y: NEW_WORD_Y_POS },
        { word: 'black_square',         score: -1, fallSpeed: 1.4, color: '#000000', type: 'circle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'red_circle',           score: -1, fallSpeed: 1.5, color: '#0000ff', type: 'circle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'black_circle',         score: -1, fallSpeed: 1.6, color: '#ff0000', type: 'circle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'black_square',         score: -1, fallSpeed: 0.5, color: '#000000', type: 'rectangle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'blue_square',          score: -1, fallSpeed: 0.6, color: '#0000ff', type: 'rectangle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'orange_square',        score: -1, fallSpeed: 0.7, color: '#ff0000', type: 'rectangle', x: 25, y: NEW_WORD_Y_POS },
        { word: 'nice_arc',             score: -1, fallSpeed: 1.8, color: '#000000', type: 'arc', x: 25, y: NEW_WORD_Y_POS },
        { word: 'orange_arc',           score: -1, fallSpeed: 1.9, color: '#0000ff', type: 'arc', x: 25, y: NEW_WORD_Y_POS },
        { word: 'rec_arc',              score: -1, fallSpeed: 2.0, color: '#ff0000', type: 'arc', x: 25, y: NEW_WORD_Y_POS },
];

var game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'LudumDare32', { preload: preload, create: create, update: update });

function preload() {
    game.load.audio('good', ['assets/good.wav']);
    game.load.audio('wrong', ['assets/wrong.wav']);
}

function create() {
    game.stage.backgroundColor = '#FFFFFF';
    
    for(var i=0;i<5;i++){
        var newBlock = game.make.bitmapData(GAME_WIDTH, GAME_HEIGHT);
        fillBlock(newBlock);
        newBlock.addToWorld();
        currentBlocks.push(newBlock);
    }
    
    createKeyboardCapture();
    createScore();
    
    goodSound = game.add.audio("good");
    wrongSound = game.add.audio("wrong");
}

function update() {
    updateBlocks();
    
    if(noMistakesText != null)
        updateNoMistakes();
}

// ----------------------- create functions
function fillBlock(newBlock){
    var block = getRandomBlock();
    block.x = getRandomInt(15, GAME_WIDTH - 200);
    var score = block.score;
    var fontSize = 12;
    
    newBlock.context.globalAlpha = 1.0;
    newBlock.context.font = fontSize + 'px Courier New';
    newBlock.context.fillStyle = block.color;
    newBlock.context.fillText(block.word, block.x, block.y);
    newBlock.word = block.word;
    newBlock.posX = block.x;
    newBlock.posY = block.y;
    newBlock.fontSize = fontSize;
    newBlock.destroyed = false;
    newBlock.completion = 0;
    newBlock.completed = false;
    newBlock.score = score;
    newBlock.fallSpeed = block.fallSpeed;
    newBlock.blockColor = block.color;
    newBlock.blockType = block.type;
    
    if(newBlock.moveDown == null){
        newBlock.moveDown = function(){
            this.cls();
            var newYPos = this.posY + this.fallSpeed * GLOBAL_SPEED_MULTIPLIER * Math.random();
            
            var x = this.posX;
            
            if(this.blockType === 'square'){
                this.rect(x - 10, newYPos + 4, 20, 20, this.blockColor);
            }
            else if(this.blockType === 'circle'){
                this.circle(x - 10, newYPos + 14, 12, this.blockColor);
            }
            else if(this.blockType === 'rectangle'){
                this.rect(x - 10, newYPos + 4, 50, 20, this.blockColor);
            }
            else if(this.blockType === 'arc'){
                this.context.beginPath();
                this.context.fillStyle = this.blockColor;
                this.context.arc(x, newYPos + 4, 20, 0, 1 * Math.PI, false);
                this.context.fill();
            }
            
            for (var i = 0; i < this.word.length; i++)
            {
                var letter = this.word.charAt(i);
                
                if (i < this.completion) {
                    this.context.fillStyle = '#00ff00';
                }
                else {
                    this.context.fillStyle = this.blockColor;
                }
                
                if(this.completed){
                    if(this.score < 0)
                        this.context.fillStyle = '#ff0000';
                    else
                        this.context.fillStyle = '#00ff00';
                }
        
                this.context.font = this.fontSize + 'px Courier New';
                this.context.fillText(letter, x, newYPos);
        
                x += this.context.measureText(letter).width;
            }
            
            this.posY = newYPos;
        }
    }
    
    if(newBlock.grow == null){
        newBlock.grow = function(){
            this.fontSize += 10;
            this.context.globalAlpha -= 0.05;
            
            if(this.fontSize > 300 || this.context.globalAlpha <= 0.0)
                this.destroyed = true;
        }
    }
    
    return newBlock;
}

function updateNoMistakes(){
    if(!noMistakesText.destroyed){
        
        noMistakesText.fontSize += 0.8;
        noMistakesText.alpha -= 0.01;
    
        if(noMistakesText.fontSize > 300 || noMistakesText.alpha <= 0.0){
            noMistakesText.destroyed = true;
            noMistakesText.text = '';
        }
    }
}

function createKeyboardCapture(){
    game.input.keyboard.addCallbacks(this, null, null, keyPress);
}

function createScore(){
    score = game.add.text(game.world.centerX, 20, 'score: ' + 0);
    score.anchor.set(0.5);
    score.align = 'center';

    score.font = 'Courier New';
    score.fontSize = 24;
    score.fontWeight = 'bold';
    score.fill = '#ec008c';
    score.userScore = 0;
}

// ----------------------- update functions
// ----------------------- update current weapon
function updateBlocks(){
    currentBlocks.forEach(function(currentBlock){
        if(currentBlock.posY >= GAME_HEIGHT + NEW_WORD_Y_POS ||
           currentBlock.destroyed) {
            fillBlock(currentBlock);
        }
        else {
            if(currentBlock.completed)
                currentBlock.grow();
            currentBlock.moveDown();
        }
    });
}

// ----------------------- other gameplay functions
function keyPress(char) {
    if(char === ' ')
        char = '_';
        
    var resetAllCompletions = false;
    
    if(char.charCodeAt(0) === 0) resetAllCompletions = true;
    
    if(!resetAllCompletions){
        currentBlocks.forEach(function(currentBlock){
            if(char === currentBlock.word.charAt(currentBlock.completion)){
                currentBlock.completion++;
                if(currentBlock.completion === currentBlock.word.length){
                    var score = currentBlock.score;
                    addUserScore(score);
                    resetAllCompletions = true;
                    if(score > 0)
                        currentBlock.word = '+' + score;
                    else
                        currentBlock.word = '' + score;
                    currentBlock.completed = true;
                }
            }
            else if(!CAN_MAKE_MISTAKE){
                currentBlock.completion = 0;
            }
        });
    }
    
    if(resetAllCompletions){
        currentBlocks.forEach(function(currentBlock){
            currentBlock.completion = 0;
        });
    }
}

function addUserScore(value){
    score.userScore += value;
    score.text = 'score: ' + score.userScore;

    if(value > 0){
        GLOBAL_SPEED_MULTIPLIER += 0.1;
        goodSound.play();
    }
    else{
        wrongSound.play();
    }
    
        
    if(CAN_MAKE_MISTAKE && GLOBAL_SPEED_MULTIPLIER > 2.0){
        CAN_MAKE_MISTAKE = false;
        GLOBAL_SPEED_MULTIPLIER = 1.0;
        createNoMistkaesNowText();
    }
}

function createNoMistkaesNowText(){
    noMistakesText = game.add.text(game.world.centerX, game.world.centerY, 'NO mistakes from now on !!!');
    noMistakesText.anchor.set(0.5);
    noMistakesText.align = 'center';

    noMistakesText.font = 'Courier New';
    noMistakesText.fontSize = 34;
    noMistakesText.fontWeight = 'bold';
    noMistakesText.fill = '#ff0000';
    noMistakesText.destroyed = false;
}

function getRandomBlock(){
    return BLOCKS[getRandomInt(0, BLOCKS.length - 1)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
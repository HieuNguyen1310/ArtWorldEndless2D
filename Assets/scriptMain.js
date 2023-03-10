//Set up the canvas context drawing method
window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const canvas2 = document.getElementById('canvas2');
    const canvas3 = document.getElementById('canvas3');
    const L_deco = document.getElementById('L_deco');
    const R_deco = document.getElementById('R_deco');
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const ctx2 = canvas2.getContext('2d', { willReadFrequently: true });
    const ctx3 = canvas3.getContext('2d', { willReadFrequently: true });
    const L_ctx = L_deco.getContext('2d', { willReadFrequently: true });
    const R_ctx = R_deco.getContext('2d', { willReadFrequently: true });

//-----------------------------------------------------------------------------------

//Put the Global Value
    //Set the Global canvas size
    const CANVAS_W = canvas.width = 480;
    const CANVAS_H = canvas.height = 270;

    //Global value for Difficulties
    const increaseDiff = 1;

    //The obstacle Array
    let obstacles = [];
    
    //Take the health bar from the HTML doc
    let lives = document.getElementById('lives');

    //Set the Score value
    let score = 0;

    //Set the value for the GameOver func 
    let gameOver = false;

    //Set the value for mode change function(ASCII mode)
    let change = false;

    //Set up the background music
    let music = {
        overworld: new Howl ({
            src: ["./Assets/Sfx/bgMusic.wav"],
            autoplay: true,
            loop: true
        }),
    }

    //Set up the Sound effect
    let sfx = {
        //Sfx for jumping
        jump: new Howl ({
            src: ["./Assets/Sfx/jumpUpSfx.wav"],
            onend: function() {
                setTimeout(() => {
                    sfx.land.play(); 
                }, 50);
            }
        }),
        //Sfx for landing
        land: new Howl ({
            src: ["./Assets/Sfx/landSfx.wav"],
            loop: false,

        }),
        //Sfx for game over
        over: new Howl ({
            src: ["./Assets/Sfx/overSfx.wav"],
        })
    }
    
    //Set up the keyboard eventlistener
    class InputHandle {
        constructor(){
            this.keys = [];
            //Listen to the keydown event
            window.addEventListener('keydown', e => {
                
                if ( e.code === 'Space' && this.keys.indexOf(e.code) === -1 && !gameOver){
                    this.keys.push(e.code);
                }  else if (e.code === 'Space' && this.keys.indexOf(e.code) === -1) {location.reload()};
                console.log(this.keys);
                
            });
            //Listen to the keyup event
            window.addEventListener('keyup', e => {
            
                if ( e.code === 'Space'){
                    this.keys.splice(this.keys.indexOf(e.code), 1);
                }
                console.log(this.keys);
                
            });
            
        }
    }


    //Set up the player Sprite Sheet
    class Player {
        constructor(gameWidth, gameHeight){

            //Basic set up for the variables
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            //Size of one Frame
            this.width = 50;
            this.height = 100;

            //Player position
            this.pos = 90;
            this.x = this.pos;
            this.y = this.gameHeight - this.height - this.pos;
            this.x2 = this.pos - 3;
            this.y2 = this.gameHeight - this.height - this.pos;
            
            //THe main player
            this.image = document.getElementById('playerSprite');

            //The player's shadow
            this.image2 = document.getElementById('playerSpriteShadow');

            //Spritesheet Frame
            this.frameX = 0;
            this.frameY = 0;

            //Var for jump action
            this.veloY = 0;
            this.gravity = 1.1;
            this.jumpDelay = 10; // higher means slower
            
            //the Fps set up for player
            this.fps = 15;
            this.maxFrame = 0;
            this.frameTimer = 0;
            this.frameInterval = 1000/this.fps;
            

        }

        draw(context){
            // Collison Frame
                // context.strokeStyle = 'green';
                // context.strokeRect(this.x, this.y, this.width, this.height);
                // context.beginPath();
                // context.arc(this.x + this.width/2, this.y + this.height - 25, this.width/2, 0, Math.PI * 2);
                // context.stroke();
            //
            context.drawImage(this.image2, this.width * this.frameX, this.height * this.frameY, this.width, this.height, this.x2, this.y2, this.width, this.height);

            context.drawImage(this.image, this.width * this.frameX, this.height * this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
            
        }
        update(input, deltaTime, obstacles){
            //Collision detect 
            obstacles.forEach(obs => {
                const dx = (obs.x + obs.width/2) - (this.x + this.width/2);
                const dy = (obs.y + obs.height/2) - (this.y + this.height/2);
                let distance = Math.sqrt(dx * dx + dy * dy); 
                let a =  obs.width/2 + this.width/2  - 5;        

                if (distance <= a) {
                    //Health bar
                    lives.value--; 

                    //Initiate Mode Change
                    if (lives.value <= 10) change = true;

                    //Initiate Game Over
                    if (lives.value === 0) gameOver = true;
                } 
            }); 

            //Sprite anim
            if(this.frameTimer > this.frameInterval){
                if(this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } 
            else {
                this.frameTimer += deltaTime;
            }

            //Control
            if (input.keys.indexOf('Space') > -1 && this.onGround()){
                this.veloY -= 40;
                sfx.jump.play();
                
            } 

            //Jump
            this.y += Math.floor(this.veloY / this.jumpDelay);
            this.y2 += Math.floor(this.veloY / this.jumpDelay);

            //On air state
            if (!this.onGround()){
                this.veloY += this.gravity;
                this.frameY = 2;
                this.maxFrame = 7;
            }
            //On ground state
            else {
                this.veloY = 0;
                this.frameY = 1;
                this.maxFrame = 4;
                
            }
            //Prevent falling of the game
            if (this.y > this.gameHeight - this.height){
                this.y = this.gameHeight - this.height;
            }
        }
        //Check if player on the Ground or not
        onGround(){
            return this.y >= this.gameHeight - this.height - this.pos;
            
        }
    }

    //Set up the beginning speed for background
    let bgSpeed = 1;

    //Set up the beginning speed for obtacles       
    let obsSpeed = 1;

    //Set up the background element layer
    const bgLayer1 = document.getElementById('bground');
    const bgLayer2 = document.getElementById('bgLayer2');
    const bgLayer3 = document.getElementById('bgLayer3');
    const bgLayer4 = document.getElementById('bgLayer4');
    const bgLayer5 = document.getElementById('bgLayer5');

    //Set up the moving parallax background
    class Background {
        constructor(gameWidth, gameHeight, image, speedMod){
            //Basic set up
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            //Take the image
            this.image = image;

            //Image position
            this.x = 0;
            this.y = 0;

            //Image size
            this.width = 960;
            this.height = 270;

            //Background moving speed
            this.speedMod = speedMod;
            this.speed = bgSpeed * this.speedMod;

            //For increase the speed of bg
            this.diffDetermine = 0;
            
        }
        draw(context){
            //Draw the 1st image
            context.drawImage(this.image, this.x, this.y, this.width, this.height);

            //Draw the 2nd image
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update(){
            //Loop the background by using the second image
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;

            //increase the speed
            this.diffDetermine++; 
            if (this.diffDetermine % 999 === 0) this.speed += increaseDiff/10;
        
        }
    }

    //Set up the obstacles
    class Obstacle {
        constructor(gameWidth, gameHeight){
            //Basic set up
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;

            //Obstacles size
            this.width = 50;
            this.height = 50;

            //Take the obstacle from HTML doc
            this.image = document.getElementById('obsImg');

            //Obstacles origin position
            this.pos = 90;
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height - this.pos;

            //Speed of the moving obstacle
            this.speed = obsSpeed;

            //Optimize the storage of machine
            this.del = false;

            //Difficulties increase
            this.diffDetermine = 0;
        }
        draw(context){
            //Collison Frame
                // context.strokeStyle = 'green';
                // context.strokeRect(this.x, this.y, this.width, this.height);
                // context.beginPath();
                // context.arc(this.x + this.width/2, this.y + this.height - 25, this.width/2, 0, Math.PI * 2);
                // context.stroke();
            //
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update(){
            this.x -= this.speed ;

            //Increase difficulties
            if (this.x < 0 - this.width){
                this.del = true;
                if ( this.diffDetermine % 1 == 0) obsSpeed += increaseDiff/5; 
            } 
        }
    }
    
    //Obstacles movement and data storage
    function obstacleHandle(deltaTime){
        if (obsTimer > obsInterval + randomObsInterval){
            //Push the existence of the obtacles (if it appear on the screen) into an array 
            obstacles.push(new Obstacle(CANVAS_W, CANVAS_H));

            //Radomize the position by randomize the times that the obs will appear
            randomObsInterval = Math.random() * 1500 + 1000;
            obsTimer = 0;
        }
        else {
            obsTimer += deltaTime;
        }

        //Generate the obs
        obstacles.forEach(obs => {
            obs.draw(ctx);
            obs.update(deltaTime);
        });

        //Remove the obs from the array to decrease the heavy of the RAM
        obstacles = obstacles.filter(obs => !obs.del);
        
    }

    //Update the highscore
    function updateHighScore(context) {
        //Get the current highscore in local storage
        const currHighScore = getHighScore();

        //Compare the present score with the highscore
        if (score > currHighScore) {
            localStorage.setItem("highScore", score);
        }

        //Show the highscore
        context.font = '55px East Sea Dokdo';
        context.fillStyle = 'black';
        context.fillText('High Score: ' + currHighScore, 0, 80);
    }
    
    //Get the highscore
    function getHighScore() {
        return parseInt(localStorage.getItem("highScore")) || 0;
    }

    //Show the score
    function statusText(context){
        context.clearRect(0,0,CANVAS_W,CANVAS_H);
        context.font = '55px East Sea Dokdo';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 0, 30);
        updateHighScore(context);
    }
    
    //Show the Game Over annoucement
    function gameOverText(context) {
        context.font = '50px East Sea Dokdo';
        context.fillStyle = 'black';
        context.fillText("That's all?", 58, 30);
        context.fillText('Space to Retry!',20, 80);
    }

    //Set up the decoration
    class Decoration {
        constructor(gameWidth, gameHeight){
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('bground');
            this.x = 0;
            this.y = 0;
            this.width = 960;
            this.height = 270;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    //Generate in decoration
    const deco = new Decoration(CANVAS_W, CANVAS_H);

    //Generate the keyboard listener
    const input = new InputHandle();

    //Generate the parallax bg with the its own speed
    const bground1 = new Background(CANVAS_W, CANVAS_H, bgLayer1, 0.2)
    const bground2 = new Background(CANVAS_W, CANVAS_H, bgLayer2, 0.4)
    const bground3 = new Background(CANVAS_W, CANVAS_H, bgLayer3, 0.2)
    const bground4 = new Background(CANVAS_W, CANVAS_H, bgLayer4, 0.8)
    const bground5 = new Background(CANVAS_W, CANVAS_H, bgLayer5, 1)
    
    //Put the bg into an array
    const bgroundLayers = [bground1, bground2, bground3, bground4, bground5]; 

    //Generate the player
    const player = new Player(CANVAS_W, CANVAS_H);

    //Set up the var for fps
    let lastTime = 0;
    let obsTimer = 0;
    let obsInterval = 1500;
    let randomObsInterval = Math.random() * 1500 + 1000; 

//ASCII ART 
    //Transform the Pixel's color into character
    class Cell {
        constructor(x, y, symbol, color){
            this.x = x;
            this.y = y;
            this.symbol = symbol;
            this.color = color;
        }
        draw(ctx){
            ctx.font = '10px Courier';
            ctx.fillStyle = this.color;
            ctx.fillText(this.symbol, this.x, this.y);
        }
    }

    //Take the Frame data
    class AsciiEff {
        #imgCellArray = [];
        #pixels = [];
        #ctx;
        #width;
        #height;
        #image
        constructor(ctx, width, height, image){
            //Basic setup
            this.#ctx = ctx;
            this.#width = width;
            this.#height = height;
            this.#image = image;
            
            //With each frame
            this.#ctx.drawImage(this.#image, 0, 0, this.#width, this.#height);

            //Take all the pixel's data
            this.#pixels = this.#ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
        }

        //Convert the pixel's color into symbol according to its value
        #convertToSymbol(sym){
            if ( sym > 250 ) return "@";
            else if ( sym <= 10) return ".";
            else if ( sym < 10 && sym <= 20) return "`";
            else if ( sym < 20 && sym <= 30 ) return "'";
            else if ( sym < 30 && sym <= 40 ) return "^";
            else if ( sym < 40 && sym <= 50 ) return ":";
            else if ( sym < 50 && sym <= 60 ) return "!";
            else if ( sym < 60 && sym <= 70 ) return "~";
            else if ( sym < 70 && sym <= 80 ) return "+";
            else if ( sym < 80 && sym <= 90 ) return "=";
            else if ( sym < 90 && sym <= 100 ) return "?";
            else if ( sym < 100 && sym <= 110 ) return "0";
            else if ( sym < 110 && sym <= 120 ) return "j";
            else if ( sym < 120 && sym <= 130 ) return "2";
            else if ( sym < 130 && sym <= 140 ) return "e";
            else if ( sym < 140 && sym <= 150 ) return "4";
            else if ( sym < 150 && sym <= 160 ) return "5";
            else if ( sym < 160 && sym <= 170 ) return "}";
            else if ( sym < 170 && sym <= 180 ) return "/";
            else if ( sym < 180 && sym <= 190 ) return "B";
            else if ( sym < 190 && sym <= 200 ) return "9";
            else if ( sym < 200 && sym <= 210 ) return "#";
            else if ( sym < 210 && sym <= 220 ) return "%";
            else if ( sym < 220 && sym <= 230 ) return "$";
            else if ( sym < 230 && sym <= 240 ) return "X";
            else if ( sym < 240 && sym <= 250 ) return "@";
            else return '';
        }

        //Scan the image data
        #scanImg(cellSize){
            this.#imgCellArray = [];
            //Scan the image pixel position
            for(let y = 0; y < this.#pixels.height; y += cellSize){
                for(let x = 0; x < this.#pixels.width; x += cellSize){
                    const posX = x * 4;
                    const posY = y * 4;
                    const pos = (posY * this.#pixels.width) + posX;

                    //Calculate the color value of each pixel
                    if (this.#pixels.data[pos + 3] > 128){
                        const a = this.#pixels.data[pos + 3];
                        const r = this.#pixels.data[pos];
                        const g = this.#pixels.data[pos + 1];
                        const b = this.#pixels.data[pos + 2];
                        const total = r + g + b;
                        const aCV = total / 3;
                        const color = "rgba(" + aCV + "," + aCV + "," + aCV + "," + aCV + ")" ;
                        const symbol = this.#convertToSymbol(aCV);
                        if (total > 1 ) this.#imgCellArray.push(new Cell(x, y, symbol, color));
                    }
                }
            }
        }
        //Draw the symbol
        #drawAscii(){
            this.#ctx.clearRect(0, 0, this.#width, this.#height);
            this.#ctx.fillStyle = "#000";
            this.#ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
            for (let i = 0; i < this.#imgCellArray.length; i++){
                this.#imgCellArray[i].draw(this.#ctx);
            }
        }

        draw(cellSize){
            this.#scanImg(cellSize);
            this.#drawAscii();
        }

    }

//-------------------------------------------------------
    let eff;
    function gameOverFunction(){
        //Turn the game to ASCII mode
        if (change) {
                const dataURI = canvas.toDataURL();
                img = new Image();
                img.src = dataURI; 
                eff = new AsciiEff(ctx, img.width, img.height, img);
                eff.draw(5);
        };

        //Display the status
        statusText(ctx2);
        if (!gameOver) {
            requestAnimationFrame(animate);
            score++;
        } 

        //Stop the game
        else {
            gameOverText(ctx3); 
            music.overworld.stop();
            sfx.over.play();
        }
    }

    //Put it on the screen
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        bgroundLayers.forEach(layer => {
            layer.update();
            layer.draw(ctx);
        });
        deco.draw(L_ctx);
        deco.draw(R_ctx);
        obstacleHandle(deltaTime);
        player.draw(ctx);
        player.update(input, deltaTime, obstacles);
        gameOverFunction()
    }
    animate(0);
});


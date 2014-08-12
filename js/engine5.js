var Engine = function(canvasID) {
    // This is required in order to have the proper context in the requestAnimationFrame below400
    var self = this;
    
    var canvas = document.getElementById(canvasID);
    
    // This is where we set variables the engine will need to keep in state
    this.context = canvas.getContext('2d'); // The canvas context where we will render
    this.fps = 60; // Frames per second - so we can gauge performance
    this.lastTime = 0; // used for calculating FPS
    
    this.gameStart = false;
    
    this.moving = null;
    this.position = 400;
    
    this.health = 3;
    this.score = 0;
    
    this.meteors = [];
    this.stars = [];
    
    /*
        ======================= Time based Motion Variables =======================
    */
    // speeds are in px/s
    this.playerSpeed = 200;
    this.meteorSpeed = 175;
    this.starSpeed = 160;
    // Instead of spawning entities randomly, we want to spawn them at a regular interval.
    // Say, a star every 1s and a meteor every 0.5s
    // As well, what if we make the game harder by increasing the speed of falling entities
    // every 5 seconds
    
    // There are two ways we could accomplish this:
    // 1. Use a set interval
    /*
    this.speedUp = setInterval(function() {
        self.meteorSpeed += 15;
        self.starSpeed += 10;
    }, 5000);
    */
    // This is not advisable since the interval will be running separately from our game loop
    
    // 2. Track the last time the event occured and compare to current time.
    // For this, we need to declare the FREQUENCY of events, and the last spawn time
    this.speedUpFrequency = 5000; // 5s
    this.meteorSpawnFrequency = 500; // we can also increase difficulty by decreasing this variable
    this.starSpawnFrequency = 1000;
    
    this.speedUpLastTime = 0;
    this.meteorSpawnLastTime = 0;
    this.starSpwanLastTime = 0;
    
    // Assets and asset loading variables
	this.images = {};
	this.imagesLoaded = 0;
	this.imagesFailed = 0;
	this.imageUrls = [];
	this.imagesIndex = 0;
    
    /*
        ======================= Event Handlers Declaration =======================
    */
    window.onkeypress = function (e) { self.keyPressed(e) };
	window.onkeydown = function (e) { self.keyPressed(e); };
    window.onkeyup = function (e) { self.keyReleased(e); };
    window.onmouseup = function(e) { self.restartGame(e); };
    
    self.initImageAssets.call(self);
};

Engine.prototype.animate = function(time) {
    var self = this;
    
    // Time based motion - determine how long it has been since the last frame
    // This will be in milliseconds
    var elapsedTime = time - this.lastTime;
    
    /*
        ======================= Update =======================
    */
    
    // Update entity positions.
    // Use elapsedTime variable declared above.
    // px to move = entity.speed (px/s) * elapsedTime(ms) * (1s / 1000ms)
    
    // Update player position if there has been a key press
    if (this.moving !== null) {
        if (this.moving == 'left')
            this.position -= this.playerSpeed * (elapsedTime / 1000);
        if (this.moving == 'right')
            this.position += this.playerSpeed * (elapsedTime / 1000);
    }
    
    // Update position of stars and meteors. Any objects below the ground should be removed
    for (var i=0; i < this.meteors.length; i++) {
        this.meteors[i].y += this.meteorSpeed * (elapsedTime / 1000);
        if (this.meteors[i].y > 600)
            this.meteors.splice(i, 1);
    }
    for (var j=0; j < this.stars.length; j++) {
        this.stars[j].y += this.starSpeed * (elapsedTime / 1000);
        if (this.stars[j].y > 600)
            this.stars.splice(j, 1);
    }
    
    // Use our time based event variables to spawn new entites / change the difficulty.
    // We need to update the "Last Spawn / Event" time marker so we don't spawn every frame
    if ((time - this.meteorSpawnLastTime) > this.meteorSpawnFrequency) {
        this.meteors.push(new CelestialObject(0));
        this.meteorSpawnLastTime = time;
    }
    if ((time - this.starSpawnLastTime) > this.starSpawnFrequency){
        this.stars.push(new CelestialObject(50));
        this.starSpawnLastTime = time;
    }
    // Here is where we incorporate the difficulty increase, which happens every 5s.
    // If we wanted it to be smoother, we could use the time variable itself, which is constantly increasing
    if ((time - this.speedUpLastTime) > this.speedUpFrequency) {
        this.meteorSpeed += 15;
        this.starSpeed += 10;
        if (this.meteorSpawnFrequency > 100)
            this.meteorSpawnFrequency -= 26;
        this.speedUpLastTime = time;
    }
    
    // Collision detection with character:
    // Stars will increase the player's score, Meteors will decrease their health
    // Consider the player to be +- 40 from pos and at any y value below ~100. Radius of
    // Meteors is ~ 16, stars is ~14
    
    for (var i=0; i < this.meteors.length; i++) {
        if (this.meteors[i].y > 500) { // Meteor is low enough
            if (Math.abs(this.meteors[i].x - this.position) < 56) {
                // 56 = 40 + 16 - anything less than 56 is a collision
                this.health --;
                // Remove meteor from array
                this.meteors.splice(i, 1);
                break;
            }
        }
    }
    for (var j=0; j < this.stars.length; j++) {
        if (this.stars[j].y > 500) { // star is low enough
            if (Math.abs(this.stars[j].x - this.position) < 54) {
                // 54 = 40 + 14
                this.score += this.stars[j].score;
                // remove star from array
                this.stars.splice(j, 1);
                break;
            }
        }
    }
    
    // lose condition - if player health is 0, end game and show title screen
    if (this.health <= 0)
        this.gameStart = false;
    
    // Calculate FPS
    this.fps = Math.round(1000 / (time - this.lastTime));
    this.lastTime = time;
    
    /*
        ======================= Render =======================
    */
    // Clear last frame's images
    this.context.clearRect(0, 0, 800, 600);
    
    // Draw images using loaded assets
    // Background
    this.context.drawImage(this.images.bg, 0, 0);    
    // Foreground
    this.context.drawImage(this.images.ground, 0, 579);    
    // Draw player
    this.context.drawImage(this.images.player, this.position - 40, 494) // Player image is 80x86, and ground is 21 high    
    // Draw Meteors and Stars
    for (var i=0; i < this.meteors.length; i++)
        this.context.drawImage(this.images.meteor, this.meteors[i].x - 16, this.meteors[i].y - 59); // meteor image is 32 x 75
    for (var j=0; j < this.stars.length; j++)
        this.context.drawImage(this.images.star, this.stars[j].x - 14, this.stars[j].y - 14); // star image is 28 by 28
    
    // UI: Health and Score
    this.context.font = "24px Impact";
    this.context.fillStyle = "#EEE";
    this.context.textAlign = "left";
    this.context.fillText("Score: " + Math.round(this.score), 10, 30);
    for (var i=0; i < this.health; i++) {
        this.context.drawImage(this.images.heart, 760 - (40*i), 10);
    }
    
    // If game is not currently playing, display title screen
    if (!this.gameStart) {
        this.context.drawImage(this.images.menu, 0, 0);
        this.context.font = "16px Impact";
        this.context.textAlign = "center";
        this.context.fillStyle = "#EEE";
        this.context.fillText("Click to play", 400, 300);
        this.context.fillText(" L and R arrows to move", 400, 320);
        
        if (this.score > 0)
            this.context.fillText("Last Score: " + this.score, 400, 380);
    }
    
    // FPS Indicator
    document.getElementById('fps').innerHTML = "FPS: " + this.fps;
    
    /*
        ======================= Call Next Frame =======================
    */
    window.requestAnimationFrame(function(time) {
        self.animate.call(self, time);
    });
};

Engine.prototype.restartGame = function() {
    // reset all variables and begin the game again.
    this.meteors = [];
    this.stars = [];
    this.health = 3;
    this.score = 0;
    this.position = 400;
    
    // Reset time-based variables
    var time = 0;
    this.lastTime = 0;
    this.meteorSpeed = 175;
    this.starSpeed = 160;
    this.meteorSpawnLastTime = 0;
    this.starSpawnLastTime = 0;
    this.meteorSpawnFrequency = 500;
    
    this.gameStart = true;
};

/*
    ======================= Event Handler Functions =======================
*/

Engine.prototype.keyPressed = function(e) {
    // Figure out which key was pressed
    switch(e.keyCode) {
        case 37: this.moving = 'left'; break; // left
        case 39: this.moving = 'right'; break; // right
    }
    
};
Engine.prototype.keyReleased = function(e) {
    this.moving = null;
};

/*
    ======================= Asset Loading =======================
*/

Engine.prototype.initImageAssets = function() {
    /*
        Process:
        We queue all the assets we wish to include in the game. We then continually call our
        loading function. Each time it is called it returns the percentage of assets that are
        loaded. Once we reach 100%, we know all our assets have been loaded, and can 
        continue with starting the game.
    */
    
    var self = this;
    // Image Queue
    this.queueImage("assets/StarfallLogo.png", 'menu');
    this.queueImage("assets/Starfall_Background.png", 'bg');
    this.queueImage("assets/Starfall_Ground.png", 'ground');
    this.queueImage("assets/Starfall_Logo.png", 'logo');
    this.queueImage("assets/Starfall_Player-Medium.png", 'player');
    this.queueImage("assets/Starfall-Meteor.png", 'meteor');
    this.queueImage("assets/Starfall-Star.png", 'star');
    this.queueImage("assets/Starfall_Heart.png", 'heart');
    
    var loadingPercent = 0;
    var interval = setInterval(function(e) {
        // continually load images and check on our progress
        loadingPercent = self.loadImages();
        // Loading bar changes width so users can see progress
        document.getElementById('loadingBar').style.width = loadingPercent*800/100 + "px";
        console.log("Images loading: " + loadingPercent + "%");
        if (loadingPercent == 100) {
            clearInterval(interval);
            document.getElementById('loadingBar').style.opacity = 0; // hide bar
            // Start the game loop
            window.requestAnimationFrame(function (time) {
                self.animate.call(self, time);
            });
        }
    }, 16);
};

Engine.prototype.queueImage = function(url, name) {
    // Adds an image to the queue
    this.imageUrls.push({'url': url, 'name': name});
}

Engine.prototype.loadImage = function(url, name) {
    // Loads a single image when passed its url, and saves it into this.images
    // using the supplied name for future access
    var image = new Image(),
        self = this;
    image.src = url;
    // Record images which were both successful AND failed so we can tell how many of our
    // assets were attempted
    image.addEventListener('load', function(e) {
        self.imagesLoaded ++;
    });
    image.addEventListener('error', function(e) {
        self.imagesFailed ++;
    });
    this.images[name] = image;
};

Engine.prototype.loadImages = function() {
    // Attempt to load the next asset in the queue
    if (this.imagesIndex < this.imageUrls.length) {
        this.loadImage(this.imageUrls[this.imagesIndex].url, this.imageUrls[this.imagesIndex].name);
        this.imagesIndex ++;
    }
    // Return what percentage of assets have been attempted
    return (this.imagesLoaded + this.imagesFailed) / this.imageUrls.length * 100;
}

/*
    ======================= Meteor and Star objects =======================
*/
// Meteors and Stars are similar, but have slightly different effects, so I have chosen to group
// them into one Celestial Object type
var CelestialObject = function(score) {
    this.x = Math.random()*800;
    this.y = 0;
    this.score = score;
}
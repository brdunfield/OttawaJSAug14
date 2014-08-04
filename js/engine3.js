var Engine = function(canvasID) {
    // This is required in order to have the proper context in the requestAnimationFrame below
    var self = this;
    
    var canvas = document.getElementById(canvasID);
    
    // This is where we set variables the engine will need to keep in state
    this.context = canvas.getContext('2d'); // The canvas context where we will render
    this.fps = 60; // Frames per second - so we can gauge performance
    this.lastTime = 0; // used for calculating FPS
    
    this.moving = null;
    this.position = 400;
    
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
    
    self.initImageAssets.call(self);
};

Engine.prototype.animate = function(time) {
    var self = this;
    
    /*
        ======================= Update =======================
    */
    
    // Update player position if there has been a key press
    if (this.moving !== null) {
        if (this.moving == 'left')
            this.position -=2;
        if (this.moving == 'right')
            this.position +=2;
    }
    
    
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
    
    // FPS Indicator
    document.getElementById('fps').innerHTML = "FPS: " + this.fps;
    
    /*
        ======================= Call Next Frame =======================
    */
    window.requestAnimationFrame(function(time) {
        self.animate.call(self, time);
    });
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
    this.queueImage("assets/Starfall_Background.png", 'bg');
    this.queueImage("assets/Starfall_Ground.png", 'ground');
    this.queueImage("assets/Starfall_Logo.png", 'logo');
    this.queueImage("assets/Starfall_Player-Medium.png", 'player');
    this.queueImage("assets/Starfall-Meteor.png", 'meteor');
    this.queueImage("assets/Starfall-Star.png", 'star');
    
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
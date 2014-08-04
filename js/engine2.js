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
    
    /*
        ======================= Event Handlers Declaration =======================
    */
    window.onkeypress = function (e) { self.keyPressed(e) };
	window.onkeydown = function (e) { self.keyPressed(e); };
    window.onkeyup = function (e) { self.keyReleased(e); };
    
    window.requestAnimationFrame(function (time) {
        // "animate" is the function being called here
        self.animate.call(self, time);
    });
};

Engine.prototype.animate = function(time) {
    var self = this;
    
    /*
        ======================= Update =======================
    */
    
    // Update player position if there has been a key press
    if (this.moving !== null) {
        if (this.position == 'left')
            this.position --;
        if (this.position == 'right')
            this.position ++;
    }
    
    
    // Calculate FPS
    this.fps = Math.round(1000 / (time - this.lastTime));
    this.lastTime = time;
    
    /*
        ======================= Render =======================
    */
    // Clear last frame's images
    this.context.clearRect(0, 0, 800, 600);
    
    
    // Draw player
    this.context.fillStyle = "#000";
    this.context.beginPath();
    this.context.rect(this.position - 25, 500, 50, 100); // -25 compensates for width of player so that this.position is the center of the player image
    this.context.closePath();
    this.context.fill();
    
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
var Engine = function(canvasID) {
    // This is required in order to have the proper context in the requestAnimationFrame below
    var self = this;
    
    var canvas = document.getElementById(canvasID);
    
    // This is where we set variables the engine will need to keep in state
    this.context = canvas.getContext('2d'); // The canvas context where we will render
    this.fps = 60; // Frames per second - so we can gauge performance
    this.lastTime = 0; // used for calculating FPS
    
    window.requestAnimationFrame(function (time) {
        // "animate" is the function being called here
        self.animate.call(self, time);
    });
}

Engine.prototype.animate = function(time) {
    var self = this;
    
    /*
        ======================= Update =======================
    */
    
    // Calculate FPS
    this.fps = Math.round(1000 / (time - this.lastTime));
    this.lastTime = time;
    
    /*
        ======================= Render =======================
    */
    
    // FPS Indicator
    document.getElementById('fps').innerHTML = "FPS: " + this.fps;
    
    /*
        ======================= Call Next Frame =======================
    */
    window.requestAnimationFrame(function(time) {
        self.animate.call(self, time);
    });
}
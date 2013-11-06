//// Controller - Records and manages user input

function Controller() {
    // Define actions
    this.actions = {};
    for (var key in this.ACTION_HASH)
	if (this.ACTION_HASH.hasOwnProperty(key))
	    this.actions[key] = false;
    this.actions.aimDirection = 0;
    this.actions.fire = false;

    this.deltaMouseX = this.deltaMouseY = 0;
    this.previousMouseX = stage.mouseX;
    this.previousMouseY = stage.mouseY;

    // Initialize event listeners
    stage.addEventListener2(KeyboardEvent.KEY_DOWN, this.keyDown, this);
    stage.addEventListener2(KeyboardEvent.KEY_UP, this.keyUp, this);

    stage.addEventListener2(MouseEvent.MOUSE_DOWN, this.mouseDown, this);
    stage.addEventListener2(MouseEvent.MOUSE_UP, this.mouseUp, this);
}

Controller.prototype.ACTION_HASH = {
    "north": [87, 38], // W, up
    "south": [83, 40], // S, down
    "west": [65, 37], // A, left
    "east": [68, 39], // D, right
    "bomb": [17, 32], // control, space
    "select": [13, 32] // enter, space
};

Controller.prototype.update = function(dt) {
    this.deltaMouseX = stage.mouseX - this.previousMouseX;
    this.deltaMouseY = stage.mouseY - this.previousMouseY;
    this.previousMouseX = stage.mouseX;
    this.previousMouseY = stage.mouseY;

    if (this.deltaMouseX || this.deltaMouseY) {
	var newDirection = Math.atan2(this.deltaMouseX, -this.deltaMouseY)*180/Math.PI;
	this.actions.aimDirection += (modulate(newDirection - this.actions.aimDirection))/5*dt;
    }
}

Controller.prototype.keyDown = function(e) {
    //console.log(e.keyCode + " pressed");
    this.keyboardAction(e, true);
};

Controller.prototype.keyUp = function(e) {
    this.keyboardAction(e, false);
};

Controller.prototype.mouseDown = function(e) {
    this.actions.fire = true;
    //console.log("firing");
};

Controller.prototype.mouseUp = function(e) {
    this.actions.fire = false;
    //console.log("not firing");
};

Controller.prototype.keyboardAction = function(e, value) {
    for (var key in this.ACTION_HASH)
	if (this.ACTION_HASH.hasOwnProperty(key))
	    for (var i in this.ACTION_HASH[key])
		if (this.ACTION_HASH[key][i] == e.keyCode) {
		    this.actions[key] = value;
		    //console.log(key + " set to " + value);
		    break;
		}
};

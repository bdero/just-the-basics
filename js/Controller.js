/**
 * @file
 * This file contains the Controller class.
 */

/**
 * The controller listens to for and records user input on a variety of
 * input devices and supplies the game with a uniform way of accessing what
 * actions user is trying to perform.
 *
 * @ctor
 * Constructs a controller.
 */
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

    // Set up pointer lock controls
    Pointer.init();
    Pointer.xBuff = Pointer.yBuff = 0;
    Pointer.move = Controller.pointerLockMove;
    document.addEventListener('click', Controller.pointerLockClick, false);

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

/**
 * Special callback function for mouse clicking to request pointer locking,
 * since the pointer lock API seems to only succeed when requests are made
 * during a click callback (and not other kinds of callbacks, like Ivank.js
 * "callbacks").
 */
Controller.pointerLockClick = function() {
    if (!Pointer.isLocked())
	Pointer.lock();
};

/**
 * Special callback function for mouse movement while pointer locking is
 * activated. The mouse movement is appended to buffers that are accounted
 * for in the controller's update loop (where all the mouse-related action
 * happens).
 */
Controller.pointerLockMove = function(e) {
    //console.log(e.movementX, e.movementY);
    Pointer.xBuff += e.movementX;
    Pointer.yBuff += e.movementY;
};

/**
 * Updates the mouse position and delta movement states based on mouse
 * mouse position difference from the last frame.
 * @tparam float dt The delta time multipler for this frame.
 */
Controller.prototype.update = function(dt) {
    this.deltaMouseX = stage.mouseX - this.previousMouseX;
    this.deltaMouseY = stage.mouseY - this.previousMouseY;
    this.previousMouseX = stage.mouseX;
    this.previousMouseY = stage.mouseY;

    this.deltaMouseX += Pointer.xBuff;
    this.deltaMouseY += Pointer.yBuff;
    Pointer.xBuff = Pointer.yBuff = 0;

    if (this.deltaMouseX || this.deltaMouseY) {
	var newDirection = Math.atan2(this.deltaMouseX, -this.deltaMouseY)*180/Math.PI;
	this.actions.aimDirection += asymptote(
	    modulate(newDirection - this.actions.aimDirection), 5, dt);
    }
};

/**
 * Event listener callback that triggers whenever any keyboard key is pressed. 
 * @tparam KeyboardEvent e Keyboard event generated when triggered by the event listener.
 */
Controller.prototype.keyDown = function(e) {
    //console.log(e.keyCode + " pressed");
    this.keyboardAction(e, true);
};

/**
 * Event listener callback that triggers whenever any keyboard key is released. 
 * @tparam KeyboardEvent e Keyboard event generated when triggered by the event listener.
 */
Controller.prototype.keyUp = function(e) {
    this.keyboardAction(e, false);
};

/**
 * Event listener callback that triggers whenever the left mouse button is pressed. 
 * @tparam MouseEvent e Mouse event generated when triggered by the event listener.
 */
Controller.prototype.mouseDown = function(e) {
    this.actions.fire = true;
    //console.log("firing");
};

/**
 * Event listener callback that triggers whenever the left mouse button is released. 
 * @tparam MouseEvent e Mouse event generated when triggered by the event listener.
 */
Controller.prototype.mouseUp = function(e) {
    this.actions.fire = false;
    //console.log("not firing");
};

/**
 * Changes the input state of the actions that correspond to a given
 * keyboard event. The value of the modified action is changed to
 * the given <code>value</code>.
 * @tparam KeyboardEvent e Keyboard event generated when triggered by one of the event listeners.
 * @tparam boolean value The value to set all changed actions to.
 */
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

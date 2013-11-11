/**
 * @file
 * Basic core functions.
 * This file contains the basic initialization and update functions,
 * as well as several global variables, constants, and miscellaneous
 * functions.
 */

var stage, world, timestamp;

var FRAME_GOAL = 1000/60;

/**
 * Called after the document body loads, this function initializes IvanK.js
 * by constructing a new <code>Stage</code>. It then starts the game by
 * constructing a new <code>World</code> and adding an event listener to the
 * stage for the update function.
 * @see World
 * @see update
 */
function start() {
    // Setup globals
    stage = new Stage('c');
    world = new World(1024, 768);
    stage.addChild(world);

    // Start looping
    timestamp = Date.now();
    stage.addEventListener(Event.ENTER_FRAME, update);
}

/**
 * This function is the update function for everything. It's called on every frame
 * according to an event listener added to the stage by <code>start</code>,
 * generating a new delta time multiplier, centering the stage, and calling
 * the world's update method.
 * @see World
 */
function update() {
    // Time adjustment
    var currentTimestamp = Date.now();
    var dt = (currentTimestamp - timestamp)/FRAME_GOAL;
    timestamp = currentTimestamp;

    stage.x = stage.stageWidth/2;
    stage.y = stage.stageHeight/2;

    world.update(dt);
}

/**
 * Calculates the Pythagorean distance from the origin to a given point.
 * @tparam float a The X-coordinate of the given point.
 * @tparam float b The Y-coordinate of the given point.
 * @treturn float Returns the distance from the origin (0, 0) to the given point (a, b).
 */
function distance(a, b) { return Math.sqrt(a*a + b*b) }


/**
 * Modulates values to fit the range -180 < x <= 180 for rotations involving
 * <code>Math.atan2</code>.
 * @tparam float x Value to be modulated.
 * @treturn float The modulated result.
 */
function modulate(x) {
    while (x > 180) x -= 360;
    while (x <= -180) x += 360;
    return x;
    // Math.atan2 spits out -1 < x <= 1, so the original solution (commented below)
    // doesn't 100% work as expected
    //return (x + 180)%360 - 180;
}

/**
 * Calculates progress in an asymptotic ("easing") function. This is useful when delta
 * time is involved.
 * @tparam float current The distance to traveled (if delta time = infinity).
 * @tparam float dt The delta time multiplier for this frame.
 * @treturn float Returns the progress in an asymptotic function given the parameters.
 */
function asymptote(dist, divisor, dt) {
    return (1 - 1/(dt/divisor + 1))*dist;
}

// Array extensions
Array.prototype.removeObject = function(obj) {
    for (var i = 0; i < this.length; i++)
	if (this[i] === obj) return this.splice(i, 1);

    return null;
};

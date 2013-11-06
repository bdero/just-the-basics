var stage, world, timestamp;

var FRAME_GOAL = 1000/60;


function start() {
    // Setup globals
    stage = new Stage('c');
    world = new World(1024, 768);
    stage.addChild(world);

    // Start looping
    timestamp = Date.now();
    stage.addEventListener(Event.ENTER_FRAME, update);
}

function update() {
    // Time adjustment
    var currentTimestamp = Date.now();
    var dt = (currentTimestamp - timestamp)/FRAME_GOAL;
    timestamp = currentTimestamp;

    stage.x = stage.stageWidth/2;
    stage.y = stage.stageHeight/2;

    world.update(dt);
}


//// Miscellaneous functions

function distance(a, b) { return Math.sqrt(a*a + b*b) }

function modulate(x) {
    while (x > 180) x -= 360;
    while (x <= -180) x += 360;
    return x;
    // Math.atan2 spits out -1() < x <= 1, so the solution below doesn't 100% work as expected
    //return (x + 180)%360 - 180;
}

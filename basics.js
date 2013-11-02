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

    world.update();
}


//// World - Manages entities/boundaries and moves/scales to simulate the camera

function World(width, height) {
    Sprite.call(this);

    this.width = width;
    this.height = height;
    this.x = this.destinationX = this.worldX = -this.width/2;
    this.y = this.destinationY = this.worldY = -this.height*2.5;

    this.destinationZoom = 1;

    // Add background stars
    this.stars = [];
    for (var i = 0; i < 300; i++) {
	var s = new Sprite();
	s.graphics.beginFill(0xffffff, Math.random()*0.25 + 0.75);
	s.graphics.drawCircle(0, 0, Math.random()*2 + 3);
	s.graphics.endFill();
	s.x = Math.random()*width*2 - width/2;
	s.y = Math.random()*height*2 - height/2;
	s.z = Math.random()*1000;
	this.stars.push(s);
	this.addChild(s);
    }

    // Add background grid
    this.graphics.lineStyle(2, 0xffffff, 0.25);
    for (var i = this.BLOCK_SIZE; i < width; i += this.BLOCK_SIZE) {
	this.graphics.moveTo(i, 0);
	this.graphics.lineTo(i, height);
    }
    for (var i = this.BLOCK_SIZE; i < height; i += this.BLOCK_SIZE) {
	this.graphics.moveTo(0, i);
	this.graphics.lineTo(width, i);
    }

    // Add border
    this.graphics.lineStyle(5, 0xffffaa, 0.90);
    this.graphics.moveTo(0, 0);
    this.graphics.lineTo(width, 0);
    this.graphics.lineTo(width, height);
    this.graphics.lineTo(0, height);
    this.graphics.lineTo(0, 0);

    this.entities = [];

    this.player = new Player(width/2, height/2);
    this.addChild(this.player);
    this.entities.push(this.player);
}

World.prototype = new Sprite();
World.prototype.BLOCK_SIZE = 16;

World.prototype.update = function() {
    this.player.update();

    // World scale (camera zoom)
    this.destinationZoom = 1.5 - Math.max(
	Math.abs(this.player.xSpeed), Math.abs(this.player.ySpeed)
    )/this.player.MAX_SPEED*0.2;
    this.scaleX = this.scaleY = this.scaleZ += (this.destinationZoom - this.scaleZ)/30;

    // World position (camera pan)
    this.destinationX = -(this.player.x + this.player.xSpeed*25);
    this.destinationY = -(this.player.y + this.player.ySpeed*25);
    this.worldX += (this.destinationX - this.worldX)/15;
    this.worldY += (this.destinationY - this.worldY)/15;
    this.x = this.worldX*this.scaleX;
    this.y = this.worldY*this.scaleY;
};

function distance(a, b) { return Math.sqrt(a*a + b*b) }


//// Entity - Anything that interacts with the world and requires movement/border enforcement

function Entity(x, y, radius) {
    Sprite.call(this);

    this.x = x;
    this.y = y;
    this.xSpeed = this.ySpeed = 0;
    this.radius = radius;
}

Entity.prototype = new Sprite();

Entity.prototype.update = function() {
    // Update position
    var beforeX = this.x += this.xSpeed;
    var beforeY = this.y += this.ySpeed;

    // Enforce world borders
    this.x = Math.max(this.radius, Math.min(world.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(world.height - this.radius, this.y));
}


//// Player - Entity that's controlled by a Controller

function Player(x, y) {
    Entity.call(this, x, y, World.prototype.BLOCK_SIZE);

    this.destinationDirection = 0;

    this.controller = new Controller();

    // Add player graphic
    this.shape = new Sprite();
    this.shape.graphics.lineStyle(3, 0xffaaff, 0.90)
    this.shape.graphics.moveTo(0, -this.radius);
    this.shape.graphics.lineTo(this.radius, this.radius);
    this.shape.graphics.lineTo(0, this.radius/2);
    this.shape.graphics.lineTo(-this.radius, this.radius);
    this.shape.graphics.lineTo(0, -this.radius);

    this.addChild(this.shape);
}

Player.prototype = new Entity();
Player.prototype.MAX_SPEED = 6;
Player.prototype.ACCEL_SPEED = 0.5;
Player.prototype.DECEL_SPEED = 0.4;
Player.prototype.DIAG_COMPONENT = 1/Math.sqrt(2);

Player.prototype.update = function() {
    // Adjust velocity based on controller
    var xMult = 0;
    var yMult = 0;
    if (this.controller.actions['north']) yMult -= 1;
    if (this.controller.actions['south']) yMult += 1;
    if (this.controller.actions['west']) xMult -= 1;
    if (this.controller.actions['east']) xMult += 1;

    if (xMult || yMult) {
	if (xMult && yMult) {
	    xMult *= this.DIAG_COMPONENT;
	    yMult *= this.DIAG_COMPONENT;
	}

	this.xSpeed += xMult*this.ACCEL_SPEED;
	this.ySpeed += yMult*this.ACCEL_SPEED;

	// Enforce speed limit
	var newSpeed = distance(this.xSpeed, this.ySpeed);
	if (newSpeed > this.MAX_SPEED) {
	    var ratio = this.MAX_SPEED/newSpeed;
	    this.xSpeed *= ratio;
	    this.ySpeed *= ratio;
	}
    } else if (this.xSpeed || this.ySpeed) {
	// Friction
	var speed = distance(this.xSpeed, this.ySpeed);
	var newSpeed = Math.max(0, speed - this.DECEL_SPEED);
	var ratio = newSpeed/speed;
	this.xSpeed *= ratio;
	this.ySpeed *= ratio;
    }

    // Adjust graphic direction based on controller
    if (xMult || yMult)
	this.destinationDirection = Math.atan2(xMult, -yMult);

    var modulate = function(x) {
	while (x > 180) x -= 360;
	while (x <= -180) x += 360;
	return x;
    };
    var deltaDestination = this.destinationDirection*180/Math.PI - this.shape.rotationZ;
    this.shape.rotationZ += modulate(deltaDestination)/10;

    // Run update as an entity
    Entity.prototype.update.call(this);
};


//// Controller - Records and manages user input

function Controller() {
    this.actions = {};
    for (var key in this.ACTION_HASH)
	if (this.ACTION_HASH.hasOwnProperty(key))
	    this.actions[key] = false;

    stage.addEventListener2(KeyboardEvent.KEY_DOWN, this.keyDown, this);
    stage.addEventListener2(KeyboardEvent.KEY_UP, this.keyUp, this);
}

Controller.prototype.ACTION_HASH = {
    "north": [87, 38], // W, up
    "south": [83, 40], // S, down
    "west": [65, 37], // A, left
    "east": [68, 39], // D, right
    "bomb": [17, 32], // control, space
    "select": [13, 32] // enter, space
};

Controller.prototype.keyDown = function(e) {
    //console.log(e.keyCode + " pressed");
    this.keyboardAction(e, true);
};

Controller.prototype.keyUp = function(e) {
    this.keyboardAction(e, false);
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

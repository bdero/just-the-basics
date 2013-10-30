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

    // Ratio
    stage.scaleX = stage.scaleY = stage.scaleZ = stage.scaleX + 0.002;
    //         (Ratio here will change to ship)
    world.x = -(stage.mouseX/stage.stageWidth)*world.width*stage.scaleX - world.width/2;
    world.y = -(stage.mouseY/stage.stageHeight)*world.height*stage.scaleX - world.height/2;
}

function World(width, height) {
    Sprite.call(this);
    this.width = width;
    this.height = height;

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
}

World.prototype = new Sprite();
World.prototype.BLOCK_SIZE = 16;

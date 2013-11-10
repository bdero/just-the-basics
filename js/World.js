/**
 * @file
 * This file contains the World class.
 */

/**
 * The world encapsulates all of the game's objects, including its
 * background grid and stars, borders, and all of the interactive game
 * objects.
 *
 * @ctor
 * Constructs a world of the specified size.
 * @tparam int width The width of the stage in pixels (at 1x scale).
 * @tparam int height The height of the stage in pixels (at 1x scale).
 */
function World(width, height) {
    Sprite.call(this);

    this.width = width;
    this.height = height;
    // Initialize position camera position variables
    this.x = this.destinationX = this.worldX = -this.width/2;
    this.y = this.destinationY = this.worldY = -this.height*2.5;
    // Initialize camera zoom variables
    this.destinationZoom = this.worldZoom = 1;

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

/**
 * Updates the world including all initialized entities. The scale and
 * position of the world are calculated here to simulate camera movement.
 * @tparam float dt The delta time multiplier for this frame.
 */
World.prototype.update = function(dt) {
    for (var i in this.entities)
	this.entities[i].update(dt);
    //this.entities[0].update(dt);

    // World scale (camera zoom)
    this.destinationZoom = 1.5 - Math.max(
	Math.abs(this.player.xSpeed), Math.abs(this.player.ySpeed)
    )/this.player.MAX_SPEED*0.2;

    this.worldZoom += (this.destinationZoom - this.worldZoom)/30*dt;
    this.scaleX = this.scaleY = this.scaleZ = this.worldZoom*
	(stage.stageWidth/1024 + stage.stageHeight/768)/2;

    // World position (camera pan)
    this.destinationX = -(this.player.x + this.player.xSpeed*25);
    this.destinationY = -(this.player.y + this.player.ySpeed*25);
    this.worldX += (this.destinationX - this.worldX)/15*dt;
    this.worldY += (this.destinationY - this.worldY)/15*dt;
    this.x = this.worldX*this.scaleX;
    this.y = this.worldY*this.scaleY;
};

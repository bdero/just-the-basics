/**
 * @file
 * The Enemy tree.
 * This file contains the Enemy class as well as all classes which
 * extend from Enemy.
 */

/**
 * Enemies are entities which position themselves on the world's collision grid. They
 * kill the player upon collision, invoking massive damage. (Please see specific enemies,
 * such as "Giant Enemy Crab")
 *
 * @see Entity
 * @see World
 * @ctor
 * Constructs an enemy entity with the given initial position and collision radius.
 * @tparam float x The initial X-position in the world for the enemy.
 * @tparam float y The initial Y-position in the world for the enemy.
 * @tparam float radius The collision radius for the enemy.
 */
function Enemy(x, y, radius) {
    Entity.call(this, x, y, radius);

    if (x != undefined && y != undefined && radius != undefined) {
	var gridPosition = this.getGridPosition();
	this.gridX = gridPosition[0];
	this.gridY = gridPosition[1];
	world.collisionGrid[this.gridX][this.gridY].push(this);
    }
}

Enemy.prototype = new Entity();

/**
 * Updates the enemy's position on the enemy collision grid, then updates the enemy's
 * position for the world by calling the parent class <code>Entity</code>'s update method.
 * @see Entity
 * @see World
 * @tparam float dt The delta time multipler for this frame.
 */
Enemy.prototype.update = function(dt) {
    // Position self on the enemy collision grid
    var gridPosition = this.getGridPosition();
    if (gridPosition[0] != this.gridX || gridPosition[1] != this.gridY) {
	world.collisionGrid[this.gridX][this.gridY].removeObject(this);
	this.gridX = gridPosition[0];
	this.gridY = gridPosition[1];
	world.collisionGrid[this.gridX][this.gridY].push(this);
    }

    // Run update as an entity
    Entity.prototype.update.call(this, dt);
};

/**
 * Remove the enemy from the world and collision grid.
 */
Enemy.prototype.die = function() {
    world.collisionGrid[this.gridX][this.gridY].removeObject(this);

    Entity.prototype.die.call(this);
};

/**
 * SpinStars are star-shaped enemies that simply float around aimlessly, spinning.
 *
 * @see Enemy
 * @see Entity
 * @ctor
 * Constructs a SpinStar enemy entity with the given initial position.
 * @tparam float x The initial X-position in the world for the enemy.
 * @tparam float y The initial Y-position in the world for the enemy.
 */
function SpinStar(x, y) {
    Enemy.call(this, x, y, 20);

    // Initial direction and velocity
    this.direction = Math.random()*Math.PI*2;
    this.speed = 1.5 + Math.random();
    this.xSpeed = Math.sin(this.direction)*this.speed;
    this.ySpeed = -Math.cos(this.direction)*this.speed;

    // Graphical spin speed
    this.spinSpeed = 5 + Math.random()*10;
    if (Math.random() < 0.5) this.spinSpeed *= -1;

    // Add spin star graphic
    this.shape = new Sprite();
    this.shape.graphics.lineStyle(3, 0x2255cc, 0x90);
    this.shape.graphics.moveTo(0, this.radius);
    var deltaAngle = 2*Math.PI/8*3;
    for (var i = 1; i <= 8; i++) {
	this.shape.graphics.lineTo(
	    Math.sin(deltaAngle*i)*this.radius,
	    Math.cos(deltaAngle*i)*this.radius
	);
    }

    this.addChild(this.shape);
}

SpinStar.prototype = new Enemy();

/**
 * Implements the artificial intelligence for SpinStars enemies, and updates
 * the enemy's position on the enemy collision grid by calling the parent
 * class <code>Enemy</code>'s update method.
 * @see Enemy
 * @tparam float dt The delta time multipler for this frame.
 */
SpinStar.prototype.update = function(dt) {
    // Update rotation
    this.shape.rotationZ += this.spinSpeed*dt;

    // Run update as an enemy
    Enemy.prototype.update.call(this, dt);

    // Reflect off of walls
    if (this.x <= this.radius || this.x >= world.width - this.radius)
	this.xSpeed *= -1;
    if (this.y <= this.radius || this.y >= world.height - this.radius)
	this.ySpeed *= -1;
};

/**
 * LoveDaimonds are daimond-shaped enemies that constantly persue the player.
 *
 * @see Enemy
 * @see Entity
 * @ctor
 * Constructs a LoveDaimond enemy entity with the given initial position.
 * @tparam float x The initial X-position in the world for the enemy.
 * @tparam float y The initial Y-position in the world for the enemy.
 */
function LoveDaimond(x, y) {
    Enemy.call(this, x, y, 20);

    this.lifeTime = 0;

    // Add love daimond graphic
    this.shape = new Sprite();
    this.shape.graphics.lineStyle(4, 0x2288dd, 0x90);
    this.shape.graphics.moveTo(0, this.radius);
    this.shape.graphics.lineTo(this.radius, 0);
    this.shape.graphics.lineTo(0, -this.radius);
    this.shape.graphics.lineTo(-this.radius, 0);
    this.shape.graphics.lineTo(0, this.radius);

    this.addChild(this.shape);
}

LoveDaimond.prototype = new Enemy();
LoveDaimond.prototype.SPEED = 3;

/**
 * Implements the artificial intelligence for LoveDaimond enemies, and updates
 * the enemy's position on the enemy collision grid by calling the parent
 * class <code>Enemy</code>'s update method.
 * @see Enemy
 * @tparam float dt The delta time multipler for this frame.
 */
LoveDaimond.prototype.update = function(dt) {
    this.lifeTime += dt/10;

    // Set graphical scale
    this.shape.scaleX = (Math.sin(this.lifeTime) + 1)/8 + 0.75;
    this.shape.scaleY = (Math.cos(this.lifeTime) + 1)/8 + 0.75;

    // Persue the player
    var playerDirection = Math.atan2(world.player.x - this.x, world.player.y - this.y);
    this.xSpeed = Math.sin(playerDirection)*this.SPEED;
    this.ySpeed = Math.cos(playerDirection)*this.SPEED;
    this.rotationZ = playerDirection*180/Math.PI;

    // Run update as an enemy
    Enemy.prototype.update.call(this, dt);
};

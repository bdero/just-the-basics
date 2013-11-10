/**
 * @file
 * The World entity hierarchy.
 * This file contains the Entity class as well as all classes which
 * extend from Entity.
 */

/**
 * An entity is anything that interacts with the world and
 * requires movement/border enforcement.
 *
 * @see World
 * @ctor
 * Constructs an entity with the given initial position and collision radius.
 * @tparam float x The initial X-position in the world for the entity.
 * @tparam float y The initial Y-position in the world for the entity.
 * @tparam float radius The collision radius for the entity (if applicable).
 */
function Entity(x, y, radius) {
    Sprite.call(this);

    this.x = x;
    this.y = y;
    this.xSpeed = this.ySpeed = 0;
    this.radius = radius;
}

Entity.prototype = new Sprite();

/**
 * Updates the position of the entity depending on the entity's presently
 * <code>xSpeed</code> and <code>ySpeed</code> values. The entity's position
 * is also cropped to be within the world's borders.
 * @see World
 * @tparam float dt The delta time multipler for this frame.
 */
Entity.prototype.update = function(dt) {
    // Update position
    var beforeX = this.x += this.xSpeed*dt;
    var beforeY = this.y += this.ySpeed*dt;

    // Enforce world borders
    this.x = Math.max(this.radius, Math.min(world.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(world.height - this.radius, this.y));
};

/**
 * The player is an entity with which the user interacts with the world
 * through a controller.
 *
 * @see Entity
 * @see Controller
 * @ctor
 * Constructs a player entity with the given initial position.
 * @tparam float x The initial X-position in the world for the player.
 * @tparam float y The initial Y-position in the world for the player.
 */
function Player(x, y) {
    Entity.call(this, x, y, World.prototype.BLOCK_SIZE);

    this.controller = new Controller();

    this.destinationDirection = 0;

    // Add player graphic
    this.shape = new Sprite();
    this.shape.graphics.lineStyle(3, 0xffaaff, 0.90);
    this.shape.graphics.moveTo(0, -this.radius);
    this.shape.graphics.lineTo(this.radius, this.radius);
    this.shape.graphics.lineTo(0, this.radius/2);
    this.shape.graphics.lineTo(-this.radius, this.radius);
    this.shape.graphics.lineTo(0, -this.radius);

    this.addChild(this.shape);

    // Add cannon graphic
    this.cannon = new Sprite();
    var cannonSize = 10;
    var cannonDistance = this.radius + 5;
    this.cannon.graphics.lineStyle(2, 0xaa88ff, 0x90);
    this.cannon.graphics.moveTo(0, -cannonDistance - cannonSize);
    this.cannon.graphics.lineTo(cannonSize/2, -cannonDistance);
    this.cannon.graphics.lineTo(-cannonSize/2, -cannonDistance);
    this.cannon.graphics.lineTo(0, -cannonDistance - cannonSize);

    this.addChild(this.cannon);
}

Player.prototype = new Entity();
Player.prototype.MAX_SPEED = 6;
Player.prototype.ACCEL_SPEED = 0.5;
Player.prototype.DECEL_SPEED = 0.4;
Player.prototype.DIAG_COMPONENT = 1/Math.sqrt(2);

/**
 * Updates the direction and speed of the player based on the player's
 * controller input state, then updates the player's position by calling
 * the parent class <code>Entity</code>'s update method.
 * @see Entity
 * @see Controller
 * @tparam float dt The delta time multipler for this frame.
 */
Player.prototype.update = function(dt) {
    // Update controller (for mouse movement)
    this.controller.update(dt);

    // Adjust velocity based on controller
    var xMult = 0;
    var yMult = 0;
    if (this.controller.actions.north) yMult -= 1;
    if (this.controller.actions.south) yMult += 1;
    if (this.controller.actions.west) xMult -= 1;
    if (this.controller.actions.east) xMult += 1;

    if (xMult || yMult) {
	if (xMult && yMult) {
	    xMult *= this.DIAG_COMPONENT;
	    yMult *= this.DIAG_COMPONENT;
	}

	this.xSpeed += xMult*this.ACCEL_SPEED*dt;
	this.ySpeed += yMult*this.ACCEL_SPEED*dt;

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
	var newSpeed = Math.max(0, speed - this.DECEL_SPEED*dt);
	var ratio = newSpeed/speed;
	this.xSpeed *= ratio;
	this.ySpeed *= ratio;
    }

    // Adjust graphic direction based on controller
    if (xMult || yMult)
	this.destinationDirection = Math.atan2(xMult, -yMult);

    var deltaDestination = this.destinationDirection*180/Math.PI - this.shape.rotationZ;
    this.shape.rotationZ += modulate(deltaDestination)/10*dt;

    // Adjust cannon direction based on controller
    this.cannon.rotationZ = this.controller.actions.aimDirection;

    // Run update as an entity
    Entity.prototype.update.call(this, dt);
};

/**
 * Enemies are entities which position themselves on the world's collision grid. They
 * kill the player upon collision, invoking massive damage. (Please see specific enemies,
 * such as "Giant Enemy Crab")
 *
 * @see Entity
 * @see World
 * @ctor
 * Constructs an enemy entity with the given initial position.
 * @tparam float x The initial X-position in the world for the enemy.
 * @tparam float y The initial Y-position in the world for the enemy.
 * @tparam float radius The collision radius for the enemy.
 */
function Enemy(x, y, radius) {
    Entity.call(this, x, y, radius);
}

Enemy.prototype = new Entity();

/**
 * Updates the enemy's position on the enemy collision grid, then updates the player's
 * position by calling the parent class <code>Entity</code>'s update method.
 * @see Entity
 * @see World
 * @tparam float dt The delta time multipler for this frame.
 */
Enemy.prototype.update = new function(dt) {
    // Position self on the enemy collision grid

    // Run update as an entity
    Entity.prototype.update.call(this, dt);
}

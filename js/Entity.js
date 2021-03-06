/**
 * @file
 * The World entity hierarchy.
 * This file contains the Entity class as well as some classes which
 * extend from Entity.
 */

/**
 * An entity is anything that interacts with the world and
 * requires movement/border enforcement.
 *
 * @see World
 * @ctor
 * Constructs an entity with the given initial position and collision radius, then
 * adds it to the world for displaying and updating.
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

    // Add entity to the world
    if (x !== undefined && y !== undefined && radius !== undefined) {
        world.entities.push(this);
        world.addChild(this);
    }
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
 * Determines whether another given entity is colliding with this one or not.
 * @tparam Entity other The second entity to be used in the collision check.
 * @treturn boolean Returns whether or not the given entity is colliding with this one.
 */
Entity.prototype.isColliding = function(other) {
    var xDist = other.x - this.x;
    var yDist = other.y - this.y;
    var maxDist = this.radius + other.radius;

    return xDist*xDist + yDist*yDist < maxDist*maxDist;
};

/**
 * Get the entity's position on the world collision grid based on the current position
 * on the world.
 * @treturn Array Returns an array containing the current position on the world collision grid.
 */
Entity.prototype.getGridPosition = function() {
    return [
        Math.floor(this.x/world.COLLISION_SIZE),
        Math.floor(this.y/world.COLLISION_SIZE)
    ];
};

/**
 * Check whether this entity is touching a world border.
 * @treturn boolean Returns whether or not this entity is touching a wall.
 */
Entity.prototype.isTouchingWall = function() {
    return this.x <= this.radius || this.y <= this.radius ||
        this.x >= world.width - this.radius ||
        this.y >= world.height - this.radius;
};

/**
 * Remove the entity from the world.
 */
Entity.prototype.die = function() {
    world.entities.removeObject(this);
    world.removeChild(this);
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
Player.prototype.BULLET_CLOCK = 5;

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

    var speed, newSpeed, ratio;
    if (xMult || yMult) {
        if (xMult && yMult) {
            xMult *= this.DIAG_COMPONENT;
            yMult *= this.DIAG_COMPONENT;
        }

        this.xSpeed += xMult*this.ACCEL_SPEED*dt;
        this.ySpeed += yMult*this.ACCEL_SPEED*dt;

        // Enforce speed limit
        newSpeed = distance(this.xSpeed, this.ySpeed);
        if (newSpeed > this.MAX_SPEED) {
            ratio = this.MAX_SPEED/newSpeed;
            this.xSpeed *= ratio;
            this.ySpeed *= ratio;
        }
    } else if (this.xSpeed || this.ySpeed) {
        // Friction
        speed = distance(this.xSpeed, this.ySpeed);
        newSpeed = Math.max(0, speed - this.DECEL_SPEED*dt);
        ratio = newSpeed/speed;
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

    // Check collision with enemies
    var enemy = world.findCollidingEnemy(this);
    if (enemy) {
        this.die();
        world.reset(enemy);
    }

    // Fire bullets
    if (this.controller.actions.fire) {
        while (this.bulletTimer <= 0) {
            var aimDir = this.controller.actions.aimDirection/180*Math.PI;
            var aimX = Math.sin(aimDir);
            var aimY = -Math.cos(aimDir);
            var dist = this.radius + 5;
            var bulletSpeed = 8;
            new Bullet(this.x + aimX*dist, this.y + aimY*dist,
                       bulletSpeed*aimX + this.xSpeed, bulletSpeed*aimY + this.ySpeed,
                       this.controller.actions.aimDirection);

            this.bulletTimer += this.BULLET_CLOCK;
        }
        this.bulletTimer -= 1*dt;
    } else {
        this.bulletTimer = 0;
    }
};

/**
 * Bullets are entities that are fired by the player and travel at a constant velocity
 * until either destroying an enemy or hitting one of the world's borders.
 *
 * @see Player
 * @see World
 * @ctor
 * Constructs a bullet entity with the given initial position and velocity.
 * @tparam float x The initial X-position in the world for the bullet.
 * @tparam float y The initial Y-position in the world for the bullet.
 * @tparam float xSpeed The X-velocity for the bullet.
 * @tparam float ySpeed The Y-velocity for the bullet.
 * @tparam float direction The direction of the bullet's graphic.
 */
function Bullet(x, y, xSpeed, ySpeed, direction) {
    Entity.call(this, x, y, 10);

    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;

    // Add bullet graphic
    this.shape = new Sprite();
    var shapeSize = this.radius/2;
    this.shape.graphics.lineStyle(2, 0xdddd44, 0x90);
    this.shape.graphics.moveTo(0, -shapeSize);
    this.shape.graphics.lineTo(-shapeSize, shapeSize);
    this.shape.graphics.lineTo(shapeSize, shapeSize);
    this.shape.graphics.lineTo(0, -shapeSize);

    this.addChild(this.shape);
    this.shape.rotationZ = direction;
}

Bullet.prototype = new Entity();

/**
 * Updates the bullet's position by calling the parent class <code>Entity</code>'s
 * update method, then checks for collision of nearby enemies.
 * @see Entity
 * @see World
 * @tparam float dt The delta time multipler for this frame.
 */
Bullet.prototype.update = function(dt) {
    // Run update as an entity
    Entity.prototype.update.call(this, dt);

    // Collision detection
    var enemy = world.findCollidingEnemy(this);
    if (enemy) {
        this.die();
        enemy.die();

        // Increase score
    }
    if (this.isTouchingWall())
        this.die();
};

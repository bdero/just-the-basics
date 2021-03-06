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
    var i, j;

    this.width = width;
    this.height = height;
    this.reset();
    // Initialize position camera position variables
    this.x = this.worldX = -this.width/2;
    this.y = this.worldY = -this.height*2.5;
    // Initialize camera zoom variables
    this.worldZoom = 1;

    // Add background stars
    this.stars = [];
    for (i = 0; i < 300; i++) {
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
    for (i = this.BLOCK_SIZE; i < width; i += this.BLOCK_SIZE) {
        this.graphics.moveTo(i, 0);
        this.graphics.lineTo(i, height);
    }
    for (i = this.BLOCK_SIZE; i < height; i += this.BLOCK_SIZE) {
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

    // Set up entity reference and collision grid
    this.entities = [];
    this.collisionGrid = [];
    for (i = 0; i*this.COLLISION_SIZE < width; i++) {
        this.collisionGrid[i] = [];
        for (j = 0; j*this.COLLISION_SIZE < height; j++)
            this.collisionGrid[i][j] = [];
    }

    // Add player
    //this.player = null;
    //this.player = new Player(width/2, height/2);
    //this.addChild(this.player);
    //this.entities.push(this.player);
}

World.prototype = new Sprite();
World.prototype.BLOCK_SIZE = 16;
World.prototype.COLLISION_SIZE = 64;
World.prototype.DEATH_TIME = 100;

/**
 * Updates the world including all initialized entities. The scale and
 * position of the world are calculated here to simulate camera movement.
 * @tparam float dt The delta time multiplier for this frame.
 */
World.prototype.update = function(dt) {
    var i;

    if (this.active) {
        // Add random SpinStars and LoveDaimonds
        if (Math.random() < 0.02*dt) {
            if (Math.random() < 0.5)
                new SpinStar(Math.random()*this.width, Math.random()*this.height);
            else
                new LoveDaimond(Math.random()*this.width, Math.random()*this.height);
        }
        
        // Update all entities
        for (i = 0; i < this.entities.length; i++)
            this.entities[i].update(dt);

        if (this.player) {
            // Destination world scale (camera zoom)
            this.destinationZoom = 1.5 - Math.max(
                Math.abs(this.player.xSpeed), Math.abs(this.player.ySpeed)
            )/this.player.MAX_SPEED*0.2;

            // Destination world position (camera pan)
            this.destinationX = -(this.player.x + this.player.xSpeed*25);
            this.destinationY = -(this.player.y + this.player.ySpeed*25);
        }
    } else {
        this.deathTimer -= dt;
        if (this.deathTimer <= 0) {
            this.active = true;

            for (i = this.entities.length - 1; i >= 0; i--)
                this.entities[i].die();
            this.player = new Player(this.width/2, this.height/2);
        }
    }

    // World scale (camera zoom)
    this.worldZoom += asymptote(this.destinationZoom - this.worldZoom, 30, dt);
    this.scaleX = this.scaleY = this.scaleZ = this.worldZoom*
        (stage.stageWidth/1024 + stage.stageHeight/768)/2;

    // World position (camera pan)
    this.worldX += asymptote(this.destinationX - this.worldX, 15, dt);
    this.worldY += asymptote(this.destinationY - this.worldY, 15, dt);
    this.x = this.worldX*this.scaleX;
    this.y = this.worldY*this.scaleY;
    
};

/**
 * Collision checks all of the nearby enemies of the given entity, returning
 * the first enemy found.
 * @tparam Entity entity The entity to check nearby enemy collisions with.
 * @treturn Enemy Returns the first found enemy that's colliding with the given entity (or null).
 */
World.prototype.findCollidingEnemy = function(entity) {
    var i, j, k;

    var gridWidth = this.collisionGrid.length;
    var gridHeight = this.collisionGrid[0].length;
    var gridPos = entity.getGridPosition();

    for (i = Math.max(0, gridPos[0] - 1);
         i < Math.min(gridWidth, gridPos[0] + 1);
         i++) {
        for (j = Math.max(0, gridPos[1] - 1);
             j < Math.min(gridHeight, gridPos[1] + 1);
             j++) {
            for (k = 0; k < this.collisionGrid[i][j].length; k++) {
                var enemy = this.collisionGrid[i][j][k];
                if (entity.isColliding(enemy))
                    return enemy;
            }
        }
    }

    return null;
};

/**
 * Triggered upon player death, destroys all entities except for the enemy
 * which collided with the player. This is to show the user how the player
 * died.
 * @tparam Enemy to not destroy.
 */
World.prototype.reset = function(enemy) {
    var i;

    this.active = false;
    this.deathTimer = this.DEATH_TIME;

    this.player = null;
    if (enemy) {
        for (i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i] !== enemy) {
                this.entities[i].die();
            }
        }
    }

    this.destinationX = -this.width/2;
    this.destinationY = -this.height/2;
    this.destinationZoom = 0.8;
};

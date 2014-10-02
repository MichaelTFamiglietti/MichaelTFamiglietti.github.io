var ENEMY_COUNT = 0;

function Enemy(game) {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.cooldownPrimary = 0;
    this.radius = 0;
    this.sprite = null;
    this.speed = 0;
    this.health = 0;
    this.shield = 0;
    this.score = 0;
    this.shieldBonus = 0;
    this.primary = null;
    
    this.gettingHit = false;
    this.gettingHitTimer = 0;
    
    this.waypoint = { x: 0, y: 0 };

    this.update = function () {
        
        this.travel();
        
		// off screen check
        if(this.position.x < 0)
            this.position.x = 0;
        if(this.position.x > game.width)
            this.position.x = game.width;
        if(this.position.y < 0)
            this.position.y = 0;
        if(this.position.y > game.height)
            this.position.y = game.height;

		// Set sprite position
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;

        // Look at player
        var playerPos = player.position;
        var relativePlayerPos = { x: playerPos.x - this.sprite.x, y: playerPos.y - this.sprite.y };

        // shooting logic primary
        if(this.cooldownPrimary < this.primary.firerate)
            this.cooldownPrimary += deltaTime;
        else
        {
            this.cooldownPrimary = 0;
            this.shoot(this.primary);
        }
        
        // Look at player
        // TODO make turn to
       // this.sprite.rotation = Math.atan2(relativePlayerPos.y, relativePlayerPos.x);
        
        // check if being hit
        if(this.gettingHit){
            this.sprite.scale.x = 1.2 - this.gettingHitTimer;
            this.sprite.scale.y = 1.2 - this.gettingHitTimer;
            this.gettingHitTimer += deltaTime;
            if(this.gettingHitTimer >= 0.1){
                this.gettingHitTimer = 0;
                this.gettingHit = false;
            }
        } else {
            this.sprite.scale.x = 1;
            this.sprite.scale.y = 1;
        }
        
        // check if dead
        if(this.health <= 0)
        {
            player.addScore(this.score);
            player.addShield(this.shieldBonus);
           // if (!muteShots) {
           //     death.play(0, 0, 1, false, true);
            }
            ENEMY_COUNT--;
            return false;
        }
        return true;
    };
    
    this.travel = function() {
        if(getDistance(this.position, this.waypoint) < 50) {
            this.waypoint = { x: Math.random() * screenWidth, y: Math.random() * screenHeight };
        }
        var direction = { x: Math.cos(this.sprite.rotation), y: Math.sin(this.sprite.rotation) };
        var difference = { x: this.waypoint.x - this.position.x, y: this.waypoint.y - this.position.y };
        difference = normalize(difference);
        var dotResult = dot(rotateVector(direction, Math.PI / -2), difference);
        if (dotResult < -.001) {
            this.sprite.rotation += 1 * deltaTime;
        }
        else if (dotResult > .001) {
            this.sprite.rotation -= 1 * deltaTime;
        }

        this.position.x += direction.x * deltaTime * this.speed;
        this.position.y += direction.y * deltaTime * this.speed;
    }
    
    this.shoot = function (flyweight) {
        for(var i = 0; i < flyweight.bullets; ++i) {
            var radians = (Math.random() * (flyweight.range*2)-flyweight.range) * (Math.PI/180);
            var dir = {x: 0, y: 0};
            var pos = this.position;
            var angle = Math.atan2(player.position.y - this.position.y, player.position.x - this.position.x);
            dir.x = Math.cos(angle + radians);
            dir.y = Math.sin(angle + radians);
            pos.x += dir.x;
            pos.y += dir.y;
            
            bullets.push(CreateBullet( flyweight, pos, dir ));
        }
        if (!muteShots) {
            shot.play(0, 0, 1, false, true);
        }
    }
}

function CreateEnemyWeak(playerPos) {
    var enemy = new Enemy(game);
    var position = {x: 0, y: 0};
    while(true){
        position.x = Math.random() * screenWidth;
        position.y = Math.random() * screenHeight;
        if( Math.abs(position.x - playerPos.x) > 100 && Math.abs(position.y - playerPos.y) > 100 )
            break;
    }
    enemy.sprite = game.add.sprite(position.x, position.y, 'enemy');
    enemy.sprite.anchor.setTo(0.5, 0.5);
    enemy.position = enemy.sprite.position;
    enemy.radius = 15;
    enemy.speed = 100;
    enemy.health = 100;
    enemy.score = 50;
    enemy.primary = BULLET_ENEMY_WEAK;
    enemy.shieldBonus = 1;
    enemy.waypoint = { x: Math.random() * screenWidth, y: Math.random() * screenHeight };
    
    ENEMY_COUNT++;
    return enemy;
}
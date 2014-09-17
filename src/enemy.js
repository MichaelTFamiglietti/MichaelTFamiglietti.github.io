var ENEMY_COUNT = 0;

function Enemy(Game) {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.cooldownPrimary = 0;
    this.radius = 0;
    this.sprite = null;
    this.speed = 0;
    this.health = 0;
    this.shield = 0;
    this.score = 0;
    this.primary = null;
    
    this.gettingHit = false;
    this.gettingHitTimer = 0;

    this.update = function (Game, player, bullets) {
        
        var delta = Game.time.elapsed * .001;
        
		// off screen check
        if(this.position.x < 0)
            this.position.x = 0;
        if(this.position.x > Game.width)
            this.position.x = Game.width;
        if(this.position.y < 0)
            this.position.y = 0;
        if(this.position.y > Game.height)
            this.position.y = Game.height;

		// Set sprite position
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;

        // Look at player
        var playerPos = player.position;
        var relativePlayerPos = { x: playerPos.x - this.sprite.x, y: playerPos.y - this.sprite.y };

        // shooting logic primary
        if(this.cooldownPrimary < this.primary.firerate)
            this.cooldownPrimary += delta;
        else
        {
            this.cooldownPrimary = 0;
            this.shoot(Game, bullets, this.primary);
        }
        
        // Look at player
        // TODO make turn to
        this.sprite.rotation = Math.atan2(relativePlayerPos.y, relativePlayerPos.x);
        
        // check if being hit
        if(this.gettingHit){
            this.sprite.scale.x = 1.2 - this.gettingHitTimer;
            this.sprite.scale.y = 1.2 - this.gettingHitTimer;
            this.gettingHitTimer += delta;
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
            if(player.health > 0) {
                player.addScore(this.score);
            }
            ENEMY_COUNT--;
            return false;
        }
        return true;
    };
    
    this.shoot = function (Game, bullets, flyweight) {
        for(var i = 0; i < flyweight.bullets; ++i) {
            var radians = (Math.random() * (flyweight.range*2)-flyweight.range) * (Math.PI/180);
            var dir = {x: 0, y: 0};
            var pos = this.position;
            
            dir.x = Math.cos(this.sprite.rotation + radians);
            dir.y = Math.sin(this.sprite.rotation + radians);
            pos.x += dir.x;
            pos.y += dir.y;
            
            bullets.push(CreateBullet( Game, flyweight, pos, dir ));
        }
    }
}

function CreateEnemyWeak(Game, playerPos) {
    var enemy = new Enemy(Game);
    var position = {x: 0, y: 0};
    while(true){
        position.x = Math.random() * screenWidth;
        position.y = Math.random() * screenHeight;
        if( Math.abs(position.x - playerPos.x) > 100 && Math.abs(position.y - playerPos.y) > 100 )
            break;
    }
    enemy.sprite = Game.add.sprite(position.x, position.y, 'enemy');
    enemy.sprite.anchor.setTo(0.5, 0.5);
    enemy.position = enemy.sprite.position;
    enemy.radius = 15;
    enemy.speed = 500;
    enemy.health = 100;
    enemy.score = 50;
    enemy.primary = BULLET_ENEMY_WEAK;
    
    ENEMY_COUNT++;
    return enemy;
}
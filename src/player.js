function Player(Game) {
    this.position = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.cooldownPrimary = 0;
    this.cooldownSecondary = 0;
    this.radius = 0;
    this.sprite = null;
    this.speed = 0;
    this.health = 0;
    this.shield = 0;
    this.score = 0;
    this.primary = null;
    this.secondary = null;
    
    
    this.hudScore = null;
    this.hudHealth = null;
    this.hudShield = null;

    this.update = function (Game, bullets) {
        // Key stuff
        var delta = Game.time.elapsed * .001;
        if (Game.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.position.y -= this.speed * delta;
        }
        if (Game.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.position.y += this.speed * delta;
        }
        if (Game.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.position.x -= this.speed * delta;
        }
        if (Game.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.position.x += this.speed * delta;
        }

		// off screen check
        if(this.position.x < 0)
            this.position.x = 0;
        if(this.position.x > Game.width)
            this.position.x = Game.width;
        if(this.position.y < 0)
            this.position.y = 0;
        if(this.position.y > Game.height)
            this.position.y = Game.height;

		// set sprite position
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;

        // Mouse/Rotation Stuff
        var mousePos = Game.input.mousePointer.position;
        var relativeMousePos = { x: mousePos.x - this.sprite.x, y: mousePos.y - this.sprite.y };
        
        // shooting logic primary
        if(this.cooldownPrimary < this.primary.firerate)
            this.cooldownPrimary += delta;
        else if( Game.input.mouse.button == 1 )
        {
            this.cooldownPrimary = 0;
            this.shoot(Game, bullets, this.primary);
        }
        
        // shooting logic secondary
        if(this.cooldownSecondary < this.secondary.firerate)
            this.cooldownSecondary += delta;
        else if( Game.input.mouse.button == 3 )
        {
            this.cooldownSecondary = 0;
            this.shoot(Game, bullets, this.secondary);
        }
        
        // look at cursor
        this.sprite.rotation = Math.atan2(relativeMousePos.y, relativeMousePos.x);
        
        // Update HUD
        this.hudScore.setText("Score: " + this.score);
        this.hudHealth.setText("Health: " + this.health);
        this.hudShield.setText("Shield: " + this.shield);
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
    };
    
    this.addScore = function (amount) {
        if(this.health > 0){
            this.score += amount;
        }
    };
}

function CreatePlayer(Game) {
    var player = new Player(Game);

    player.sprite = Game.add.sprite(Game.world.width / 2, Game.world.height / 2, 'player');
    player.sprite.anchor.setTo(0.5, 0.5);
    player.position = player.sprite.position;
    player.radius = 15;
    player.speed = 500;
    player.health = 100;
    player.shield = 100;
    player.primary = BULLET_PLAYER_HIGH_PRECISION;
    player.secondary = BULLET_PLAYER_SPREAD_SHOT;
    
    player.hudScore = Game.add.text(16, 16, "Score: " + player.score, { fontSize: '32px', fill: '#FFFFFF' });
    player.hudHealth = Game.add.text(16, 545, "Health: " + player.health, { fontSize: '32px', fill: '#AA1100' });
    player.hudShield = Game.add.text(16, 570, "Shield: " + player.shield, { fontSize: '32px', fill: '#1111DD' });
    
    return player;
}
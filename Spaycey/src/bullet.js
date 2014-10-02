var BULLET_COUNT = 0;
function Bullet() {
    this.direction = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.sprite = null;
    this.flagHit = false;
    this.flyweight = null;
    this.damage = 0;
    this.radius = 0;
    this.vortexAmt = 0;
    this.vortexBool = false;
    this.swarmTime = 0;
    this.swarmLife = 0;
    
    this.update = function() {
        if(this.flyweight.tag == BULLET_PLAYER_SWARM.tag) {
            this.swarm();
        }
        
        if(this.flyweight.wobble > 0) {
            this.vortex();
        }
        
        // Update position
        this.position.x += this.direction.x * this.flyweight.speed * deltaTime
        this.position.y += this.direction.y * this.flyweight.speed * deltaTime;
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        
        // Check if out of bounds
        if(this.flagHit == true||this.position.x + this.flyweight.radius < -50 || this.position.x - this.flyweight.radius > screenWidth  + 50||
           this.position.y + this.flyweight.radius < -50 || this.position.y - this.flyweight.radius > screenHeight + 50 ) {
            BULLET_COUNT--;
            if (!muteShots) {
                impact.play(0, 0, 1, false, true);
            }
            return false;
        }
        else {
           return true;
        }
    };

    this.swarm = function() {
        this.sprite.angle += Math.PI * deltaTime; 
        this.swarmTime +=  deltaTime;
        this.swarmLife -= deltaTime;
        if(this.swarmTime >= .4) {
            this.swarmTime = 0;
        //    this.sprite.angle = 1;
            var angle = Math.random * Math.Pi*2;
      //      this.sprite.angle = angle;
        //    this.direction.x = Math.cos(angle);
       //     this.direction.y = Math.sin(angle);
        }
        if(this.swarmLife <= 0) {
        //    this.flagHit = true;
        }
    }
    
    this.vortex = function() {
        var offset;
        if (this.vortexBool) {
            offset = Math.PI / 2;
        }
        else {
            offset = -Math.PI / 2;
        }

        var newDir = rotateVector(this.direction, offset);
        var xInc = newDir.x * this.flyweight.speed/2* (this.flyweight.wobble/20)* deltaTime;
        var yInc = newDir.y * this.flyweight.speed/2* (this.flyweight.wobble/20)* deltaTime;
        this.vortexAmt += Math.abs(xInc) + Math.abs(yInc);
        this.position.x += xInc;
        this.position.y += yInc;
        
        if(this.vortexAmt > this.flyweight.wobble*2) {
            this.vortexAmt = 0;
            this.vortexBool = !this.vortexBool;
        }
    }
}

function BulletFlyweight(radius, damageMin, damageMax, firerate, speed, bullets, range, wobble, score, tag, bulletTag) {
    this.radius = radius;
    this.damageMin = damageMin;
    this.damageMax = damageMax;
    this.firerate = firerate;
    this.bullets = bullets;
    this.range = range;
    this.speed = speed;
    this.tag = tag;
    this.bulletTag = bulletTag;
    this.wobble = wobble;
    this.score = score;
}


var globalVortexBool = false;
function CreateBullet(flyweight, position, dir) {
    var bullet = new Bullet();
    bullet.flyweight = flyweight;
    bullet.direction.x = dir.x;
    bullet.direction.y = dir.y;
    bullet.position.x = position.x;
    bullet.position.y = position.y;
    bullet.sprite = game.add.sprite(position.x, position.y, flyweight.bulletTag);
    bullet.sprite.rotation = Math.atan2(dir.y, dir.x);
    bullet.sprite.anchor.setTo(0.5, 0.5);
    bullet.damage = Math.round(Math.random() * (flyweight.damageMax-flyweight.damageMin) + flyweight.damageMin);
    bullet.radius = flyweight.radius;
    bullet.vortexBool = globalVortexBool;
    globalVortexBool = !globalVortexBool;
    if(BULLET_PLAYER_SWARM.tag == flyweight.tag) {
        bullet.swarmLife = Math.random() * 2 + 2;   
    }
    
    BULLET_COUNT++;
    return bullet;
}

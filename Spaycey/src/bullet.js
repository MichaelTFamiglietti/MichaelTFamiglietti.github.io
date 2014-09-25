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
    
    this.update = function() {
        if(this.flyweight.wobble > 0) {
            this.vortex();
        }
        
        // Update position
        this.position.x += this.direction.x * this.flyweight.speed * deltaTime
        this.position.y += this.direction.y * this.flyweight.speed * deltaTime;
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        
        // Check if out of bounds
        if(this.position.x + this.flyweight.radius < -50 || this.position.x - this.flyweight.radius > screenWidth  + 50||
           this.position.y + this.flyweight.radius < -50 || this.position.y - this.flyweight.radius > screenHeight + 50||
           this.flagHit == true) {
            BULLET_COUNT--;
            return false;
        }
        else {
           return true;
        }
    };
    
    this.vortex = function() {
        var angle = Math.atan2(this.direction.y, this.direction.x);
        if(this.vortexBool) {
            angle -= Math.PI/2;
        }
        else {
            angle += Math.PI/2;  
        }
        
        var newDir = {x: 0, y: 0};
        newDir.x = Math.cos(angle);
        newDir.y = Math.sin(angle);
        
        var xInc = newDir.x * this.flyweight.speed/4* (this.flyweight.wobble * deltaTime)* deltaTime;
        var yInc = newDir.y * this.flyweight.speed/4* (this.flyweight.wobble * deltaTime)* deltaTime;
        this.vortexAmt += Math.abs(xInc) + Math.abs(yInc);
        this.position.x += xInc;
        this.position.y += yInc;
        
        if(this.vortexAmt > this.flyweight.wobble) {
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
function CreateBullet(Game, flyweight, position, dir) {
    var bullet = new Bullet();
    bullet.flyweight = flyweight;
    bullet.direction.x = dir.x;
    bullet.direction.y = dir.y;
    bullet.position.x = position.x;
    bullet.position.y = position.y;
    bullet.sprite = Game.add.sprite(position.x, position.y, flyweight.bulletTag);
    bullet.sprite.rotation = Math.atan2(dir.y, dir.x);
    bullet.sprite.anchor.setTo(0.5, 0.5);
    bullet.damage = Math.round(Math.random() * (flyweight.damageMax-flyweight.damageMin) + flyweight.damageMin);
    bullet.radius = flyweight.radius;
    bullet.vortexBool = globalVortexBool;
    globalVortexBool = !globalVortexBool;
    
    BULLET_COUNT++;
    return bullet;
}

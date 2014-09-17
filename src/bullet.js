var BULLET_COUNT = 0;
function Bullet() {
    this.direction = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    this.sprite = null;
    this.flagHit = false;
    this.flyweight = new BulletFlyweight();
    this.damage = 0;
    
    this.update = function(Game) {
        // Update position
        var delta = Game.time.elapsed * 0.001;
        this.position.x += this.direction.x * this.speed * delta
        this.position.y += this.direction.y * this.speed * delta;
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        
        // Check if out of bounds
        if(this.position.x + this.radius < 0 || this.position.x - this.radius > screenWidth ||
           this.position.y + this.radius < 0 || this.position.y - this.radius > screenHeight ||
           this.flagHit == true) {
               BULLET_COUNT--;
            return false;
        }
        else {
           return true;
        }
    };
}

function BulletFlyweight(radius, damageMin, damageMax, firerate, speed, bullets, range, tag, bulletTag) {
    this.radius = radius;
    this.damageMin = damageMin;
    this.damageMax = damageMax;
    this.firerate = firerate;
    this.bullets = bullets;
    this.range = range;
    this.speed = speed;
    this.tag = tag;
    this.bulletTag = bulletTag;
}



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
    bullet.damage = Math.random() * (flyweight.damageMax-flyweight.damageMin) + flyweight.damageMin;
    
    BULLET_COUNT++;
    return bullet;
}

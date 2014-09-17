var screenWidth = 800;
var screenHeight = 600;

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'game_bind', { preload: preload, create: create, update: update });
var goldenRatio = 1.61803398875;
var BULLET_ENEMY_WEAK = null;
var BULLET_PLAYER_HIGH_PRECISION = null;
var BULLET_PLAYER_SPREAD_SHOT = null;

var dout = null;
var player = null;
var enemies = [];
var bullets = [];
var enemiesToSpawn = 0;
var levelText = null;

function preload() {
    dout = document.getElementById('debug');
    load();
    
    // setup flyweights
    BULLET_ENEMY_WEAK               = new BulletFlyweight(5, 5, 10, .8, 250, 1, 2, "BulletEnemyWeak", "bulletEnemy" );
    BULLET_PLAYER_HIGH_PRECISION    = new BulletFlyweight(10, 40, 55, .05, 1000, 1, 0, "BulletPlayerHighPrecision", "bulletPlayer"  );
    BULLET_PLAYER_SPREAD_SHOT       = new BulletFlyweight(10, 20, 30, .3, 300, 10, 4, "BulletPlayerSpreadShot", "bulletPlayer"  );
    
}

function create() {
    player = CreatePlayer(game);
}

function colliding(entity1, entity2) {
    var pos1 = entity1.position;
    var pos2 = entity2.position;
    var length = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    if (length - entity1.radius <= entity2.radius) {
        return true;
    }
    else {
        return false;
    }
}

function update() {
    
    // Update player
    player.update(game, bullets);
    
    // Update enemies
    for(var i = 0; i < enemies.length; ++i) {
        if ( !enemies[i].update(game, player, bullets) ) {
            enemies[i].sprite.destroy();
            enemies.splice(i, 1);
            i -= 1;
        }
    }
    
    // Create enemy on input
    if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && enemiesToSpawn == 0) {
        enemiesToSpawn = 1;
        levelText = game.add.text(780, 16, "1", { fontSize: '32px', fill: '#FFFFFF', align: 'right' });
    }

    // HACK create enemies on interval
    if(enemies.length == 0 && enemiesToSpawn > 0) {
        for(var i = 0; i < enemiesToSpawn; ++i) {
            enemies.push(CreateEnemyWeak(game, player.position));
        }
        
        levelText.setText(enemiesToSpawn);
        if(enemiesToSpawn == 10 || enemiesToSpawn == 100 || enemiesToSpawn == 1000 || enemiesToSpawn == 10000 || enemiesToSpawn == 100000) {
            levelText.x -= 16;
        }
        
        enemiesToSpawn++;
    }
    
    // Update bullets
    for(var i = 0; i < bullets.length; ++i) {
        if ( !bullets[i].update(game) ) {
            bullets[i].sprite.destroy();
            bullets.splice(i, 1);
            i -= 1;
        }
        else {
            // CHECK COLLISION
            if(bullets[i].flyweight.bulletTag == "bulletEnemy") {
                if( colliding(bullets[i], player) ) {
                    if(player.shield > 0) {
                        player.shield -= bullets[i].damage;
                        if (player.shield < 0) {
                            player.shield = 0;
                        }
                    }
                    else {
                        player.health -= bullets[i].damage;
                        if (player.health < 0) {
                            player.health = 0;
                        }
                    }
                    bullets[i].flagHit = true;
                }
            }
            else if(bullets[i].flyweight.bulletTag == "bulletPlayer") {
                for(var j = 0; j < enemies.length; ++j)
                {
                    if( colliding(bullets[i], enemies[j]) ) {
                        enemies[j].health -= bullets[i].damage;
                        enemies[j].gettingHit = true;
                        player.addScore(10);
                        bullets[i].flagHit = true;
                    }
                }
            }
        }
    }
    
    dout.innerHTML = "FPS: " + game.time.fps + 
    "<br />Bullets: " + BULLET_COUNT + 
    "<br />Enemies: " + ENEMY_COUNT;
}
var screenWidth = 800;
var screenHeight = 600;

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'game_bind', { preload: preload, create: create, update: update });
var goldenRatio = 1.61803398875;
var BULLET_ENEMY_WEAK = null;
var BULLET_PLAYER_HIGH_PRECISION = null;
var BULLET_PLAYER_SPREAD_SHOT = null;
var BULLET_PLAYER_DOUBLE_SHOT = null;
var BULLET_PLAYER_SEMIWIDE_SHOT = null;
var BULLET_PLAYER_WIDE_SHOT = null;
var BULLET_PLAYER_VORTEX = null;
var BULLET_PLAYER_ZAP = null;
var BULLET_PLAYER_SPRAY = null;

var dout = null;
var player = null;
var enemies = [];
var bullets = [];
var enemiesToSpawn = 0;
var enemiesSpawned = 0;
var levelText = null;
var level = 0;
var roundStarted = false;
var restCooldown = 0;
var spawnEnemyCooldown = 0;
var deltaTime = 0;
var loseText = null;

function preload() {
    dout = document.getElementById('debug');
    load();
    
    // setup flyweights
    BULLET_ENEMY_WEAK               = new BulletFlyweight(5, 5, 10, .8, 300, 1, 2, 0, 0, "BulletEnemyWeak", "bulletEnemy" );
    BULLET_PLAYER_HIGH_PRECISION    = new BulletFlyweight(10, 40, 55, .05, 1000, 1, 0, 0, 10, "BulletPlayerHighPrecision", "bulletPlayer"  );
    BULLET_PLAYER_SPREAD_SHOT       = new BulletFlyweight(10, 20, 30, .3, 320, 10, 4, 0, 7, "BulletPlayerSpreadShot", "bulletPlayer"  );
    BULLET_PLAYER_DOUBLE_SHOT       = new BulletFlyweight(12, 30, 45, .2, 700, 2, 4, 0, 6, "BulletPlayerDoubleShot", "bulletPlayer" );
    BULLET_PLAYER_SEMIWIDE_SHOT     = new BulletFlyweight(10, 20, 30,  1, 500, 25, 45, 0, 5, "BulletPlayerSemiWideShot", "bulletPlayer");
    BULLET_PLAYER_WIDE_SHOT         = new BulletFlyweight(10, 20, 30,  1, 500, 50, 90, 0, 5, "BulletPlayerWideShot", "bulletPlayer");
    BULLET_PLAYER_360_SHOT          = new BulletFlyweight(10, 30, 40, 1.15, 300, 100, 180, 0, 4, "BulletPlayer360Shot", "bulletPlayer");
    BULLET_PLAYER_VORTEX            = new BulletFlyweight(10, 5, 15, .03, 500, 2, 0, 25, 5, "BulletPlayerVortex", "bulletPlayer");
    BULLET_PLAYER_ZAP               = new BulletFlyweight(10, 8, 12, .1, 900, 2, 0, 50, 5, "BulletPlayerZap", "bulletPlayer");
    BULLET_PLAYER_SPRAY             = new BulletFlyweight(10, 20, 35, .07, 400, 4, 30, 0, 8, "BulletPlayerSpray", "bulletPlayer" );
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
    if(player.health == 0) {
        if(loseText == null) {
            player.update(game, bullets);
            loseText = game.add.text(250, 100, "You Lose...\nPress Enter to Restart", { fontSize: '32px', fill: '#FFFFFF', align: 'center' });
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            Restart();   
        }
    }
    else {
        deltaTime = game.time.elapsed * .001;
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

        UpdateGameMode();

        // Update bullets
        for(var i = 0; i < bullets.length; ++i) {
            if ( !bullets[i].update() ) {
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
                            player.addScore(bullets[i].flyweight.score);
                            bullets[i].flagHit = true;
                        }
                    }
                }
            }
        }
    }
    dout.innerHTML = "FPS: " + game.time.fps + 
    "<br />Bullets: " + BULLET_COUNT + 
    "<br />Enemies: " + ENEMY_COUNT;
}

function UpdateGameMode() {
    // Create enemy on input
    if(roundStarted == false && game.input.keyboard.isDown(Phaser.Keyboard.ENTER) && enemiesToSpawn == 0) {
        levelText = game.add.text(780, 16, 1, { fontSize: '32px', fill: '#FFFFFF', align: 'right' });
        NextLevel();
    }
    
    // if the player is resting between waves
    if( restCooldown > 0 ) {
        // count down rest time
        restCooldown -= deltaTime;
        // if the rest time has elapsed
        if( restCooldown <= 0) {
            NextLevel();
        }
    }
    else if(roundStarted == true ) {
        if(enemiesSpawned == enemiesToSpawn) {
            if(enemies.length == 0) {
                roundStarted = false;
                restCooldown = 3.0;
            }
        }
        else {
            if(spawnEnemyCooldown <= 0) {
                enemies.push(CreateEnemyWeak(game, player.position));
                ++enemiesSpawned;
                spawnEnemyCooldown = 0.6;
            }
            else {
                spawnEnemyCooldown -= deltaTime;   
            }
        }
    }
}

function NextLevel() {
    spawnEnemyCooldown = 0;
    enemiesSpawned = 0;
    restCooldown = 0;
    // increment the enemies to spawn
    ++enemiesToSpawn;
    ++level;
    roundStarted = true;
    
    levelText.setText(level);
    if(enemiesToSpawn == 10 || enemiesToSpawn == 100 || enemiesToSpawn == 1000 || enemiesToSpawn == 10000 || enemiesToSpawn == 100000) {
        levelText.x -= 16;
    }
}

function Restart() {
    enemiesToSpawn = 0;
    player.health = 100;
    player.shield = 100;
    player.score = 0;
    for(var i =0; i < enemies.length; ++i) {
        enemies[i].sprite.destroy();
        enemies.splice(i, 1);
        i -= 1;
    }
    for(var i =0; i < bullets.length; ++i) {
        bullets[i].sprite.destroy();
        bullets.splice(i, 1);
        i -= 1; 
    }
    loseText.destroy();
    loseText = null;
    level = 0;
    levelText.x = 780;
    NextLevel();
}
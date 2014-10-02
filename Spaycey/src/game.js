var screenWidth = 800;
var screenHeight = 600;

var game = new Phaser.Game(screenWidth, screenHeight, Phaser.AUTO, 'game_bind', { preload: preload, create: create, update: update });
var goldenRatio = 1.61803398875;
var BULLET_ENEMY_WEAK = null;
var BULLET_PLAYER_HIGH_PRECISION = null;
var BULLET_PLAYER_SPREAD_SHOT = null;
var BULLET_PLAYER_DOUBLE_SHOT = null;
var BULLET_PLAYER_SEMIWIDE_SHOT = null;
var BULLET_PLAYER_360_SHOT = null;
var BULLET_PLAYER_WIDE_SHOT = null;
var BULLET_PLAYER_VORTEX = null;
var BULLET_PLAYER_ZAP = null;
var BULLET_PLAYER_SPRAY = null;
var BULLET_PLAYER_SWARM = null;
var GunStrings = ["HighPrecision", "SpreadShot", "DoubleShot", "SemiWideShot", "360Shot", "WideShot", "Vortex", "Zap", "Spray", "Swarm"];
var Guns = [];

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
var music = null;
var shot = null;
//var impact = null;
//var death = null;

var playerWeaponInt1 = 0, playerWeaponInt2 = 1;
var playerWeapon1 = null, playerWeapon2 = null;

function preload() {
    dout = document.getElementById('debug');
    load();
    
    // setup flyweights
    BULLET_ENEMY_WEAK               = new BulletFlyweight(5, 8, 17, .8, 300, 1, 2, 0, 0, "BulletEnemyWeak", "bulletEnemy" );
    BULLET_PLAYER_HIGH_PRECISION    = new BulletFlyweight(10, 40, 55, .05, 1000, 1, 0, 0, 10, "BulletPlayerHighPrecision", "bulletPlayer"  );
    BULLET_PLAYER_SPREAD_SHOT       = new BulletFlyweight(10, 20, 30, .33, 520, 10, 4, 0, 7, "BulletPlayerSpreadShot", "bulletPlayer"  );
    BULLET_PLAYER_DOUBLE_SHOT       = new BulletFlyweight(12, 30, 45, .2, 750, 2, 4, 0, 6, "BulletPlayerDoubleShot", "bulletPlayer" );
    BULLET_PLAYER_SEMIWIDE_SHOT     = new BulletFlyweight(10, 17, 23,  1, 550, 35, 45, 0, 5, "BulletPlayerSemiWideShot", "bulletPlayer");
    BULLET_PLAYER_WIDE_SHOT         = new BulletFlyweight(10, 15, 25,  1, 500, 60, 90, 0, 5, "BulletPlayerWideShot", "bulletPlayer");
    BULLET_PLAYER_360_SHOT          = new BulletFlyweight(10, 20, 30, 1.15, 300, 90, 180, 0, 4, "BulletPlayer360Shot", "bulletPlayer");
    BULLET_PLAYER_VORTEX            = new BulletFlyweight(10, 5, 10, .03, 500, 2, 0, 25, 5, "BulletPlayerVortex", "bulletPlayer");
    BULLET_PLAYER_ZAP               = new BulletFlyweight(10, 15, 25, .1, 900, 4, 0, 50, 5, "BulletPlayerZap", "bulletPlayer");
    BULLET_PLAYER_SPRAY             = new BulletFlyweight(10, 20, 35, .07, 400, 4, 30, 0, 8, "BulletPlayerSpray", "bulletPlayer" );
    BULLET_PLAYER_SWARM             = new BulletFlyweight(10, 20, 40, .1, 500, 5, 300, 20, 5, "BulletPlayerSwarm", "bulletPlayer" );
    Guns = [BULLET_PLAYER_HIGH_PRECISION, BULLET_PLAYER_SPREAD_SHOT, 
            BULLET_PLAYER_DOUBLE_SHOT, BULLET_PLAYER_SEMIWIDE_SHOT, BULLET_PLAYER_WIDE_SHOT, 
            BULLET_PLAYER_360_SHOT, BULLET_PLAYER_VORTEX, BULLET_PLAYER_ZAP, BULLET_PLAYER_SPRAY, BULLET_PLAYER_SWARM ];
}

function create() {
    player = CreatePlayer();
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

function getDistance(pos1, pos2) {
    var difference = { x: pos1.x - pos2.x, y: pos1.y - pos2.y };
    var distance = Math.sqrt(difference.x * difference.x + difference.y * difference.y);
    return distance;
}

function rotateVector(vector, rotateAmount) {
    var result = { x: 0, y: 0 };
    var angle = Math.atan2(vector.y, vector.x);
    angle += rotateAmount;
    result.x = Math.cos(angle);
    result.y = Math.sin(angle);
    return result;
}

function dot(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y;
}

function normalize(vector) {
    var mag = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    var result = { x: vector.x / mag, y: vector.y / mag };
    return result;
}

function update() {
    if(player.health == 0) {
        if(loseText == null) {
            player.update();
            loseText = game.add.text(250, 100, "You Lose...\nPress Enter to Restart", { fontSize: '32px', fill: '#FFFFFF', align: 'center' });
        }
        if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            Restart();   
        }
    }
    else {
        UpdateGunUI();
        
        deltaTime = game.time.elapsed * .001;
        // Update player
        player.update();

        // Update enemies
        for(var i = 0; i < enemies.length; ++i) {
            if ( !enemies[i].update() ) {
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
 //   dout.innerHTML = "FPS: " + game.time.fps + 
 //   "<br />Bullets: " + BULLET_COUNT + 
 //   "<br />Enemies: " + ENEMY_COUNT;
}
var enemySpawnRate = 0.6;
var lastMutedM = false;
var lastMutedN = false;
var muteShots = false;
function UpdateGameMode() {
    if (game.input.keyboard.isDown(Phaser.Keyboard.M )) {
        if (lastMutedM == false) {
            lastMutedM = true;
            music.mute = !music.mute;
        }
    }
    else {
        lastMutedM = false;
    }

    if (game.input.keyboard.isDown(Phaser.Keyboard.N)) {
        if (lastMutedN == false) {
            lastMutedN = true;
            muteShots = !muteShots;
        }
    }
    else {
        lastMutedN = false;
    }

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
                enemies.push(CreateEnemyWeak(player.position));
                ++enemiesSpawned;
                spawnEnemyCooldown = enemySpawnRate;
            }
            else {
                spawnEnemyCooldown -= deltaTime;   
            }
        }
    }
}

var switchFrames = true;
var wasDown = false;
function UpdateGunUI() {
    if(switchFrames) {
        if(playerWeapon1 != null) {
            playerWeapon1.destroy();
        }
        if(playerWeapon2 != null){
            playerWeapon2.destroy();   
        }
        playerWeapon1 = game.add.sprite(game.world.width - 64, game.world.height - 128, GunStrings[playerWeaponInt1]);
        playerWeapon2 = game.add.sprite(game.world.width - 64, game.world.height - 64, GunStrings[playerWeaponInt2]);
        player.primary = Guns[playerWeaponInt1];
        player.secondary = Guns[playerWeaponInt2];
        switchFrames = false;
    }
    else {
        if(!wasDown && game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
            wasDown = true;
            switchFrames = true;
            playerWeaponInt1++;
            if(playerWeaponInt1 == playerWeaponInt2){
                playerWeaponInt1++;
            }
            if(playerWeaponInt1 >= GunStrings.length) {
                if(playerWeaponInt2 == 0) { playerWeaponInt1 = 1; }
                else { playerWeaponInt1 = 0; }
            }
        }
        if(!wasDown && game.input.keyboard.isDown(Phaser.Keyboard.E) ) {
            wasDown = true;
            switchFrames = true;
            playerWeaponInt2++;
            if(playerWeaponInt2 == playerWeaponInt1){
                playerWeaponInt2++;
            }
            if(playerWeaponInt2 >= GunStrings.length) {
                if(playerWeaponInt1 == 0) { playerWeaponInt2 = 1; }
                else { playerWeaponInt2 = 0; }
            }
        }
        if(wasDown && !game.input.keyboard.isDown(Phaser.Keyboard.Q) && !game.input.keyboard.isDown(Phaser.Keyboard.E) ) {
            wasDown = false;
        }
    }
}

function NextLevel() {
    spawnEnemyCooldown = 0;
    enemiesSpawned = 0;
    restCooldown = 0;
    // increment the enemies to spawn
    enemiesToSpawn += 2;
    level += 1;
    roundStarted = true;
    
    levelText.setText(level);
    if(level == 10 || level == 100 || level == 1000 || level == 10000 || level == 100000) {
        levelText.x -= 16;
    }

    if (level == 5 || level == 10 || level == 15 || level == 20 || level == 25 || level == 30 || level == 40 || level == 50) {
        enemySpawnRate -= .05;
    }
}

function Restart() {
    music.play(0, 0, 1, true, true);
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
    enemySpawnRate = 0.6;
    levelText.x = 780;
    NextLevel();
}
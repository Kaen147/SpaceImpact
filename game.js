let player;
let bullets;
let enemies;
let cursors;
let spacebar;
let background;
let score = 0;
let scoreText;
const fireRate = 200;
let lastFired = 0;
let ammo = 3;
let reloadTime = 2000;
let isReloading = false;
let level = 1;
let enemySpeed = 100;

const config = {
    type: Phaser.AUTO,
    width: 480,
    height: 800,
    backgroundColor: '#000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('enemy', 'assets/enemy.png');
}

function create() {
    background = this.add.tileSprite(0, 0, 480, 1600, 'background').setOrigin(0, 0);
    
    player = this.physics.add.sprite(240, 700, 'player');
    player.setCollideWorldBounds(true);

    bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 10 });
    enemies = this.physics.add.group({ defaultKey: 'enemy', maxSize: 20 });

    cursors = this.input.keyboard.addKeys({
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });

    spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.time.addEvent({ delay: 1500, callback: spawnEnemy, callbackScope: this, loop: true });

    this.physics.add.overlap(bullets, enemies, destroyEnemy, null, this);
    this.physics.add.overlap(player, enemies, gameOver, null, this);
    
    scoreText = this.add.text(10, 10, 'Score: 0', { fontSize: '20px', fill: '#fff' });
}

function update(time) {
    background.tilePositionY -= 2;

    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    } else {
        player.setVelocityX(0);
    }

    if (spacebar.isDown && time > lastFired + fireRate && ammo > 0 && !isReloading) {
        shootBullet(this);
        lastFired = time;
        ammo--;
        if (ammo === 0) {
            isReloading = true;
            this.time.delayedCall(reloadTime, () => {
                ammo = 3;
                isReloading = false;
            });
        }
    }

    bullets.children.iterate((bullet) => {
        if (bullet && bullet.y < 0) {
            bullet.destroy();
        }
    });

    enemies.children.iterate((enemy) => {
        if (enemy && enemy.y > 800) {
            enemy.destroy();
        }
    });

    // Level progression
    if (score >= level * 100) {
        level++;
        enemySpeed += 20;
    }
}

function shootBullet(scene) {
    let bullet = bullets.get(player.x, player.y - 20);
    if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-300);
    }
}

function spawnEnemy() {
    let enemy = enemies.get(Phaser.Math.Between(50, 430), 0);
    if (enemy) {
        enemy.setActive(true);
        enemy.setVisible(true);
        enemy.setVelocityY(enemySpeed);
    }
}

function destroyEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText('Score: ' + score);
}

function gameOver(player, enemy) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.stop();
    scoreText.setText('Game Over! Score: ' + score);
}

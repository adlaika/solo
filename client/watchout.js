//---SETTINGS---
var gameOptions = {
  width: window.innerWidth - 100,
  height: window.innerHeight - 100,
  padding: 40,
  nEnemies: 15,
  friction: 0.9
};

var gameStats = {
  score: 0,
  bestScore: 0
};









//---HELPERS---
var pixelize = function (n) {
  return n + 'px';
};

//Two functions to convert location from coordinates to pixels.
//Example: toPixelAxes.x(gameOptions.height) --> 100
var toPixelAxes = {
  x: d3.scale.linear().domain([0, 100]).range([0, gameOptions.width]).clamp(true),
  y: d3.scale.linear().domain([0, 100]).range([0, gameOptions.height]).clamp(true)
};

//Two functions to convert location from pixels to coordinates
var toCoordAxes = {
  x: d3.scale.linear().domain([0, gameOptions.width]).range([0, 100]).clamp(true),
  y: d3.scale.linear().domain([0, gameOptions.height]).range([0, 100]).clamp(true)
};

//check if in bounds IN PIXELS
var inBounds = function (x, y) {
  var result = false;
  if (x < gameOptions.height && x > 0 && y < gameOptions.width && y > 0) {
    result = true;
  }
  return result;
}

//return random number between two constraints
var rand = function (nBot, nTop) {
  return Math.floor(Math.random() * nTop) + nBot;
};

//return random coords within game board
var randX = function () {
  return rand(
    gameOptions.padding,
    gameOptions.width - gameOptions.padding
  );
};
var randY = function () {
  return rand(
    gameOptions.padding,
    gameOptions.height - gameOptions.padding
  );
};









//---GAME ELEMENT CONSTRUCTORS---
var GameElement = function (loc, size) {
  this.loc = [loc[0], loc[1]];
  this.size = size;
  this.speed = 1;
};

//all game elements have a function that creates them on board
GameElement.prototype.draw = function (htmlClass) {
  board.append('svg:circle')
    .attr('class', htmlClass)
    .attr('cx', pixelize(this.loc[0]))
    .attr('cy', pixelize(this.loc[1]))
    .attr('r', this.size)
};

GameElement.prototype.move = function (x, y) {
  this.loc[0] += x * this.speed;
  this.loc[1] += y * this.speed;
};

//for player shots, call with 'player.shoot(crosshairs.loc);'
var bulletObjs = [];
GameElement.prototype.shoot = function (targetLoc) {
  var x = this.loc[0];
  var y = this.loc[1];

  var newBullet = new Bullet(this.loc, 2);
  newBullet.draw('bullet');
  newBullet.targetLoc = targetLoc;
  bulletObjs.push(newBullet);
  if (newBullet.inBounds) {
    newBullet.fire(targetLoc);
  }
}

//bullet constructor
var Bullet = function () {
  GameElement.apply(this, arguments);
  this.speed = 20;
};
Bullet.prototype = Object.create(GameElement.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.fire = function () {
  var xDiff = this.loc[0] - this.targetLoc[0];
  var yDiff = this.loc[1] - this.targetLoc[1];
  console.log('thisloc: ', this.loc);
  console.log('tarloc: ', this.targetLoc);
  var x, y;

  if (xDiff > 0) {
    x = 1;
  } else {
    x = -1;
  }

  if (yDiff > 0) {
    y = 1;
  } else {
    y = -1;
  }

  this.move(x, y);
  // console.log(this.loc)
}

//player constructor
var Player = function () {
  GameElement.apply(this, arguments);
  this.speed = 2;
};
Player.prototype = Object.create(GameElement.prototype);
Player.prototype.constructor = Player;

//crosshairs constructor
var Crosshairs = function () {
  GameElement.apply(this, arguments);
};
Crosshairs.prototype = Object.create(GameElement.prototype);
Crosshairs.prototype.constructor = Crosshairs;

//enemy constructor
var Enemy = function () {
  GameElement.apply(this, arguments);
};
Enemy.prototype = Object.create(GameElement.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.chase = function (target) {
  var speed = this.speed;
  var x = this.loc[0];
  var y = this.loc[1];
  var targetX = target.loc[0];
  var targetY = target.loc[1];
  if (x > targetX) {
    this.move(-speed, 0);
  }
  if (x < targetX) {
    this.move(speed, 0);
  }
  if (y < targetY) {
    this.move(0, speed);
  }
  if (y > targetY) {
    this.move(0, -speed);
  }
};









//---SET UP GAME---
//create board d3 selection
var board = d3.select('.board')
  .append('svg:svg')
  .attr('width', gameOptions.width)
  .attr('height', gameOptions.height);


//instantiate player and append to board, save as selection
var newPlayer = new Player([toPixelAxes.x(50), toPixelAxes.y(50)], 10);
newPlayer.draw('player');
var player = d3.select('.player');

//instantiate and append some enemies
var newEnemies = [];
for (var i = 0; i < gameOptions.nEnemies; i++) {
  var x = randX();
  var y = randY();
  var newEnemy = new Enemy([x, y], 20);
  newEnemies.push(newEnemy);
  newEnemy.draw('enemy');
};
var enemies = d3.selectAll('.enemy');

//instantiate crosshairs and append to board
var crosshairs = new Crosshairs([toPixelAxes.x(50), toPixelAxes.y(50)], 2);
var mouse = {
  x: gameOptions.width / 2,
  y: gameOptions.height / 2
};
crosshairs.draw('crosshairs');

//mouse movement controls crosshairs
board.on('mousemove', function () {
  var loc = d3.mouse(this);
  // mouse = {
  //   x: loc[0],
  //   y: loc[1]
  // };
  crosshairs.loc[0] = loc[0];
  crosshairs.loc[1] = loc[1];
  d3.select('.crosshairs')
    .attr('cx', pixelize(crosshairs.loc[0]))
    .attr('cy', pixelize(crosshairs.loc[1]))
});

//click fires
board.on('click', function () {
  newPlayer.shoot(crosshairs.loc);
});









//---RUN ONCE GAME IS LOADED---
$(document).ready(function () {

  //WASD controls
  var keyPushStates = {};
  var keyCode;

  var logKey = function (event) {
    keyCode = event.keyCode;
    if (event.type === 'keydown') {
      keyPushStates[keyCode] = true;
    } else if (event.type === 'keyup') {
      keyPushStates[keyCode] = false;
    }
  };

  d3.select('body').on('keydown', function () {
    logKey(d3.event);
  });

  d3.select('body').on('keyup', function () {
    logKey(d3.event);
  });

  //handle movement
  var keysHandler = function () {

    //a && w
    if (keyPushStates[65] && keyPushStates[87]) {
      newPlayer.move(-1, -1);

      //a && s
    } else if (keyPushStates[65] && keyPushStates[83]) {
      newPlayer.move(-1, 1);

      //w && d
    } else if (keyPushStates[87] && keyPushStates[68]) {
      newPlayer.move(1, -1);

      //d && s
    } else if (keyPushStates[68] && keyPushStates[83]) {
      newPlayer.move(1, 1);

      //a
    } else if (keyPushStates[65]) {
      newPlayer.move(-2, 0);

      //w
    } else if (keyPushStates[87]) {
      newPlayer.move(0, -2);

      //d
    } else if (keyPushStates[68]) {
      newPlayer.move(2, 0);

      //s
    } else if (keyPushStates[83]) {
      newPlayer.move(0, 2);
    }
  };

  var updateLoc = function (targetSelection, loc) {
    targetSelection.datum(loc)
      .attr('cx', function (d) {
        var x = toPixelAxes.x(toCoordAxes.x(d[0]));
        return pixelize(x);
      })
      .attr('cy', function (d) {
        var y = toPixelAxes.y(toCoordAxes.y(d[1]));
        return pixelize(y);
      })
  };

  var updateEnemyLoc = function () {
    enemies.each(function (_, i) {
      updateLoc(d3.select(this), newEnemies[i].loc);
    });
  };

  var moveEnemies = function () {
    _.each(newEnemies, function (enemy) {
      enemy.chase(newPlayer);
    });
  };

  var moveBullets = function () {
    _.each(bulletObjs, function (bulletObj) {
      // console.log(bulletObj)
      bulletObj.fire(bulletObj.targetLoc);
    });
  };

  var updateMultiLoc = function (selection, objs) {
    selection.each(function (_, i) {
      updateLoc(d3.select(this), objs[i].loc);
    });
  };

  var updateBulletLoc = function () {
    d3.selectAll('.bullet').each(function (_, i) {
      updateLoc(d3.select(this), bulletObjs[i].loc);
    });
  };








  //---GAME TIMER---
  d3.timer(function () {
    keysHandler();
    updateLoc(player, newPlayer.loc);
    moveEnemies();
    updateEnemyLoc();
    moveBullets();
    // updateMultiLoc(d3.selectAll('.bullets'), bulletObjs);
    updateBulletLoc();
  });
});

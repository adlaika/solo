//---SETTINGS---
var gameOptions = {
  width: window.innerWidth - 100,
  height: window.innerHeight - 100,
  padding: 100,
  nEnemies: 30,
  interval: 2000,
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
  x: d3.scale.linear().domain([0, 100]).range([0, gameOptions.width]),
  y: d3.scale.linear().domain([0, 100]).range([0, gameOptions.height])
};

//Two functions to convert location from pixels to coordinates
var toCoordAxes = {
  x: d3.scale.linear().domain([0, gameOptions.width]).range([0, 100]),
  y: d3.scale.linear().domain([0, gameOptions.height]).range([0, 100])
};

var rand = function (n) {
  return Math.floor(Math.random() * n);
};

var randX = function () {
  return pixelize(toPixelAxes.x(rand(gameOptions.width - gameOptions.padding)))
};

var randY = function () {
  return pixelize(toPixelAxes.y(rand(gameOptions.height - gameOptions.padding)))
};

//---GAME ELEMENT CONSTRUCTORS---
var GameElement = function (loc, size, shape) {
  this.loc = [loc[0], loc[1]];
  this.size = size;
  this.shape = shape;
  this.momentum = [0, 0];
};

//all game elements have a function that creates them on board
GameElement.prototype.draw = function (htmlClass) {
  board.append('svg:circle')
    .attr('class', htmlClass)
    .attr('cx', pixelize(this.loc[0]))
    .attr('cy', pixelize(this.loc[1]))
    .attr('r', this.size)
    .attr('momentum', [0, 0])
};

GameElement.prototype.move = function (x, y) {
  //return fn with event so that this can be used with key events
  return function (event) {
    if (event) {
      event.preventDefault();
    }
    this.momentum[0] += x;
    this.momentum[1] += y;
  }.bind(this);
};

GameElement.prototype.shoot = function (targetX, targetY) {}

//player constructor
var Player = function () {
  GameElement.apply(this, arguments);
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

//---SET UP GAME---
//create board d3 selection
var board = d3.select('.board')
  .append('svg:svg')
  .attr('width', gameOptions.width)
  .attr('height', gameOptions.height);

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
  mouse = {
    x: loc[0],
    y: loc[1]
  };
  d3.select('.crosshairs')
    .attr('cx', pixelize(mouse.x))
    .attr('cy', pixelize(mouse.y))
});

//instantiate player and append to board, save as selection
var newPlayer = new Player([toPixelAxes.x(50), toPixelAxes.y(50)], 10);
newPlayer.draw('player');
var player = d3.select('.player');

//---RUN ONCE GAME IS LOADED---
$(document).ready(function () {

  //WASD controls
  var keys = [];
  var keyCode;

  d3.select('body').on('keydown', function () {
    keyCode = d3.event.keyCode;
    console.log('keyCode: ', keyCode)
    keys[keyCode] = (d3.event.type === 'keydown');
    console.log('keys: ', keys)
  });

  d3.select('body').on('keyup', function () {
    keyCode = d3.event.keyCode;
    console.log('keyCode: ', keyCode)
    if (d3.event.type === 'keyup') {
      keys[keyCode] = false;
    }
    console.log('keys: ', keys)
  });

  //handle movement
  var handler = function (key) {
    if (key === 'a') {
      newPlayer.move(-2, 0);
    } else if (key === 'w') {
      newPlayer.move(0, -2);
    } else if (key === 'd') {
      newPlayer.move(2, 0);
    } else if (key === 's') {
      newPlayer.move(0, 2);
    }
  }

  newPlayer.loc[0] = Math.min(gameOptions.width, Math.max(0, newPlayer.momentum[0] + newPlayer.loc[0]));
  newPlayer.loc[1] = Math.min(gameOptions.height, Math.max(0, newPlayer.momentum[1] + newPlayer.loc[1]));
  player
    .datum(newPlayer.loc)
    .attr('transform', function (d) {
      return 'translate(' + d + ')';
    });
  newPlayer.momentum[0] *= gameOptions.friction;
  newPlayer.momentum[1] *= gameOptions.friction;

  //---GAME TIMER---
  d3.timer(function () {
    for (var i = keys.length; i < 0; i--) {
      for (key in keyObj) {
        if (keys[i][key] === true) {
          handler(keys[i][key]);
        }
      }
    }
  });

});

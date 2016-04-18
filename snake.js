'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var doc = document;
var privateNames = new WeakMap();
//TODO:ここMap?
var Config = new Map();
Config.set('game_width', 300);
Config.set('game_height', 300);
Config.set('snake_size', 10);
Config.set('level_multi', 6);
Config.set('default_speed', 300);
Config.set('snake_color', [252, 80, 77, 255]);
Config.set('food_color', [88, 157, 80, 255]);

var SnakeGame = (function () {
	function SnakeGame() {
		_classCallCheck(this, SnakeGame);

		this.init();
	}

	_createClass(SnakeGame, [{
		key: 'init',
		value: function init() {
			this.snake_speed = Config.get('default_speed');
			this.tmp_vector = 2;
			this.point = 0;
			this.live = null;
			this.Controller();
		}
	}, {
		key: 'Controller',

		/**
   * Controller
   * DOMContentLoaded後の処理を書いている。。。要検討
   **/
		value: function Controller() {
			var _this = this;

			this.gameBodyElm = doc.getElementById('game_display');
			this.canvas = this.gameBodyElm.getContext('2d');
			this.createBody();

			this.snake = new Founder();

			var snake_position = this.snake.getPosition();
			this.render(snake_position.x, snake_position.y, Config.get('snake_color'));
			this.createFood();
			doc.addEventListener('keydown', function (ev) {
				if (_this.keyBinding(ev) && _this.live === null) _this.animationCore();
			});
		}
	}, {
		key: 'keyBinding',

		/**
   * KeyBoard Binding
   * @param EventObject ev
   * @return boolean
   **/
		value: function keyBinding(ev) {
			if (this.live === false) return false;
			switch (ev.keyCode) {
				case 37:
					this.tmp_vector = 0;
					break;

				case 38:
					this.tmp_vector = 1;
					break;

				case 39:
					this.tmp_vector = 2;
					break;

				case 40:
					this.tmp_vector = 3;
					break;

				default:
					return false;
			}
			return true;
		}
	}, {
		key: 'animationCore',

		/**
   * animationCore
   * アニメーションの管理 timerIdにsetTimeoutのidを突っ込んで再帰
   **/
		value: function animationCore() {
			var _this2 = this;

			this.live = true;

			this.timerId = setTimeout(function () {
				_this2.snake.positionUpdate(_this2.tmp_vector);

				var snake_position = _this2.snake.getPosition(),
				    snake_stack = _this2.snake.getStack(),
				    food_position = _this2.food.getPosition(),
				    snake_color = Config.get('snake_color');

				//foodを食べたときの処理
				if (_this2.isEatColor(snake_position.x, snake_position.y, Config.get('food_color'))) {
					_this2.levelUp();
					_this2.createFood();
					food_position = _this2.food.getPosition();
				} else if (_this2.isGameOver(snake_position.x, snake_position.y)) {
					return _this2.gameOver();
				}

				_this2.clearCanvas();
				for (var i = 0; i < snake_stack.length; i++) {
					_this2.render(snake_stack[i].x, snake_stack[i].y, Config.get('snake_color'));
				}
				_this2.render(food_position.x, food_position.y, Config.get('food_color'));

				_this2.timerId = _this2.animationCore();
			}, this.snake_speed);
		}
	}, {
		key: 'render',

		/**
   * Render
   * 描画を行う
   *
   * @param int x
   * @param int y
   **/
		value: function render(x, y, color) {
			this.canvas.beginPath();
			this.canvas.fillStyle = 'rgba(' + color.join(',') + ')';
			this.canvas.fillRect(x, y, Config.get('snake_size'), Config.get('snake_size'));
		}
	}, {
		key: 'isEatColor',

		/**
   * isEatColor
   * 特定の色のマスに到達したかを検証
   *
   * @param int x
   * @param int y
   * @param Array food_rgba
   * @return bool
   **/
		value: function isEatColor(x, y, food_rgba) {
			var rgba = this.canvas.getImageData(x * 2, y * 2, 1, 1).data.values();

			for (var i = 0; i < food_rgba.length; i++) {
				if (food_rgba[i] != rgba.next().value) return false;
			}
			return true;
		}
	}, {
		key: 'createFood',

		/**
   * createFood
   * 食物の生成
   **/
		value: function createFood() {
			var snake_position = this.snake.getPosition(),
			    snake_size = Config.get('snake_size'),
			    x_block_num = Config.get('game_width') / snake_size,
			    y_block_num = Config.get('game_height') / snake_size,
			    food_x = 0,
			    food_y = 0;

			do {
				food_x = Math.floor(Math.random() * x_block_num) * snake_size;
				food_y = Math.floor(Math.random() * y_block_num) * snake_size;
			} while (this.isEatColor(food_x, food_y, Config.get('snake_color')));

			this.food = undefined;
			this.food = new Founder(food_x, food_y);

			this.render(food_x, food_y, Config.get('food_color'));
		}
	}, {
		key: 'gameOver',

		/**
   * gameSet
   * ゲーム終了処理
   **/
		value: function gameOver() {
			var _this3 = this;

			this.live = false;
			clearTimeout(this.timerId);
			window.alert('Game Over!! Game board click when retry');

			//addOne Time Event
			var retryFunc = function retryFunc() {
				if (_this3.live === false) _this3.init();
				_this3.gameBodyElm.removeEventListener(retryFunc);
			};

			this.gameBodyElm.addEventListener('click', retryFunc);
		}
	}, {
		key: 'isGameOver',

		/**
   * isGameSet
   * ゲーム終了判定
   * @param int x
   * @param int y
   * @return bool
   **/
		value: function isGameOver(x, y) {
			return x >= Config.get('game_width') || x < 0 || y >= Config.get('game_height') || y < 0 || this.isEatColor(x, y, Config.get('snake_color'));
		}
	}, {
		key: 'clearCanvas',

		/**
   * clearCanvas
   * キャンバスのクリア
   **/
		value: function clearCanvas() {
			this.canvas.clearRect(0, 0, Config.get('game_width'), Config.get('game_height'));
		}
	}, {
		key: 'levelUp',
		value: function levelUp() {
			var snake_length = this.snake.updateStackLimit(6),
			    now_speed = this.snake_speed,
			    tmp_speed = now_speed - Math.round(Config.get('default_speed') * 2 / snake_length);

			this.updatePoint(snake_length);
			this.snake_speed = tmp_speed <= 0 ? Math.round(now_speed / 2) : tmp_speed;
		}
	}, {
		key: 'createBody',

		/**
   * anmation用のcanvasにstyleのセット
   **/
		value: function createBody() {
			//Fix Retina Display
			this.gameBodyElm.setAttribute('width', Config.get('game_width') * 2);
			this.gameBodyElm.setAttribute('height', Config.get('game_height') * 2);
			this.gameBodyElm.style.width = Config.get('game_width') + 'px';
			this.gameBodyElm.style.height = Config.get('game_height') + 'px';
			this.gameBodyElm.style.backgroundColor = '#000';
			this.gameBodyElm.style.border = '10px solid #DDD';
			this.canvas.scale(2, 2);

			this.pointBodyElm = doc.createElement('DIV');
			this.pointBodyElm.id = 'point_body';
			this.pointBodyElm.style.width = Config.get('game_width') + 20 + 'px';
			this.pointBodyElm.style.textAlign = 'right';
			this.pointBodyElm.style.fontFamily = '"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif';
			this.gameBodyElm.parentNode.insertBefore(this.pointBodyElm, this.gameBodyElm.nextSibling);
			this.updatePoint();
		}
	}, {
		key: 'updatePoint',

		/**
   * pointを更新するメソッド
   **/
		value: function updatePoint() {
			var num = arguments[0] === undefined ? 0 : arguments[0];

			this.point += num;

			var point_str = this.point;
			if (this.pointBodyElm.textContent !== void 0) {
				this.pointBodyElm.textContent = point_str;
			} else {
				this.pointBodyElm.innerText = point_str;
			}
		}
	}]);

	return SnakeGame;
})();

var Founder = (function () {

	/**
  * constructor
  * @param int x
  * @param int y
  **/

	function Founder() {
		var x = arguments[0] === undefined ? 10 : arguments[0];
		var y = arguments[1] === undefined ? 10 : arguments[1];

		_classCallCheck(this, Founder);

		privateNames.set(this, {
			position: { x: x, y: y },
			vector: 2,
			length: 1,
			stack: []
		});
	}

	_createClass(Founder, [{
		key: 'positionUpdate',

		/**
   * positionUpdate
   * @param int vector
   **/
		value: function positionUpdate() {
			var vector = arguments[0] === undefined ? null : arguments[0];

			var size = Config.get('snake_size');
			var p_data = privateNames.get(this),
			    x = p_data.position.x,
			    y = p_data.position.y;

			if (vector === null || p_data.vector == vector + 2 || p_data.vector == vector - 2) vector = p_data.vector;

			if (vector % 2 == 0) {
				x = vector > 0 ? x + size : x - size;
			} else {
				y = vector > 1 ? y + size : y - size;
			}

			var length = p_data.stack.push({ x: x, y: y });

			p_data.vector = vector;
			p_data.position.y = y;
			p_data.position.x = x;

			if (p_data.length < length) p_data.stack.shift();

			privateNames.set(this, p_data);
		}
	}, {
		key: 'getPosition',

		/**
   * getPosition
   * @return Object
   **/
		value: function getPosition() {
			var p_data = privateNames.get(this);
			return p_data.position;
		}
	}, {
		key: 'getStack',

		/**
   * getStack
   * @return Array
   **/
		value: function getStack() {
			var p_data = privateNames.get(this);
			return p_data.stack;
		}
	}, {
		key: 'updateStackLimit',

		/**
   * updateStackLimit
   * positionの保持量を加算する。
   * @param int num
   * @return int
   **/
		value: function updateStackLimit() {
			var num = arguments[0] === undefined ? 1 : arguments[0];

			var p_data = privateNames.get(this);
			p_data.length += num;
			privateNames.set(this, p_data);
			return p_data.length;
		}
	}]);

	return Founder;
})();

doc.addEventListener('DOMContentLoaded', function () {
	new SnakeGame();
});
//# sourceMappingURL=snake.js.map

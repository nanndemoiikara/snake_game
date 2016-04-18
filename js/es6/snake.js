'use strict';
const doc = document;
const privateNames = new WeakMap();
//TODO:ここMap?
const Config = new Map();
Config.set('game_width',    300);
Config.set('game_height',   300);
Config.set('snake_size',    10);
Config.set('level_multi',   6);
Config.set('default_speed', 300);
Config.set('snake_color',   [252, 80, 77, 255]);
Config.set('food_color',    [88, 157, 80, 255]);

class SnakeGame {

	constructor()
	{
		this.init();
	}

	init()
	{
		this.snake_speed = Config.get('default_speed');
		this.tmp_vector  = 2;
		this.point       = 0;
		this.live        = null;
		this.Controller();
	}

	/**
	 * Controller
	 * DOMContentLoaded後の処理を書いている。。。要検討
	 **/
	Controller()
	{
		this.gameBodyElm = doc.getElementById('game_display');
		this.canvas      = this.gameBodyElm.getContext('2d');
		this.createBody();

		this.snake = new Founder();

		var snake_position = this.snake.getPosition();
		this.render(snake_position.x, snake_position.y, Config.get('snake_color'));
		this.createFood();
		doc.addEventListener('keydown', (ev) => {
			if ( this.keyBinding(ev) &&  this.live === null ) this.animationCore();
		})
	}

	/**
	 * KeyBoard Binding
	 * @param EventObject ev
	 * @return boolean
	 **/
	keyBinding(ev)
	{
		if ( this.live === false ) return false;
		switch (ev.keyCode)
		{
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

			default :
				return false;
		}
		return true;
	}

	/**
	 * animationCore
	 * アニメーションの管理 timerIdにsetTimeoutのidを突っ込んで再帰
	 **/
	animationCore()
	{
		this.live = true;

		this.timerId = setTimeout(()=>{
			this.snake.positionUpdate(this.tmp_vector);

			let snake_position = this.snake.getPosition(),
				snake_stack    = this.snake.getStack(),
				food_position  = this.food.getPosition(),
				snake_color    = Config.get('snake_color');

			//foodを食べたときの処理
			if ( this.isEatColor(snake_position.x, snake_position.y, Config.get('food_color')) )
			{
				this.levelUp();
				this.createFood();
				food_position = this.food.getPosition();
			}
			else if ( this.isGameOver(snake_position.x, snake_position.y) )
			{
				return this.gameOver();
			}

			this.clearCanvas();
			for ( var i = 0; i < snake_stack.length; i++ )
			{
				this.render(snake_stack[i].x, snake_stack[i].y, Config.get('snake_color'));
			}
			this.render(food_position.x, food_position.y, Config.get('food_color'));

			this.timerId = this.animationCore();
		}, this.snake_speed);
	}

	/**
	 * Render
	 * 描画を行う
	 *
	 * @param int x
	 * @param int y
	 **/
	render(x, y, color)
	{
		this.canvas.beginPath();
		this.canvas.fillStyle = 'rgba(' + color.join(',') + ')';
		this.canvas.fillRect(
			x, y,
			Config.get('snake_size'),
			Config.get('snake_size')
		);
	}

	/**
	 * isEatColor
	 * 特定の色のマスに到達したかを検証
	 *
	 * @param int x
	 * @param int y
	 * @param Array food_rgba
	 * @return bool
	 **/
	isEatColor(x, y, food_rgba)
	{
		var rgba = this.canvas.getImageData(x*2, y*2, 1, 1).data.values();

		for ( let i = 0; i < food_rgba.length; i++ )
		{
			if ( food_rgba[i] != rgba.next().value ) return false;
		}
		return true;
	}

	/**
	 * createFood
	 * 食物の生成
	 **/
	createFood()
	{
		var snake_position = this.snake.getPosition(),
			snake_size     = Config.get('snake_size'),
			x_block_num    = Config.get('game_width') / snake_size,
			y_block_num    = Config.get('game_height') / snake_size,
			food_x         = 0,
			food_y         = 0;

		do
		{
			food_x = ( Math.floor( Math.random() * x_block_num ) * snake_size);
			food_y = ( Math.floor( Math.random() * y_block_num ) * snake_size);
		}
		while ( this.isEatColor(food_x, food_y, Config.get('snake_color')) )

		this.food = undefined;
		this.food = new Founder(food_x, food_y);

		this.render(food_x, food_y, Config.get('food_color'));
	}

	/**
	 * gameSet
	 * ゲーム終了処理
	 **/
	gameOver()
	{
		this.live = false;
		clearTimeout(this.timerId);
		window.alert('Game Over!! Game board click when retry');

		//addOne Time Event
		let retryFunc = () => {
			if ( this.live === false ) this.init();
			this.gameBodyElm.removeEventListener(retryFunc);
		}

		this.gameBodyElm.addEventListener('click', retryFunc);
	}

	/**
	 * isGameSet
	 * ゲーム終了判定
	 * @param int x
	 * @param int y
	 * @return bool
	 **/
	isGameOver(x, y)
	{
		return ( x >= Config.get('game_width')  || x <  0 
			  || y >= Config.get('game_height') || y < 0 
			  || this.isEatColor(x, y, Config.get('snake_color')));
	}

	/**
	 * clearCanvas
	 * キャンバスのクリア
	 **/
	clearCanvas()
	{
		this.canvas.clearRect(
			0, 0, 
			Config.get('game_width'), 
			Config.get('game_height')
		);
	}

	levelUp()
	{
		var snake_length = this.snake.updateStackLimit(6),
			now_speed    = this.snake_speed,
			tmp_speed    = now_speed - Math.round( Config.get('default_speed') * 2 / snake_length );

		this.updatePoint(snake_length);
		this.snake_speed = ( tmp_speed <= 0 )? Math.round(now_speed / 2) : tmp_speed ;
	}

	/**
	 * anmation用のcanvasにstyleのセット
	 **/
	createBody()
	{
		//Fix Retina Display
		this.gameBodyElm.setAttribute('width' , (Config.get('game_width') * 2));
		this.gameBodyElm.setAttribute('height', (Config.get('game_height') * 2));
		this.gameBodyElm.style.width           = Config.get('game_width') + 'px';
		this.gameBodyElm.style.height          = Config.get('game_height') + 'px';
		this.gameBodyElm.style.backgroundColor = '#000';
		this.gameBodyElm.style.border          = '10px solid #DDD';
		this.canvas.scale(2, 2);

		this.pointBodyElm = doc.createElement('DIV');
		this.pointBodyElm.id              = 'point_body';
		this.pointBodyElm.style.width     = ( Config.get('game_width') + 20 ) + 'px';
		this.pointBodyElm.style.textAlign = 'right';
		this.pointBodyElm.style.fontFamily = '"ヒラギノ角ゴ Pro W3", "Hiragino Kaku Gothic Pro", "メイリオ", Meiryo, Osaka, "ＭＳ Ｐゴシック", "MS PGothic", sans-serif';
		this.gameBodyElm.parentNode.insertBefore(this.pointBodyElm, this.gameBodyElm.nextSibling);
		this.updatePoint();
	}

	/**
	 * pointを更新するメソッド
	 **/
	updatePoint(num = 0)
	{
		this.point += num;

		var point_str = this.point;
		if ( this.pointBodyElm.textContent !== void(0) )
		{
			this.pointBodyElm.textContent = point_str;
		}
		else
		{
			this.pointBodyElm.innerText = point_str;
		}
	}
}

class Founder {

	/**
	 * constructor
	 * @param int x
	 * @param int y
	 **/
	constructor(x = 10, y = 10)
	{
		privateNames.set(this,{
			position : {x, y},
			vector   : 2,
			length   : 1,
			stack    : []
		});
	}

	/**
	 * positionUpdate
	 * @param int vector
	 **/
	positionUpdate (vector = null)
	{
		const size = Config.get('snake_size');
		let p_data   = privateNames.get(this),
			x        = p_data.position.x,
			y        = p_data.position.y;

		if ( vector === null || p_data.vector == vector + 2 || p_data.vector == vector -2 ) vector = p_data.vector;

		if ( vector%2 == 0 )
		{
			x = ( vector > 0 )? x + size : x - size ;
		}
		else
		{
			y = ( vector > 1 )? y + size : y - size ;
		}


		let length = p_data.stack.push({x, y});

		p_data.vector     = vector;
		p_data.position.y = y;
		p_data.position.x = x;

		if ( p_data.length < length ) p_data.stack.shift();

		privateNames.set(this, p_data);
	}

	/**
	 * getPosition
	 * @return Object
	 **/
	getPosition()
	{
		let p_data = privateNames.get(this);
		return p_data.position;
	}

	/**
	 * getStack
	 * @return Array
	 **/
	getStack()
	{
		let p_data = privateNames.get(this);
		return p_data.stack;
	}

	/**
	 * updateStackLimit
	 * positionの保持量を加算する。
	 * @param int num
	 * @return int
	 **/
	updateStackLimit(num = 1)
	{
		let p_data = privateNames.get(this);
		p_data.length += num;
		privateNames.set(this, p_data);
		return p_data.length;
	}
}

doc.addEventListener('DOMContentLoaded',function(){
	new SnakeGame();
});

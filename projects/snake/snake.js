
const GP = {
  groundWitdh: 30,
  groundHeight: 30,
  snakeStartLength: 5
}

const UNIT_TYPES = {
  void: 0,
  food: 4,
  rock: 5
}

const DIRECTIONS = {
  RIGHT: 0,
  LEFT: 1,
  TOP: 2,
  BOTTOM: 3
}

const SNAKE_PARTS = {
  HEAD: 0,
  BODY: 1,
  TAIL: 2
}

class Ground {
  constructor (width, height) {
    this.width = width;
    this.height = height;
  }
}

class Field {
  constructor (container, unit) {
    this.container = container;
    this.unit = unit;
  }

  draw (snakePart) {
    switch (snakePart) {
      case SNAKE_PARTS.HEAD: this.container.style["background"] = 'white'; return;
      case SNAKE_PARTS.BODY: this.container.style["background"] = 'green'; return;
      case SNAKE_PARTS.TAIL: this.container.style["background"] = 'blue'; return;
    }
    switch (this.unit) {
      case UNIT_TYPES.food: this.container.style["background"] = 'red'; break;
      case UNIT_TYPES.rock: this.container.style["background"] = 'grey'; break;
      default: this.container.style["background"] = 'black';
    }
  }
}

class Point {
  constructor (x, y) {
    this.x = x;
    this.y = y;
  }
}

class Snake {
  constructor (head_x, head_y, length, direction) {
    this.coords = new Array(length);
    this.direction = direction;
    this.lastMovedDirection = this.direction;
    for (let i = 0; i < length; i++) {
      this.coords[i] = new Point(
        head_x - this.dx*i,
        head_y - this.dy*i
      );
    }

    // TODO: добавить поддержку для пальцев
    // window.addEventListener("touchstart", (event) => {
    //   console.log(event);
    // }, false);

    window.addEventListener("keydown", (event) => {
      const keyMap = {
        39: DIRECTIONS.RIGHT,
        37: DIRECTIONS.LEFT,
        38: DIRECTIONS.TOP,
        40: DIRECTIONS.BOTTOM
      }
      const direction = keyMap[event.keyCode];
      if (direction === undefined)
        return;
      if (
        (direction === DIRECTIONS.RIGHT || direction === DIRECTIONS.LEFT) &&
        (this.lastMovedDirection === DIRECTIONS.RIGHT || this.lastMovedDirection === DIRECTIONS.LEFT)
      ) return;
      if (
        (direction === DIRECTIONS.TOP || direction === DIRECTIONS.BOTTOM) &&
        (this.lastMovedDirection === DIRECTIONS.TOP || this.lastMovedDirection === DIRECTIONS.BOTTOM)
      ) return;
      this.direction = direction;
    }, false);
  }
  get dx () {
    return this.direction === DIRECTIONS.RIGHT ? 1 : this.direction === DIRECTIONS.LEFT ? -1 : 0;
  }
  get dy () {
    return this.direction === DIRECTIONS.TOP ? -1 : this.direction === DIRECTIONS.BOTTOM ? 1 : 0;
  }

  static randomDirection () {
    return Math.floor(Math.random()*4);
  }
}

class SnakeGame {
  constructor (containerId) {
    this.gameOver = false;
    this.container = document.getElementById(containerId);
    this.container.style["background"] = "grey";
    this.container.style["font-size"] = "40pt";
    this.container.style["font-family"] = "Courier New";
    this.container.style["text-align"] = "center";
    this.container.style["line-height"] = this.container.offsetHeight + "px";
    this.ground = new Ground(GP.groundWitdh, GP.groundHeight);
    this.tickDuration = 1000;

    const fieldWidth = Math.floor(this.container.offsetWidth / this.ground.width);
    const fieldHeight = Math.floor(this.container.offsetHeight / this.ground.height);
    this.fields = new Array(this.ground.width);
    for (let i = 0; i < this.ground.width; i++) {
      this.fields[i] = new Array(this.ground.height);
      const columnContainer = document.createElement('div');
      columnContainer.style.float = "left";
      this.container.appendChild(columnContainer);
      for (let j = 0; j < this.ground.height; j++) {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.width = fieldWidth + "px";
        fieldContainer.style.height = fieldHeight + "px";
        /* DEBUG */
        // fieldContainer.style["font-size"] = "8pt"
        // fieldContainer.innerHTML = i + "; " + j;
        // fieldContainer.style.color = (i+j) % 2 === 0 ? 'red' : 'blue';
        columnContainer.appendChild(fieldContainer);
        this.fields[i][j] = new Field(fieldContainer, UNIT_TYPES.void);
      }
    }
  }

  placeFood () {
    try2place: while (true) {
      const x = Math.floor(Math.random()*this.ground.width);
      const y = Math.floor(Math.random()*this.ground.height);
      if (this.fields[x][y].unit === UNIT_TYPES.void) {
        for (let i = 0; i < this.snake.coords.length; i++) {
          if (this.snake.coords[i].x === x && this.snake.coords[i].y === y) {
            continue try2place;
          }
        }
        this.fields[x][y].unit = UNIT_TYPES.food;
        this.fields[x][y].draw();
        break;
      }
    }
  }

  init () {
    /* Rocks */
    for (let i = 0; i < this.ground.width; i++) {
      this.fields[i][0].unit = this.fields[i][this.ground.height-1].unit = UNIT_TYPES.rock;
    }
    for (let j = 1; j < this.ground.height-1; j++) {
      this.fields[0][j].unit = this.fields[this.ground.width-1][j].unit = UNIT_TYPES.rock;
    }

    for (let i = 0; i < this.ground.width; i++) {
      for (let j = 0; j < this.ground.height; j++) {
        this.fields[i][j].draw();
      }
    }

    /* Snake TODO: rocks collision */
    const x = Math.round(this.ground.width/2 + (Math.random()-0.5)*(this.ground.width/10));
    const y = Math.round(this.ground.height/2 + (Math.random()-0.5)*(this.ground.height/10));
    const direction = Snake.randomDirection();
    this.snake = new Snake(x, y, GP.snakeStartLength, direction);
    const tailCoords = this.snake.coords[this.snake.coords.length-1];
    this.fields[tailCoords.x][tailCoords.y].draw(SNAKE_PARTS.TAIL);
    const headCoords = this.snake.coords[0];
    this.fields[headCoords.x][headCoords.y].draw(SNAKE_PARTS.HEAD);
    for (let i = 1; i < this.snake.coords.length-1; i++) {
      const bodyCoords = this.snake.coords[i];
      this.fields[bodyCoords.x][bodyCoords.y].draw(SNAKE_PARTS.BODY);
    }

    /* Food */
    this.placeFood();
  }

  update () {
    const newHeadPos = new Point(
      this.snake.coords[0].x + this.snake.dx,
      this.snake.coords[0].y + this.snake.dy
    );

    /* Rocks */
    if (this.fields[newHeadPos.x][newHeadPos.y].unit === UNIT_TYPES.rock) {
      this.gameOver = true;
      return;
    }

    /* Self-collision*/
    for (let i = 3; i < this.snake.coords.length - 1; i++) {
      if (newHeadPos.x === this.snake.coords[i].x && newHeadPos.y === this.snake.coords[i].y) {
        this.gameOver = true;
        return;
      }
    }

    /* Move */
    const ateFood = this.fields[newHeadPos.x][newHeadPos.y].unit === UNIT_TYPES.food;
    if (ateFood) {
      this.snake.coords.unshift(newHeadPos);
      this.fields[newHeadPos.x][newHeadPos.y].unit = UNIT_TYPES.void;
      this.placeFood();
    } else {
      for (let i = this.snake.coords.length - 1; i > 0; i--) {
        this.fields[this.snake.coords[i].x][this.snake.coords[i].y].draw(
          i === this.snake.coords.length - 1 ? undefined :
          i === this.snake.coords.length - 2 ? SNAKE_PARTS.TAIL : SNAKE_PARTS.BODY
        );
        this.snake.coords[i].x = this.snake.coords[i-1].x;
        this.snake.coords[i].y = this.snake.coords[i-1].y;
      }
      this.fields[this.snake.coords[0].x][this.snake.coords[0].y].draw(SNAKE_PARTS.BODY);

      this.snake.coords[0] = newHeadPos;
    }
    this.fields[newHeadPos.x][newHeadPos.y].draw(SNAKE_PARTS.HEAD);

    this.snake.lastMovedDirection = this.snake.direction;
  }

  start () {
    this.init();

    const tick = () => {
      this.update();
      if (this.gameOver) {
        this.container.style["background"] = "RGB(143,43,55)";
        this.container.innerHTML = "<b>GAME OVER</b>";
      } else {
        setTimeout(tick, this.tickDuration); // TODO: выровнять время
      }
    }

    tick();
  }
}

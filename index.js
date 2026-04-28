const matrix = document.getElementById('matrix');
const nextQueue = document.getElementById('nextQueue');
const holdSlot = document.getElementById('holdSlot');
const timeElapsed = document.getElementById('timeElapsed');
const pieceCount = document.getElementById('pieceCount');
const lineClearCount = document.getElementById('lineClearCount');
const msg = document.getElementById('msg');
const matrixCtx = matrix.getContext('2d');
const nextQueueCtx = nextQueue.getContext('2d');
const holdSlotCtx = holdSlot.getContext('2d');

const BLOCK_SIZE = 20;
const MATRIX_WIDTH = 10;
const MATRIX_HEIGHT = 20;

matrix.width = BLOCK_SIZE * MATRIX_WIDTH;
matrix.height = BLOCK_SIZE * MATRIX_HEIGHT;
nextQueue.width = BLOCK_SIZE * 5;
nextQueue.height = BLOCK_SIZE * 16;
holdSlot.width = BLOCK_SIZE * 5;
holdSlot.height = BLOCK_SIZE * 4;

const COLORS = {
    YELLOW: '#E39F02',
    LIGHTBLUE: '#0F9BD7',
    PURPLE: '#AF298A',
    ORANGE: '#E35B02',
    DARKBLUE: '#2141C6',
    GREEN: '#59B101',
    RED: '#D70F37',
    GRAY: '#404040'
};

const TetrominoFacing = Object.freeze({
    North: Symbol('North'),
    East: Symbol('East'),
    South: Symbol('South'),
    West: Symbol('West')
});

const TetrominoRotation = Object.freeze({
    Clockwise: Symbol('Clockwise'),
    CounterClockwise: Symbol('CounterClockwise'),
    OneEighty: Symbol('OneEighty')
})

const TetrominoType = Object.freeze({
    O: Symbol('O'),
    I: Symbol('I'),
    T: Symbol('T'),
    L: Symbol('L'),
    J: Symbol('J'),
    S: Symbol('S'),
    Z: Symbol('Z'),
});

class Tetromino {
    static COLORS = {
        [TetrominoType.O]: COLORS.YELLOW,
        [TetrominoType.I]: COLORS.LIGHTBLUE,
        [TetrominoType.T]: COLORS.PURPLE,
        [TetrominoType.L]: COLORS.ORANGE,
        [TetrominoType.J]: COLORS.DARKBLUE,
        [TetrominoType.S]: COLORS.GREEN,
        [TetrominoType.Z]: COLORS.RED
    };

    static SHAPES = {
        [TetrominoType.O]: {
            [TetrominoFacing.North]: [[0, 0], [1, 0], [1, 1], [0, 1]],
            [TetrominoFacing.East]: [[0, 0], [1, 0], [1, 1], [0, 1]],
            [TetrominoFacing.South]: [[0, 0], [1, 0], [1, 1], [0, 1]],
            [TetrominoFacing.West]: [[0, 0], [1, 0], [1, 1], [0, 1]],
        },
        [TetrominoType.I]: {
            [TetrominoFacing.North]: [[-1, 0], [0, 0], [1, 0], [2, 0]],
            [TetrominoFacing.East]: [[1, 1], [1, 0], [1, -1], [1, -2]],
            [TetrominoFacing.South]: [[2, -1], [1, -1], [0, -1], [-1, -1]],
            [TetrominoFacing.West]: [[0, -2], [0, -1], [0, 0], [0, 1]]
        },
        [TetrominoType.T]: {
            [TetrominoFacing.North]: [[0, 0], [0, 1], [-1, 0], [1, 0]],
            [TetrominoFacing.East]: [[0, 0], [1, 0], [0, 1], [0, -1]],
            [TetrominoFacing.South]: [[0, 0], [0, -1], [1, 0], [-1, 0]],
            [TetrominoFacing.West]: [[0, 0], [-1, 0], [0, -1], [0, 1]]
        },
        [TetrominoType.L]: {
            [TetrominoFacing.North]: [[-1, 0], [0, 0], [1, 0], [1, 1]],
            [TetrominoFacing.East]: [[0, 1], [0, 0], [0, -1], [1, -1]],
            [TetrominoFacing.South]: [[1, 0], [0, 0], [-1, 0], [-1, -1]],
            [TetrominoFacing.West]: [[0, -1], [0, 0], [0, 1], [-1, 1]]
        },
        [TetrominoType.J]: {
            [TetrominoFacing.North]: [[1, 0], [0, 0], [-1, 0], [-1, 1]],
            [TetrominoFacing.East]: [[0, -1], [0, 0], [0, 1], [1, 1]],
            [TetrominoFacing.South]: [[-1, 0], [0, 0], [1, 0], [1, -1]],
            [TetrominoFacing.West]: [[0, 1], [0, 0], [0, -1], [-1, -1]]
        },
        [TetrominoType.S]: {
            [TetrominoFacing.North]: [[-1, 0], [0, 0], [0, 1], [1, 1]],
            [TetrominoFacing.East]: [[0, 1], [0, 0], [1, 0], [1, -1]],
            [TetrominoFacing.South]: [[1, 0], [0, 0], [0, -1], [-1, -1]],
            [TetrominoFacing.West]: [[0, -1], [0, 0], [-1, 0], [-1, 1]]
        },
        [TetrominoType.Z]: {
            [TetrominoFacing.North]: [[1, 0], [0, 0], [0, 1], [-1, 1]],
            [TetrominoFacing.East]: [[0, -1], [0, 0], [1, 0], [1, 1]],
            [TetrominoFacing.South]: [[-1, 0], [0, 0], [0, -1], [1, -1]],
            [TetrominoFacing.West]: [[0, 1], [0, 0], [-1, 0], [-1, -1]]
        }
    };

    static ROTATIONS = {
        [TetrominoRotation.Clockwise]: {
            [TetrominoFacing.North]: TetrominoFacing.East,
            [TetrominoFacing.East]: TetrominoFacing.South,
            [TetrominoFacing.South]: TetrominoFacing.West,
            [TetrominoFacing.West]: TetrominoFacing.North
        },
        [TetrominoRotation.CounterClockwise]: {
            [TetrominoFacing.North]: TetrominoFacing.West,
            [TetrominoFacing.East]: TetrominoFacing.North,
            [TetrominoFacing.South]: TetrominoFacing.East,
            [TetrominoFacing.West]: TetrominoFacing.South
        },
        [TetrominoRotation.OneEighty]: {
            [TetrominoFacing.North]: TetrominoFacing.South,
            [TetrominoFacing.East]: TetrominoFacing.West,
            [TetrominoFacing.South]: TetrominoFacing.North,
            [TetrominoFacing.West]: TetrominoFacing.East
        }
    };

    static KICKS = {
        x: {
            [TetrominoRotation.Clockwise]: {
                [TetrominoFacing.North]: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
                [TetrominoFacing.East]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [TetrominoFacing.South]: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [TetrominoFacing.West]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
            },
            [TetrominoRotation.CounterClockwise]: {
                [TetrominoFacing.North]: [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
                [TetrominoFacing.East]: [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
                [TetrominoFacing.South]: [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
                [TetrominoFacing.West]: [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
            },
            [TetrominoRotation.OneEighty]: {
                [TetrominoFacing.North]: [[0, 0], [0, 1], [1, 1], [-1, 1], [1, 0], [-1, 0]],
                [TetrominoFacing.East]: [[0, 0], [1, 0], [1, 2], [1, 1], [0, 2], [0, 1]],
                [TetrominoFacing.South]: [[0, 0], [0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]],
                [TetrominoFacing.West]: [[0, 0], [-1, 0], [-1, 2], [-1, 1], [0, 2], [0, 1]]
            }
        },
        I: {
            [TetrominoRotation.Clockwise]: {
                [TetrominoFacing.North]: [[0, 0], [1, 0], [-2, 0], [-2, -1], [1, 2]],
                [TetrominoFacing.East]: [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
                [TetrominoFacing.South]: [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
                [TetrominoFacing.West]: [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]
            },
            [TetrominoRotation.CounterClockwise]: {
                [TetrominoFacing.North]: [[0, 0], [-1, 0], [2, 0], [2, -1], [-1, 2]],
                [TetrominoFacing.East]: [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
                [TetrominoFacing.South]: [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
                [TetrominoFacing.West]: [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]]
            },
            [TetrominoRotation.OneEighty]: {
                [TetrominoFacing.North]: [[0, 0], [0, 1], [1, 1], [-1, 1], [1, 0], [-1, 0]],
                [TetrominoFacing.East]: [[0, 0], [1, 0], [1, 2], [1, 1], [0, 2], [0, 1]],
                [TetrominoFacing.South]: [[0, 0], [0, -1], [-1, -1], [1, -1], [-1, 0], [1, 0]],
                [TetrominoFacing.West]: [[0, 0], [-1, 0], [-1, 2], [-1, 1], [0, 2], [0, 1]]
            }
        }
    };

    type;
    facing;
    position;

    get blocks() {
        return Tetromino.SHAPES[this.type][this.facing];
    }

    get color() {
        return Tetromino.COLORS[this.type];
    }

    constructor(type, facing = TetrominoFacing.North, position = [MATRIX_WIDTH / 2 - 1, MATRIX_HEIGHT]) {
        this.type = type;
        this.facing = facing;
        this.position = position;
    }

    isColliding() {
        return this.blocks.some(block => {
            let x = this.position[0] + block[0];
            let y = this.position[1] + block[1];
            return x < 0 || x >= MATRIX_WIDTH || y < 0 || Game.field[y]?.[x];
        });
    }

    willCollide(direction) {
        return this.blocks.some(block => {
            let x = this.position[0] + direction[0] + block[0];
            let y = this.position[1] + direction[1] + block[1];
            return x < 0 || x >= MATRIX_WIDTH || y < 0 || Game.field[y]?.[x];
        });
    }

    moveUnchecked(direction) {
        this.position[0] += direction[0];
        this.position[1] += direction[1];
    }

    move(direction) {
        let x = this.position[0];
        let y = this.position[1];
        this.moveUnchecked(direction);
        if (this.isColliding()) {
            this.position = [x, y];
            return -1;
        }
        return 0;
    }

    rotateUnchecked(rotation) {
        this.facing = Tetromino.ROTATIONS[rotation][this.facing];
    }

    rotate(rotation) {
        let facing = this.facing;
        let x = this.position[0];
        let y = this.position[1];
        this.rotateUnchecked(rotation)
        let kicks = this.type === TetrominoType.I ? Tetromino.KICKS.I : Tetromino.KICKS.x;
        for (const kick of kicks[rotation][facing]) {
            this.moveUnchecked(kick);
            if (!this.isColliding())
                return 0;
            this.position = [x, y];
        }
        this.facing = facing;
        this.position = [x, y];
        return -1;
    }
}

const InputCommand = {
    MoveLeft: Symbol('MoveLeft'),
    MoveRight: Symbol('MoveRight'),
    HardDrop: Symbol('HardDrop'),
    SoftDrop: Symbol('SoftDrop'),
    RotateClockwise: Symbol('RotateClockwise'),
    RotateCounterClockwise: Symbol('RotateCounterclockwise'),
    RotateOneEighty: Symbol('RotateOneEighty'),
    Hold: Symbol('Hold'),
    Pause: Symbol('Pause')
};

const InputType = {
    KeyDown: Symbol('KeyDown'),
    KeyUp: Symbol('KeyUp')
};

class Input {
    static HANDLING = {
        AUTO_REPEAT_RATE: 33,
        DELAYED_AUTO_SHIFT: 167,
        SOFT_DROP_FACTOR: 20
    };

    static keybinds = {
        [InputCommand.MoveLeft]: ['ArrowLeft'],
        [InputCommand.MoveRight]: ['ArrowRight'],
        [InputCommand.HardDrop]: ['Space'],
        [InputCommand.SoftDrop]: ['ArrowDown'],
        [InputCommand.RotateClockwise]: ['KeyX', 'ArrowUp'],
        [InputCommand.RotateCounterClockwise]: ['KeyZ', 'ControlLeft', 'ControlRight'],
        [InputCommand.RotateOneEighty]: ['KeyA'],
        [InputCommand.Hold]: ['ShiftLeft', 'ShiftRight', 'KeyC'],
        [InputCommand.Pause]: ['Escape', 'F1']
    };

    static get reversedKeybinds() {
        let reversedKeybinds = {};
        for (const command of Reflect.ownKeys(this.keybinds))
            for (const key of this.keybinds[command])
                reversedKeybinds[key] = command;
        return reversedKeybinds;
    }

    static actions = {
        DASLeftWait: false,
        DASRightWait: false,
        DASLeft: false,
        DASRight: false,
        SoftDrop: false
    };

    static DASLeftTimeout = null;
    static DASRightTimeout = null;
    static ARRLeftInterval = null;
    static ARRRightInterval = null;

    static from(event, type) {
        let command = this.reversedKeybinds[event.code];
        if (command !== undefined)
            return new Input(command, type);
    }

    command;
    type;

    constructor(command, type) {
        this.command = command;
        this.type = type;
    }
}

onkeydown = event => {
    if (event.repeat || Game.finished)
        return;
    let input = Input.from(event, InputType.KeyDown);
    if (input === undefined)
        return;
    switch (input.command) {
        case (InputCommand.MoveLeft):
            clearInterval(Input.ARRRightInterval);
            Input.ARRRightInterval = null;
            Input.actions.DASLeftWait = true;

            if (Game.tetrominoInPlay.move([-1, 0]) === 0)
                Game.onMove();

            Input.DASLeftTimeout = setTimeout(_ => {
                Input.actions.DASLeft = true;
                Input.actions.DASLeftWait = false;

                if (Input.actions.DASRightWait)
                    return;

                Input.ARRLeftInterval = setInterval(_ => {
                    if (Game.tetrominoInPlay.move([-1, 0]) === 0)
                        Game.onMove();
                }, Input.HANDLING.AUTO_REPEAT_RATE);
            }, Input.HANDLING.DELAYED_AUTO_SHIFT);
            break;
        case (InputCommand.MoveRight):
            clearInterval(Input.ARRLeftInterval);
            Input.ARRLeftInterval = null;
            Input.actions.DASRightWait = true;

            if (Game.tetrominoInPlay.move([1, 0]) === 0)
                Game.onMove();

            Input.DASRightTimeout = setTimeout(_ => {
                Input.actions.DASRight = true;
                Input.actions.DASRightWait = false;

                if (Input.actions.DASLeftWait)
                    return;

                Input.ARRRightInterval = setInterval(_ => {
                    if (Game.tetrominoInPlay.move([1, 0]) === 0)
                        Game.onMove();
                }, Input.HANDLING.AUTO_REPEAT_RATE)
            }, Input.HANDLING.DELAYED_AUTO_SHIFT);
            break;
        case (InputCommand.HardDrop):
            Game.lockDown();
            break;
        case (InputCommand.SoftDrop):
            Input.actions.SoftDrop = true;
            if (!Game.tetrominoInPlay.willCollide([0, -1])) {
                clearTimeout(Game.fallTimeout);
                Game.fallTimeout = null;
                Game.softDrop();
            }
            break;
        case (InputCommand.RotateClockwise):
            if (Game.tetrominoInPlay.rotate(TetrominoRotation.Clockwise) === 0)
                Game.onMove();
            break;
        case (InputCommand.RotateCounterClockwise):
            if (Game.tetrominoInPlay.rotate(TetrominoRotation.CounterClockwise) === 0)
                Game.onMove();
            break;
        case (InputCommand.RotateOneEighty):
            if (Game.tetrominoInPlay.rotate(TetrominoRotation.OneEighty) === 0)
                Game.onMove();
            break;
        case (InputCommand.Hold):
            if (Game.holdLocked)
                break;
            Game.holdLocked = true;
            hold = Game.hold;
            Game.hold = Game.tetrominoInPlay.type;
            Game.generate(hold);
            break;
        case (InputCommand.Pause):
            break;
    }
};

onkeyup = event => {
    if (Game.finished)
        return;
    let input = Input.from(event, InputType.KeyUp);
    if (input === undefined)
        return;
    switch (input.command) {
        case (InputCommand.MoveLeft):
            clearTimeout(Input.DASLeftTimeout);
            clearInterval(Input.ARRLeftInterval);
            Input.DASLeftTimeout = null;
            Input.ARRLeftInterval = null;

            Input.actions.DASLeft = false;
            Input.actions.DASLeftWait = false;

            if (Input.actions.DASRight && Input.ARRRightInterval === null)
                Input.ARRRightInterval = setInterval(_ => {
                    if (Game.tetrominoInPlay.move([1, 0]) === 0)
                        Game.onMove();
                }, Input.HANDLING.AUTO_REPEAT_RATE);
            break;
        case (InputCommand.MoveRight):
            clearTimeout(Input.DASRightTimeout);
            clearInterval(Input.ARRRightInterval);
            Input.DASRightTimeout = null;
            Input.ARRRightInterval = null;

            Input.actions.DASRight = false;
            Input.actions.DASRightWait = false;

            if (Input.actions.DASLeft && Input.ARRLeftInterval === null)
                Input.ARRLeftInterval = setInterval(_ => {
                    if (Game.tetrominoInPlay.move([-1, 0]) === 0)
                        Game.onMove();
                }, Input.HANDLING.AUTO_REPEAT_RATE);
            break;
        case (InputCommand.HardDrop):
            break;
        case (InputCommand.SoftDrop):
            Input.actions.SoftDrop = false;
            clearTimeout(Game.softDropTimeout);
            Game.softDropTimeout = null;
            if (!Game.tetrominoInPlay.willCollide([0, -1])) {
                Game.fall(true);
            }
            break;
        case (InputCommand.RotateClockwise):
            break;
        case (InputCommand.RotateCounterClockwise):
            break;
        case (InputCommand.RotateOneEighty):
            break;
        case (InputCommand.Hold):
            break;
        case (InputCommand.Pause):
            break;
    }
};

const Renderer = {
    drawGrid() {
        matrixCtx.lineWidth = 1;
        matrixCtx.strokeStyle = 'gray';
        for (let row = 1; row < MATRIX_HEIGHT; row++) {
            matrixCtx.beginPath();
            matrixCtx.moveTo(0, row * BLOCK_SIZE);
            matrixCtx.lineTo(matrix.width, row * BLOCK_SIZE);
            matrixCtx.stroke();
        }
        for (let col = 1; col < MATRIX_WIDTH; col++) {
            matrixCtx.beginPath();
            matrixCtx.moveTo(col * BLOCK_SIZE, 0);
            matrixCtx.lineTo(col * BLOCK_SIZE, matrix.height);
            matrixCtx.stroke();
        }
    },

    drawTetrominoHelper(ctx, type, position, facing, color) {
        tetromino = new Tetromino(type, facing);
        ctx.beginPath();
        ctx.fillStyle = color ?? tetromino.color;
        for (const block of tetromino.blocks)
            ctx.rect(block[0] * BLOCK_SIZE + position[0], -block[1] * BLOCK_SIZE + position[1], BLOCK_SIZE, BLOCK_SIZE);
        ctx.fill();
    },

    drawTetromino(tetromino) {
        position = [tetromino.position[0] * BLOCK_SIZE, (MATRIX_HEIGHT - tetromino.position[1] - 1) * BLOCK_SIZE];
        this.drawTetrominoHelper(matrixCtx, tetromino.type, position, tetromino.facing, tetromino === Game.shadow ? COLORS.GRAY : undefined);
    },

    drawField() {
        for (let row = 0; row < MATRIX_HEIGHT; row++) {
            for (let col = 0; col < MATRIX_WIDTH; col++) {
                let block = Game.field[row][col];
                if (block === null)
                    continue;
                matrixCtx.fillStyle = block;
                matrixCtx.fillRect(col * BLOCK_SIZE, (MATRIX_HEIGHT - row - 1) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    },

    drawNextQueue() {
        for (const [i, type] of Game.nextQueue.entries()) {
            position = [
                type === TetrominoType.I || type === TetrominoType.O ? 1.5 * BLOCK_SIZE : 2 * BLOCK_SIZE,
                type === TetrominoType.I ? (3 * i + 1.5) * BLOCK_SIZE : (3 * i + 2) * BLOCK_SIZE
            ];
            this.drawTetrominoHelper(nextQueueCtx, type, position, TetrominoFacing.North)
        }
    },

    drawHoldSlot() {
        if (Game.hold === null)
            return;
        position = [
            Game.hold === TetrominoType.I || Game.hold === TetrominoType.O ? 1.5 * BLOCK_SIZE : 2 * BLOCK_SIZE,
            Game.hold === TetrominoType.I ? 1.5 * BLOCK_SIZE : 2 * BLOCK_SIZE
        ];
        this.drawTetrominoHelper(holdSlotCtx, Game.hold, position, TetrominoFacing.North, Game.holdLocked ? COLORS.GRAY : undefined)
    },

    draw() {
        matrixCtx.clearRect(0, 0, matrix.width, matrix.height);
        nextQueueCtx.clearRect(0, 0, nextQueue.width, nextQueue.height);
        holdSlotCtx.clearRect(0, 0, holdSlot.width, holdSlot.height);
        this.drawNextQueue();
        this.drawHoldSlot();
        this.drawGrid();
        this.drawTetromino(Game.shadow);
        this.drawTetromino(Game.tetrominoInPlay);
        this.drawField();
    }
};

const Game = {
    FRESH_BAG: [TetrominoType.O, TetrominoType.I, TetrominoType.T, TetrominoType.L, TetrominoType.J, TetrominoType.S, TetrominoType.Z],
    get nextTetromino() {
        let tetromino = this.bag.splice(Math.floor(Math.random() * this.bag.length), 1)[0];
        if (this.bag.length === 0)
            this.bag = [...this.FRESH_BAG];
        return tetromino;
    },

    bag: [],
    nextQueue: [],
    tetrominoInPlay: undefined,
    shadow: undefined,
    hold: undefined,
    holdLocked: undefined,
    field: [],
    gravity: undefined,

    finished: undefined,
    timeElapsed: undefined,
    timeInterval: undefined,
    pieceCount: undefined,
    lineClearCount: undefined,

    gravityTimeout: undefined,
    fallTimeout: undefined,
    softDropTimeout: undefined,
    lockTimeout: undefined,
    locking: undefined,
    lockInputCount: undefined,

    setShadow() {
        tetromino = this.tetrominoInPlay;
        this.shadow = new Tetromino(tetromino.type, tetromino.facing, [...tetromino.position]);
        while (this.shadow.move([0, -1]) === 0);
    },

    clearTimers() {
        clearTimeout(this.fallTimeout);
        clearTimeout(this.softDropTimeout);
        clearTimeout(this.lockTimeout);
        this.fallTimeout = null;
        this.softDropTimeout = null;
        this.lockTimeout = null;
        this.locking = false;
        this.lockInputCount = 0;
    },

    init() {
        this.bag = [...this.FRESH_BAG];
        this.nextQueue = Array.from({ length: 5 }, _ => this.nextTetromino);
        this.hold = null;
        this.holdLocked = false;
        this.field = Array(MATRIX_HEIGHT + 10).fill().map(_ => Array(MATRIX_WIDTH).fill(null));
        this.gravity = 0.5;
        this.gravityInterval = null;
        this.timeElapsed = 0;
        this.timeInterval = null;
        this.pieceCount = 0;
        this.lineClearCount = 0;
        this.finished = false;
        this.clearTimers();
    },

    onMove() {
        this.setShadow();
        if (!this.locking)
            return;
        this.lockInputCount++;
        clearTimeout(this.lockTimeout);
        if (this.tetrominoInPlay.willCollide([0, -1])) {
            if (this.lockInputCount > 15)
                this.lockDown();
            else
                this.lock();
            return;
        }
        if (this.fallTimeout !== null || this.softDropTimeout !== null)
            return;
        this.lockTimeout = null;
        if (Input.actions.SoftDrop) {
            this.softDrop(true);
        } else {
            this.fall(true);
        }
    },

    start() {
        this.generate();
        this.gravityInterval = setInterval(_ => this.gravity += 0.1, 5000);
        this.timeInterval = setInterval(_ => {
            this.timeElapsed++;
            timeElapsed.innerHTML = new Date(this.timeElapsed * 1000).toISOString().substring(14, 19)
        }, 1000);
    },

    generate(type) {
        this.clearTimers();

        if (type)
            this.tetrominoInPlay = new Tetromino(type);
        else {
            this.tetrominoInPlay = new Tetromino(this.nextQueue.shift(), TetrominoFacing.North);
            this.nextQueue.push(this.nextTetromino);
        }
        if (this.tetrominoInPlay.isColliding()) {
            this.finish();
            return;
        }
        this.setShadow();

        if (Input.actions.SoftDrop) {
            this.softDrop();
        } else {
            this.fall();
        }
    },

    fall(wait) {
        if (wait) {
            this.fallTimeout = setTimeout(this.fall.bind(this), 1000 / this.gravity);
            return;
        }

        this.tetrominoInPlay.move([0, -1]);

        if (this.tetrominoInPlay.willCollide([0, -1])) {
            if (this.lockInputCount > 15)
                this.lockDown();
            else {
                this.locking = true;
                this.lock();
            }
            this.fallTimeout = null;
        } else
            this.fall(true);
    },

    softDrop(wait) {
        if (wait) {
            this.softDropTimeout = setTimeout(this.softDrop.bind(this), 1000 / this.gravity / Input.HANDLING.SOFT_DROP_FACTOR);
            return;
        }

        this.tetrominoInPlay.move([0, -1]);

        if (this.tetrominoInPlay.willCollide([0, -1])) {
            if (this.lockInputCount > 15)
                this.lockDown();
            else {
                this.locking = true;
                this.lock();
            }
            this.softDropTimeout = null;
        } else
            this.softDrop(true);
    },

    lock() {
        this.lockTimeout = setTimeout(this.lockDown.bind(this), 500);
    },

    lockDown() {
        this.tetrominoInPlay.position = [...this.shadow.position];

        for (const block of this.tetrominoInPlay.blocks) {
            this.field[this.tetrominoInPlay.position[1] + block[1]][this.tetrominoInPlay.position[0] + block[0]] = this.tetrominoInPlay.color;
        }

        this.pieceCount++;
        pieceCount.innerHTML = this.pieceCount + (this.pieceCount === 1 ? ' piece placed' : ' pieces placed');

        this.field = this.field.filter(row => row.some(cell => cell === null));

        this.lineClearCount += MATRIX_HEIGHT - this.field.length + 10;
        lineClearCount.innerHTML = this.lineClearCount + (this.lineClearCount === 1 ? ' line cleared' : ' lines cleared');

        this.field.push(...Array(MATRIX_HEIGHT - this.field.length + 10).fill().map(_ => Array(MATRIX_WIDTH).fill(null)));

        this.holdLocked = false;
        this.generate();
    },

    finish() {
        this.clearTimers();
        clearInterval(this.gravityInterval);
        clearInterval(this.timeInterval);
        this.gravityInterval = null;
        this.timeInterval = null;
        this.finished = true;
        msg.innerHTML = "Game over";
    }
};

function draw() {
    Renderer.draw();
    requestAnimationFrame(draw);
}

Game.init();
Game.start();
requestAnimationFrame(draw);

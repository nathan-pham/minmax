export const OPTIONS = {
    O: "O", // -1, min
    X: "X", // +1, max
    _: " ",
};

export default class Board {
    parentBoard = null;
    futureBoards = [];
    rows = 3;
    cols = 3;
    v = null;

    constructor(initialState, currentTurn = OPTIONS.O) {
        this.state = initialState || this.createBoard();
        this.turn = currentTurn;
    }

    incrementTurn() {
        if (this.turn === OPTIONS.O) {
            this.turn = OPTIONS.X;
        } else {
            this.turn = OPTIONS.O;
        }

        return this;
    }

    setParent(parentBoard) {
        this.parentBoard = parentBoard;
        return this;
    }

    setValue(i, j, value) {
        this.state[i][j] = value;
        return this;
    }

    getValue(i, j) {
        return this.state[i][j];
    }

    copyState() {
        const state = [];
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(this.getValue(i, j));
            }
            state.push(row);
        }

        return state;
    }

    copy() {
        return new Board(this.copyState(), this.turn);
    }

    toJSON() {
        return {
            ...this,
            futureBoards: this.futureBoards.map((b) => b.toJSON()),
            parentBoard: null,
        };
    }

    toString() {
        const delimiter = " | ";
        const spacerLength = delimiter.length * (this.rows - 1) + this.rows + 4;
        const spacer = new Array(spacerLength).fill("-").join("") + "\n";

        let boardString = "";

        boardString += spacer;
        for (let i = 0; i < this.state.length; i++) {
            const row = this.state[i];
            const rowString = row.join(delimiter);
            boardString += `| ${rowString} |\n${spacer}`;
        }

        return boardString;
    }

    createBoard() {
        const state = [];
        for (let i = 0; i < this.rows; i++) {
            const row = [];
            for (let j = 0; j < this.cols; j++) {
                row.push(OPTIONS._);
            }

            state.push(row);
        }

        return state;
    }

    traverseBoard(cb) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const result = cb(this.getValue(i, j), i, j);
                if (result) {
                    this.setValue(i, j, result);
                }
            }
        }
    }

    calculateMoves() {
        const futureBoards = [];
        this.traverseBoard((cell, i, j) => {
            if (cell === OPTIONS._) {
                futureBoards.push(
                    this.copy()
                        .setValue(i, j, this.turn)
                        .incrementTurn()
                        .setParent(this)
                        .calculateMoves()
                );
            }
        });

        this.futureBoards = futureBoards;
        return this;
    }

    getWinner() {
        // check rows for winner
        for (const row of this.state) {
            if (Board.isUniform(row)) {
                return row[0];
            }
        }

        // check columns for winner
        for (let i = 0; i < this.rows; i++) {
            const col = [];
            for (let j = 0; j < this.cols; j++) {
                col.push(this.getValue(j, i));
            }

            if (Board.isUniform(col)) {
                return col[0];
            }
        }

        // check diagonals for winner
        // slant: \
        const downwardSlant = [
            this.getValue(0, 0),
            this.getValue(1, 1),
            this.getValue(2, 2),
        ];

        if (Board.isUniform(downwardSlant)) {
            return downwardSlant[0];
        }

        // slant: /
        const upwardSlant = [
            this.getValue(0, 2),
            this.getValue(1, 1),
            this.getValue(2, 0),
        ];

        if (Board.isUniform(upwardSlant)) {
            return upwardSlant[0];
        }

        // no one won
        return null;
    }

    isFilled() {
        let filled = true;
        this.traverseBoard((cell) => {
            if (cell === OPTIONS._) {
                filled = false;
            }
        });

        return filled;
    }

    evalulateTree() {
        const analyze = (board) => {
            // exit condition: we already calculated a v
            if (board.v !== null) {
                return;
            }

            const winner = board.getWinner();
            if (winner) {
                board.v = 0;
                if (winner === OPTIONS.O) {
                    board.v = -1;
                } else if (winner === OPTIONS.X) {
                    board.v = 1;
                }
            }

            // board has children that are evaluated
            else if (
                board.futureBoards.find((b) => b.v !== null) instanceof Board
            ) {
                const vs = board.futureBoards.map((b) => b.v);
                if (vs.includes(null)) {
                    for (const childBoard of board.futureBoards) {
                        analyze(childBoard);
                    }

                    return;
                }

                // case 1: all of child boards have the same v
                if (Board.isUniform(vs)) {
                    board.v = vs[0];
                }

                // case 2: it's X's turn and the child boards have a winning state
                if (this.turn === OPTIONS.X && vs.includes(1)) {
                    board.v = 1;
                }

                // case 3: it's O's turn and the child boards have a winning state
                if (this.turn === OPTIONS.O && vs.includes(-1)) {
                    board.v = -1;
                }
            } else {
                for (const childBoard of board.futureBoards) {
                    analyze(childBoard);
                }
                board.parentBoard && analyze(board.parentBoard);
            }
            // else {

            // }
        };

        analyze(this);
    }

    static topMostParent(board) {
        return board.parentBoard && Board.topMostParent(board.parentBoard);
    }

    static isUniform(array) {
        for (let i = 1; i < array.length; i++) {
            // if the prev el is not equal to the current el
            // the array is not uniform
            if (array[i - 1] !== array[i]) {
                return false;
            }
        }

        return true;
    }

    static randomOption() {
        const keys = Object.keys(OPTIONS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return OPTIONS[randomKey];
    }

    log() {
        console.group();
        console.log(`${this.toString()}\nv = ${this.v}`);
        this.futureBoards.forEach((b) => b.log());
        console.groupEnd();
    }
}

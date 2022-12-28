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

    setState(state) {
        this.state = state;
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

        return boardString.trim();
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

        if (this.getWinner() || this.isFilled()) {
            this.futureBoards = futureBoards;
            return this;
        }

        this.traverseBoard((cell, i, j) => {
            if (cell === OPTIONS._) {
                const futureBoard = this.copy()
                    .setValue(i, j, this.turn)
                    .incrementTurn()
                    .calculateMoves()
                    .setParent(this);

                futureBoards.push(futureBoard);
            }
        });

        this.futureBoards = futureBoards;
        return this;
    }

    getWinner() {
        const winningRow = (row) =>
            Board.isUniform(row) && row[0] !== OPTIONS._;

        // check rows for winner
        for (const row of this.state) {
            if (winningRow(row)) {
                return row[0];
            }
        }

        // check columns for winner
        for (let i = 0; i < this.rows; i++) {
            const col = [];
            for (let j = 0; j < this.cols; j++) {
                col.push(this.getValue(j, i));
            }

            if (winningRow(col)) {
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

        if (winningRow(downwardSlant)) {
            return downwardSlant[0];
        }

        // slant: /
        const upwardSlant = [
            this.getValue(0, 2),
            this.getValue(1, 1),
            this.getValue(2, 0),
        ];

        if (winningRow(upwardSlant)) {
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

    /**
     * Get a flattened list of boards & their depth
     * @param {number} depth - Initial starting depth
     * @returns {{board: Board, depth: number}[]} Array of boards
     */
    flattenBoards(depth = 0) {
        const boards = [{ depth, board: this }];
        if (this.futureBoards.length === 0) {
            return boards;
        }

        for (const board of this.futureBoards) {
            boards.push(...board.flattenBoards(depth + 1));
        }

        return boards;
    }

    /**
     * Get the appropriate value for a board
     * @param {Board} board - Board to analyze
     */
    static analyzeBoard(board) {
        // exit condition: we already calculated a v
        if (board.v !== null) {
            return;
        }

        const vs = board.futureBoards.map((b) => b.v);
        if (vs.includes(null)) {
            throw new Error("A child board has not been analyzed...");
        }

        const winner = board.getWinner();
        if (winner) {
            board.v = 0;
            if (winner === OPTIONS.X) {
                board.v = 1;
            } else if (winner === OPTIONS.O) {
                board.v = -1;
            }
        } else if (board.isFilled()) {
            board.v = 0;
        }

        // case 1: all of child boards have the same v
        if (Board.isUniform(vs) && typeof vs[0] === "number") {
            board.v = vs[0];
        }

        // case 2: it's X's turn and the child boards have a winning state
        else if (board.turn === OPTIONS.X) {
            if (vs.includes(1)) {
                board.v = 1;
            } else if (vs.includes(0)) {
                board.v = 0;
            } else if (vs.includes(-1)) {
                board.v = -1;
            }
        }

        // case 3: it's O's turn and the child boards have a winning state
        else if (board.turn === OPTIONS.O) {
            if (vs.includes(-1)) {
                board.v = -1;
            } else if (vs.includes(0)) {
                board.v = 0;
            } else if (vs.includes(1)) {
                board.v = 1;
            }
        }
        if (board.v === null) {
            throw new Error("hm");
        }
    }

    evalulateTree() {
        let boards = this.flattenBoards();
        boards.sort((boardA, boardB) => boardB.depth - boardA.depth);
        boards = boards.map(({ board }) => board);

        for (const board of boards) {
            Board.analyzeBoard(board);
        }

        return this;
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
        console.log(`${this.toString()}v = ${this.v}\n`);
        this.futureBoards.forEach((b) => b.log());
        console.groupEnd();
    }
}

export const createBoard = () =>
    new Board([
        [" ", " ", " "],
        [" ", " ", " "],
        [" ", " ", " "],
    ]);

import Board from "./Board.js";

const board = new Board([
    ["O", "X", "O"],
    ["X", " ", "X"],
    [" ", "O", " "],
]);

board.calculateMoves();
board.evalulateTree();

board.log();

// console.log(board);

// fs.writeFileSync("./test.json", JSON.stringify(board.toJSON(), null, 4));

// console.log(board.futureBoards.length);

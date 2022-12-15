import Board from "./Board.js";
import * as fs from "fs";

const board = new Board([
    ["O", "X", "O"],
    ["X", " ", "X"],
    [" ", "O", " "],
]);

console.log(board.getWinner());
// console.log(board.toString());
board.calculateMoves();
board.evalulateTree();

board.log();

// console.log(board);

// fs.writeFileSync("./test.json", JSON.stringify(board.toJSON(), null, 4));

// console.log(board.futureBoards.length);

import Board, { OPTIONS } from "./Board.js";
import prompt from "./prompt.js";

let board = new Board([
    [" ", " ", " "],
    [" ", " ", " "],
    [" ", " ", " "],
]);

while (true) {
    console.log(board.toString());

    // your move
    const moveX = await prompt("x > ");
    const moveY = await prompt("y > ");
    board.setValue(moveY, moveX, board.turn);
    board.incrementTurn().calculateMoves().evalulateTree();
    const vs = board.futureBoards.map((b) => b.v);

    console.log(vs);

    if (vs.includes(1)) {
        board = board.futureBoards[vs.indexOf(1)];
        console.log("test 1");
    } else if (vs.includes(-1)) {
        board = board.futureBoards[vs.indexOf(-1)];
        console.log("test 2");
    } else if (vs.includes(0)) {
        board = board.futureBoards[vs.indexOf(0)];
        console.log("test 3");
    } else {
        console.log("test 4");
    }
}

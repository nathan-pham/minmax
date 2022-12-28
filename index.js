import { createBoard, OPTIONS } from "./Board.js";
import prompt from "./prompt.js";

let board = createBoard();

const checkEndState = () => {
    const winner = board.getWinner();
    if (winner) {
        console.log(board.toString());
        console.log(winner, "wins!");
        board = createBoard();
        return true;
    } else if (board.isFilled()) {
        console.log(board.toString());
        console.log("A tie!");
        board = createBoard();
        return true;
    }

    return false;
};

while (true) {
    console.log(board.toString());

    board.turn = OPTIONS.O;

    // your move
    const moveX = parseInt(await prompt("x > ")) - 1;
    const moveY = parseInt(await prompt("y > ")) - 1;
    if (board.getValue(moveY, moveX) !== OPTIONS._) {
        console.log("Hey!", board.getValue(moveY, moveX), "is already there!");
        continue;
    }

    board.setValue(moveY, moveX, board.turn);

    board.turn = OPTIONS.X;
    board.calculateMoves().evalulateTree();
    const vs = board.futureBoards.map((b) => b.v);

    // check endstate before moves
    if (vs.length === 0 && checkEndState()) {
        continue;
    }

    // shouldn't happen
    // if (vs.includes(1)) {
    //     console.log("hmm");
    //     board = board.futureBoards[vs.indexOf(1)];
    // } else

    if (vs.includes(0)) {
        board = board.futureBoards[vs.indexOf(0)];
    } else if (vs.includes(-1)) {
        board = board.futureBoards[vs.indexOf(-1)];
    } else {
        console.log(vs);
        throw new Error("Investigate board moves, vs are invalid.");
    }

    // check endstate after moves
    if (checkEndState()) {
        continue;
    }
}

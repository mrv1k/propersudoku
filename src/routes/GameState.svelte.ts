const X = '-';
const NUMBER_KEYS = Array.from({ length: 9 }).map((_, i) => i + 1)
export const INPUT = [...NUMBER_KEYS, X]

// TODO: read & write state to url
const initialBoard = [
        ['5', '3', X, X, '7', X, X, X, X],
        ['6', X, X, '1', '9', '5', X, X, X],
        [X, '9', '8', X, X, X, X, '6', X],
        ['8', X, X, X, '6', X, X, X, '3'],
        ['4', X, X, '8', X, '3', X, X, '1'],
        ['7', X, X, X, '2', X, X, X, '6'],
        [X, '6', X, X, X, X, '2', '8', X],
        [X, X, X, '4', '1', '9', X, X, '5'],
        [X, X, X, X, '8', X, X, '7', '9'],
];

const emptyBoardRow = Array.from({ length: 9 }).map(() => X);
const emptyBoard = Array.from({ length: 9 }).map(() => [...emptyBoardRow]);

export class GameState {
        userBoard = $state(emptyBoard);
        userRow = $state(-1);
        userCol = $state(-1);

        isAnyCellActive = $derived(!this.compareCell(-1, -1));
        //let userBoardSolved = emptyBoard;
        constructor() { }

        selectCell(rowIndex: number, colIndex: number) {
                const currentCellIsActive = this.compareCell(rowIndex, colIndex);
                if (!currentCellIsActive) {
                        this.userRow = rowIndex;
                        this.userCol = colIndex;
                } else {
                        this.deselectCell();
                }
        }

        deselectCell() {
                this.userRow = -1;
                this.userCol = -1;
        };

        handleUserInput(key: string) {
                this.userBoard[this.userRow][this.userCol] = String(key);
                this.deselectCell();
        };

        handleNumberInput(key: string) {
                //if ($settingInputValidation) {
                //        //const mine = checkAll(key);
                //        const stolen = isValid(userBoard, userRow, userCol, key);
                //        if (stolen) {
                //                handleUserInput(key);
                //        }
                //        return;
                //}

                this.handleUserInput(key);
        };

        resetCellValue() {
                this.handleUserInput(X)
                //this.deselectCell()
        }

        compareCell(rowIndex: number, colIndex: number) {
                return this.userRow === rowIndex && this.userCol === colIndex;
        }

}





//let isBoardWinChecked = $state(false);
//let isUserWin = $state(false);

//const checkIsCell = (row, col, boardA, boardB) => boardA[row][col] === boardB[row][col];
//const checkIsCellUserInput = (row, col) => !checkIsCell(row, col, userBoard, initialBoard);
//const checkIsCellValid = (row, col) => checkIsCell(row, col, userBoard, userBoardSolved);
//
//const checkBoard = () => {
//        isBoardWinChecked = true;
//        const isCorrect = userBoard.toString() === userBoardSolved.toString();
//        if (isCorrect) {
//                resetUserSelectedCell();
//        }
//        isUserWin = isCorrect;
//};

//
//const getArrNumbers = (arr = []) => arr.filter((n) => n !== X).map((n) => Number(n));
//const check = (arr, n) => !arr.includes(n);
//
//const getColNumbers = (col, board) => getArrNumbers(board.map((row) => row[col]));
//const checkCol = (col, num, board) => check(getColNumbers(col, board), num);
//
//const getRowNumbers = (row, board) => getArrNumbers(board[row]);
//const checkRow = (row, key, board) => check(getRowNumbers(row, board), key);
//
//const get3x3Numbers = (row, col, board) => {
//        let square = [];
//
//        if (row < 3) {
//                square = board.slice(0, 3);
//        } else if (row < 6) {
//                square = board.slice(3, 6);
//        } else {
//                square = board.slice(6);
//        }
//
//        if (col < 3) {
//                square = square.map((row) => row.slice(0, 3));
//        } else if (col < 6) {
//                square = square.map((row) => row.slice(3, 6));
//        } else {
//                square = square.map((row) => row.slice(6));
//        }
//        return getArrNumbers(square.flatMap((row) => row));
//};
//const check3x3 = (row, col, key, board) => check(get3x3Numbers(row, col, board), key);
//
//const checkAll = (gameRow, gameCol, key, gameBoard) => {
//        const row = gameRow ?? userRow;
//        const col = gameCol ?? userCol;
//        const board = gameBoard ?? userBoard;
//        const num = Number(key);
//        const isValidRow = checkRow(row, num, board);
//        const isValidCol = checkCol(col, num, board);
//        const isValid3x3 = check3x3(row, col, num, board);
//        return isValidRow && isValidCol && isValid3x3;
//};

function dfs(board) {
        // for every cell in the sudoku
        for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                        // if its empty
                        if (board[row][col] !== X) {
                                continue;
                        }
                        // try every number 1-9
                        for (let i = 1; i <= 9; i++) {
                                const c = i.toString();
                                // if that number is valid
                                if (isValid(board, row, col, c)) {
                                        board[row][col] = c;
                                        // continue search for that board, ret true if solution is reached
                                        if (dfs(board)) {
                                                return true;
                                        }
                                }
                        }
                        // solution wasnt found for any num 1-9 here, must be a dead end...
                        // set the current cell back to empty
                        board[row][col] = X;
                        // ret false to signal dead end
                        return false;
                }
        }
        // all cells filled, must be a solution
        return true;
}

function isValid(board, row, col, c) {
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        //console.log(blockRow, blockCol);
        for (let i = 0; i < 9; i++) {
                if (board[row][i] === c || board[i][col] === c) {
                        return false;
                }
                const curRow = blockRow + Math.floor(i / 3);
                const curCol = blockCol + Math.floor(i % 3);
                if (board[curRow][curCol] === c) {
                        return false;
                }
        }
        return true;
}

//const EMPTY_SET = new Set();
//const findAlreadyUsedNumbers = () => {
//        if (!isAnyCellActive) {
//                return EMPTY_SET;
//        }
//
//        const row = getRowNumbers(userRow, userBoard);
//        const col = getColNumbers(userCol, userBoard);
//        const square = get3x3Numbers(userRow, userCol, userBoard);
//        return new Set([...row, ...col, ...square].sort());
//};
//let invalidNumberKeys = $derived($settingInputValidation ? findAlreadyUsedNumbers() : EMPTY_SET);




//let isBoardInitiated = $state(false);
//
//const solveInit = (board) => {
//        const cloneArray = (items) =>
//                items.map((item) => (Array.isArray(item) ? cloneArray(item) : item));
//
//        const clone = cloneArray(board);
//        dfs(clone);
//        return clone;
//};
//$effect(() => {
//        if (isBoardInitiated) {
//                return;
//        }
//        userBoard = initialBoard;
//        userBoardSolved = solveInit(initialBoard);
//        isBoardInitiated = true;
//});

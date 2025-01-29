import settings from './settings.svelte';

const X = '-';
const NUMBER_KEYS = Array.from({ length: 9 }).map((_, i) => i + 1).map(v => String(v))
export const INPUT: string[] = [...NUMBER_KEYS, X]

type Board = string[][]
// TODO: read & write state to url
const initialBoard: Board = [
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

  isAnyCellActive = $derived(!this.checkIsCellActive(-1, -1));
  constructor() { }

  selectCell(rowIndex: number, colIndex: number) {
    if (this.checkIsCellActive(rowIndex, colIndex)) {
      return this.deselectCell();
    }
    this.userRow = rowIndex;
    this.userCol = colIndex;
  }

  deselectCell() {
    this.userRow = -1;
    this.userCol = -1;
  };

  setCellValue(key: string) {
    if (settings.isValidateInput && !isValueValid(this.userBoard, this.userRow, this.userCol, key)) {
      return
    }

    this.userBoard[this.userRow][this.userCol] = String(key);
    this.deselectCell();
  };

  resetCellValue() {
    this.setCellValue(X)
  }

  checkIsCellActive(rowIndex: number, colIndex: number): boolean {
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


function dfs(board: Board) {
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
        if (isValueValid(board, row, col, c)) {
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

function isValueValid(board: Board, row: number, col: number, value: string) {
  const blockRow = Math.floor(row / 3) * 3;
  const blockCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === value || board[i][col] === value) {
      return false;
    }
    const curRow = blockRow + Math.floor(i / 3);
    const curCol = blockCol + Math.floor(i % 3);
    if (board[curRow][curCol] === value) {
      return false;
    }
  }
  return true;
}

//const getArrNumbers = (arr = []) => arr.filter((n) => n !== X).map((n) => Number(n));
//const check = (arr, n) => !arr.includes(n);
//const getColNumbers = (col, board) => getArrNumbers(board.map((row) => row[col]));
//const getRowNumbers = (row, board) => getArrNumbers(board[row]);
//
//const EMPTY_SET = new Set();
//const findAlreadyUsedNumbers = () => {
//  if (!isAnyCellActive) {
//    return EMPTY_SET;
//  }
//
//  const row = getRowNumbers(userRow, userBoard);
//  const col = getColNumbers(userCol, userBoard);
//  //const square = get3x3Numbers(userRow, userCol, userBoard);
//  return new Set([...row, ...col, ...square].sort());
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

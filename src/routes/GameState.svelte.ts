import type { Settings } from './settings.svelte';

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
  userBoard = $state(initialBoard);
  userRow = $state(-1);
  userCol = $state(-1);
  validNumbers: string[] = $state([])

  isAnyCellActive = $derived(!this.checkIsCellActive(-1, -1));
  validNumbersSet = $derived(new Set(this.validNumbers.filter(v => v !== X)))

  settings: Settings

  constructor(settings: Settings) {
    this.settings = settings
  }

  selectCell(rowIndex: number, colIndex: number) {
    if (this.checkIsCellActive(rowIndex, colIndex)) {
      return this.deselectCell();
    }
    this.userRow = rowIndex;
    this.userCol = colIndex;

    if (this.settings.isValidateInput) {
      this.findValidNumbers()
    }
  }

  deselectCell() {
    this.userRow = -1;
    this.userCol = -1;
  };

  setCellValue(key: string): void {
    if (!this.isAnyCellActive) {
      return
    }

    if (key !== X && this.settings.isValidateInput) {
      if (!checkIsValueValid(this.userBoard, this.userRow, this.userCol, key)) {
        return
      }
    }

    this.userBoard[this.userRow][this.userCol] = key;
    this.deselectCell();
  };

  resetCellValue() {
    this.setCellValue(X)
  }

  checkIsCellActive(rowIndex: number, colIndex: number): boolean {
    return this.userRow === rowIndex && this.userCol === colIndex;
  }

  findValidNumbers(): void {
    this.validNumbers = NUMBER_KEYS.slice()

    const row = this.userRow
    const col = this.userCol

    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
      // use isNaN? -- to avoid coupling to X and enable invalid row / col / square clarification 
      if (this.userBoard[row][i] !== X) {
        const rowIndex = Number(this.userBoard[row][i]) - 1
        this.validNumbers[rowIndex] = X
      }
      if (this.userBoard[i][col] !== X) {
        const colIndex = Number(this.userBoard[i][col]) - 1
        this.validNumbers[colIndex] = X
      }

      const curRow = blockRow + Math.floor(i / 3);
      const curCol = blockCol + Math.floor(i % 3);
      if (this.userBoard[curRow][curCol] !== X) {
        const squareIndex = Number(this.userBoard[curRow][curCol]) - 1
        this.validNumbers[squareIndex] = X
      }
    }
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
        if (checkIsValueValid(board, row, col, c)) {
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

function checkIsValueValid(board: Board, row: number, col: number, value: string): boolean {
  const blockRow = Math.floor(row / 3) * 3;
  const blockCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === value) {
      return false;
    }
    if (board[i][col] === value) {
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

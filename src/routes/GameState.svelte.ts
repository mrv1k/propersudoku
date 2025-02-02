import { getContext, setContext } from 'svelte';
import type { Settings } from './settings.svelte';

const X = '-';
const NUMBERS_INPUT = Array.from({ length: 9 }).map((_, i) => i + 1).map(v => String(v))
type NumberValidation = { value: string, valid: boolean, col: boolean, row: boolean, square: boolean }
const VALIDATED_INPUT_TEMPLATE: NumberValidation[] = NUMBERS_INPUT.map(
  n => ({ value: n, valid: true, col: true, row: true, square: true })
)
export const INPUT: string[] = [...NUMBERS_INPUT, X]

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

const GAME_MANAGER_KEY = Symbol('GameManager')

export function setGameManager(settings: Settings): GameManager {
  return setContext(GAME_MANAGER_KEY, new GameManager(settings))
}
export function getGameManager(): GameManager {
  return getContext<GameManager>(GAME_MANAGER_KEY)
}

class GameManager {
  isWin = $state(false);
  isWinChecked = $state(false)

  settings: Settings
  round: Sudoku

  constructor(settings: Settings) {
    this.settings = settings
    this.round = new Sudoku(this.settings, initialBoard)
  }

  start = () => {
    this.round = new Sudoku(this.settings, initialBoard)
  }

  stop = () => {
    //this.game = undefined
  }

  restart = () => { }

  solve = () => {
    $inspect(this.round.userBoard)
    //console.log('solveD', this.round.initialBoardSolved)
    this.round.userBoard = this.round.initialBoardSolved
  }

  check = () => {
    console.log('check', this)
    this.isWinChecked = true;
    const isCorrect = this.round.toString() === this.round.initialBoardSolved.toString()
    if (isCorrect) {
      this.round.deselectCell();
    }
    this.isWin = isCorrect;
  };
}

class Sudoku {
  userRow = $state(-1);
  userCol = $state(-1);
  isAnyCellActive = $derived(!this.checkIsCellActive(-1, -1));

  validatedInput: NumberValidation[] = $state(VALIDATED_INPUT_TEMPLATE)
  validatedInputNumbers: string[] = $derived(this.validatedInput.filter((v) => !v.valid).map((v) => v.value))
  validatedInputNumbersSet = $derived(new Set(this.validatedInputNumbers))

  settings: Settings
  initialBoard: Board
  initialBoardSolved: Board
  userBoard: Board = $state(emptyBoard)

  constructor(settings: Settings, initialBoard: Board) {
    this.settings = settings
    this.initialBoard = initialBoard
    this.initialBoardSolved = solve(initialBoard)
    this.userBoard = initialBoard
  }

  selectCell(rowIndex: number, colIndex: number) {
    if (this.checkIsCellActive(rowIndex, colIndex)) {
      return this.deselectCell();
    }
    this.userRow = rowIndex;
    this.userCol = colIndex;

    // TODO: track start and end time of the game
    // disallow gameplay changing setting mid game
    this.validatedInput = this.settings.isValidateInput ? this.validateInput() : []
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

  //checkIsCell = (row, col, boardA, boardB) => boardA[row][col] === boardB[row][col];
  //checkIsCellUserInput = (row, col) => !this.checkIsCell(row, col, this.userBoard, initialBoard);
  //checkIsCellValid = (row, col) => this.checkIsCell(row, col, this.userBoard, this.boardSolved);

  validateInput(): NumberValidation[] {
    const isNumber = (n: string) => (!isNaN(parseFloat(n)) && !isNaN(-n))

    const validatedInput = deepClone(VALIDATED_INPUT_TEMPLATE)
    const row = this.userRow
    const col = this.userCol
    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;

    for (let i = 0; i < 9; i++) {
      if (isNumber(this.userBoard[row][i])) {
        const rowIndex = Number(this.userBoard[row][i]) - 1
        validatedInput[rowIndex].row = false
        validatedInput[rowIndex].valid = false
      }
      if (isNumber(this.userBoard[i][col])) {
        const colIndex = Number(this.userBoard[i][col]) - 1
        validatedInput[colIndex].col = false
        validatedInput[colIndex].valid = false
      }

      const curRow = blockRow + Math.floor(i / 3);
      const curCol = blockCol + Math.floor(i % 3);
      if (isNumber(this.userBoard[curRow][curCol])) {
        const squareIndex = Number(this.userBoard[curRow][curCol]) - 1
        validatedInput[squareIndex].square = false
        validatedInput[squareIndex].valid = false
      }
    }

    return validatedInput
  }
}

function solve(board: Board): Board {
  const solvedBoard = deepClone(board)
  solveSudokuMutatingDFS(solvedBoard)
  return solvedBoard
}

function solveSudokuMutatingDFS(board: Board): boolean {
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
          if (solveSudokuMutatingDFS(board)) {
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

// classic deep close coz some of my homies have old android potato phones
const deepClone = <T>(arr: readonly T[]): T[] => JSON.parse(JSON.stringify(arr))

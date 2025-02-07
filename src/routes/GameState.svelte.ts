import { getContext, setContext } from 'svelte';
import type { Settings } from './settings.svelte';

const X = '-';
const NUMBERS_INPUT = Array.from({ length: 9 }).map((_, i) => i + 1).map(v => String(v))
type CellValidation = {
  value: string,
  isUsed: boolean,
  isUsedInRow: boolean,
  isUsedInCol: boolean,
  isUsedInSquare: boolean
  isUsedEverywhere: boolean
}
const NUMBERS_VALIDATION_TEMPLATE: CellValidation[] = NUMBERS_INPUT.map(
  n => ({
    value: n,
    isUsed: false,
    isUsedInRow: false,
    isUsedInCol: false,
    isUsedInSquare: false,
    isUsedEverywhere: false
  })
)
export const INPUT: string[] = [...NUMBERS_INPUT, X]

// TODO: read & write state to url

export type Board = string[][];

const INITIAL_BOARD_STUB: Board = [
  ['2', '9', X, X, '7', X, X, X, X],
  ['6', X, X, '1', '9', '5', X, X, X],
  [X, '9', '8', X, X, X, X, '6', X],
  ['8', X, X, X, '6', X, X, X, '3'],
  ['4', X, X, '8', X, '3', X, X, '1'],
  ['7', X, X, X, '2', X, X, X, '6'],
  [X, '6', X, X, X, X, '2', '8', X],
  [X, X, X, '4', '1', '9', X, X, '5'],
  [X, X, X, X, '8', X, X, '7', '9'],
];


const BOARD_WITH_MULTIPLE_SOLUTIONS: Board = [
  [2, 9, 5, 7, 4, 3, 8, 6, 1],
  [4, 3, 1, 8, 6, 5, 9, X, X],
  [8, 7, 6, 1, 9, 2, 5, 4, 3],
  [3, 8, 7, 4, 5, 9, 2, 1, 6],
  [6, 1, 2, 3, 8, 7, 4, 9, 5],
  [5, 4, 9, 2, 1, 6, 7, 3, 8],
  [7, 6, 3, 5, 2, 4, 1, 8, 9],
  [9, 2, 8, 6, 7, 1, 3, 5, 4],
  [1, 5, 4, 9, 3, 8, 6, X, X],
].map(row => row.map(cell => String(cell)))

const devBoardStub = BOARD_WITH_MULTIPLE_SOLUTIONS

const emptyBoardRow = Array.from({ length: 9 }).map(() => X);
const emptyBoard = Array.from({ length: 9 }).map(() => [...emptyBoardRow]);

const SUDOKU_KEY = Symbol('Sudoku')

export function setSudoku(settings: Settings): Sudoku {
  return setContext(SUDOKU_KEY, new Sudoku(settings))
}
export function getSudoku(): Sudoku {
  return getContext<Sudoku>(SUDOKU_KEY)
}

class Sudoku {
  userRow = $state(-1);
  userCol = $state(-1);

  isAnyCellActive = $derived.by(() => !this.checkIsCellActive(-1, -1));

  cellValidation: CellValidation[] = $state(NUMBERS_VALIDATION_TEMPLATE)
  cellValidationNumbersSet: Set<string> = $derived.by(
    () => {
      const numbers = this.cellValidation.filter((v) => v.isUsed).map((v) => v.value)
      return new Set(numbers)
    }
  )

  isWin = $state(false);
  isWinChecked = $state(false)
  // isUsedSolver = $state(false)

  settings: Settings
  initialBoard?: Board
  initialBoardSolved?: Board
  userBoard: Board = $state(emptyBoard)

  startTime: number
  endTime: number = 0

  constructor(settings: Settings, initialBoard?: Board) {
    this.settings = settings
    this.startTime = Date.now()

    if (initialBoard) {
      this.initialBoard = initialBoard
      this.initialBoardSolved = solve(initialBoard)
      this.userBoard = initialBoard
    } else {
      // TODO: enable proper board initialization without initial board
      this.initialBoard = devBoardStub
      this.initialBoardSolved = solve(devBoardStub)
      this.userBoard = devBoardStub
    }
  }

  // these methods feel like the belong on a game manager
  // start = (): void => { }
  stop = (): void => {
    this.endTime = Date.now()
  }
  restart = (): void => {
    // should this even exist? shouln't creating a new game be easier way to reset?
    if (this.initialBoard) {
      this.userBoard = this.initialBoard
    }
    this.isWin = false
    this.isWinChecked = false
  }

  //isUseHistory?: boolean -- todo add replayable history for solutions
  solve = (): void => {
    if (this.initialBoardSolved) {
      this.userBoard = this.initialBoardSolved
      this.deselectCell();
    }
  }

  validateBoard = () => {
    this.isWinChecked = true;

    const isCorrect = this.userBoard.every(
      (rowArray, rowIndex): boolean => {
        return rowArray.every((_, cellIndex): boolean => {
          return this.validateCellValues(rowIndex, cellIndex)
            .every(validation => validation.isUsedEverywhere)
        })
      })

    if (isCorrect) {
      this.deselectCell();
    }
    this.isWin = isCorrect;
  }

  selectCell(rowIndex: number, colIndex: number) {
    if (this.checkIsCellActive(rowIndex, colIndex)) {
      return this.deselectCell();
    }
    this.userRow = rowIndex;
    this.userCol = colIndex;

    // TODO: track start and end time of the game
    // disallow gameplay changing setting mid game
    this.settings.isValidateInput ?
      this.validateCellValues(this.userRow, this.userCol) : []
  }

  deselectCell() {
    this.userRow = -1;
    this.userCol = -1;
  };

  setCellValue = (key: string): void => {
    if (!this.isAnyCellActive) {
      return
    }

    // prevent invalid keyboard input
    if (key !== X && this.settings.isValidateInput) {
      if (!checkIsValueValid(this.userRow, this.userCol, this.userBoard, key)) {
        return
      }
    }

    this.userBoard[this.userRow][this.userCol] = key;
    this.deselectCell();
  };

  resetCellValue = () => {
    this.setCellValue(X)
  }

  checkIsCellActive = (r: number, c: number): boolean => {
    return this.userRow === r && this.userCol === c;
  }

  checkIsCell = (r: number, c: number, boardA: Board, boardB?: Board) => {
    return boardB != null ? boardA[r][c] === boardB[r][c] : false
  }

  checkIsCellUserInput = (r: number, c: number) => {
    return !this.checkIsCell(r, c, this.userBoard, this.initialBoard);
  }

  checkIsCellInactive = (r: number, c: number, cellValue: string): boolean => {
    return cellValue !== X && !this.checkIsCellUserInput(r, c)
  }

  // FIXME: currently bound to the way DFS solves the board
  checkIsCellValid = (r: number, c: number) => {
    return this.checkIsCell(r, c, this.userBoard, this.initialBoardSolved);
  }

  validateCellValues = (row: number, col: number): CellValidation[] => {
    const numbersValidation = deepClone(NUMBERS_VALIDATION_TEMPLATE)

    const blockRow = Math.floor(row / 3) * 3;
    const blockCol = Math.floor(col / 3) * 3;
    const board = this.userBoard

    for (let i = 0; i < 9; i++) {
      if (isNumber(board[row][i])) {
        const rowIndex = Number(board[row][i]) - 1
        numbersValidation[rowIndex].isUsedInRow = true
        numbersValidation[rowIndex].isUsed = true
      }
      if (isNumber(board[i][col])) {
        const colIndex = Number(board[i][col]) - 1
        numbersValidation[colIndex].isUsedInCol = true
        numbersValidation[colIndex].isUsed = true
      }

      const curRow = blockRow + Math.floor(i / 3);
      const curCol = blockCol + Math.floor(i % 3);
      if (isNumber(board[curRow][curCol])) {
        const squareIndex = Number(board[curRow][curCol]) - 1
        numbersValidation[squareIndex].isUsedInSquare = true
        numbersValidation[squareIndex].isUsed = true
      }
    }

    for (let i = 0; i < 9; i++) {
      const c = numbersValidation[i]
      c.isUsedEverywhere = c.isUsedInRow && c.isUsedInCol && c.isUsedInSquare
    }

    return numbersValidation
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
        if (checkIsValueValid(row, col, board, c)) {
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

function checkIsValueValid(row: number, col: number, board: Board, value: string): boolean {
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
const isNumber = (n: string) => (!isNaN(parseFloat(n)) && !isNaN(-n))


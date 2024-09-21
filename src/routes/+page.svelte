<script>
  import { getContext } from 'svelte';
  import { Confetti } from 'svelte-confetti';

  const settingInputValidation = getContext('settingInputValidation');

  const X = '-';
  const numberKeys = Array.from({ length: 9 }).map((_, i) => i + 1);

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
  //const initialBoardURL = initialBoard.map((row) => row.join('')).join(',');

  const solveInit = (board) => {
    const cloneArray = (items) =>
      items.map((item) => (Array.isArray(item) ? cloneArray(item) : item));

    const clone = cloneArray(board);
    dfs(clone);
    return clone;
  };

  const emptyBoardRow = Array.from({ length: 9 }).map(() => X);
  const emptyBoard = Array.from({ length: 9 }).map(() => [...emptyBoardRow]);

  let userBoard = $state(emptyBoard);
  let userBoardSolved = emptyBoard;

  //let boardURL = $derived(board.map((row) => row.join('')).join(','));
  let userRow = $state(-1);
  let userCol = $state(-1);

  let isBoardInitiated = $state(false);
  $effect(() => {
    if (isBoardInitiated) {
      return;
    }
    userBoard = initialBoard;
    userBoardSolved = solveInit(initialBoard);
    isBoardInitiated = true;
  });

  let isBoardWinChecked = $state(false);
  let isUserWin = $state(false);

  const checkIsCell = (row, col, boardA, boardB) => boardA[row][col] === boardB[row][col];
  const checkIsCellUserInput = (row, col) => !checkIsCell(row, col, userBoard, initialBoard);
  const checkIsCellValid = (row, col) => checkIsCell(row, col, userBoard, userBoardSolved);

  const checkBoard = () => {
    isBoardWinChecked = true;
    const isCorrect = userBoard.toString() === userBoardSolved.toString();
    if (isCorrect) {
      resetUserSelectedCell();
    }
    isUserWin = isCorrect;
  };

  const compareCell = (row, col) => userRow === row && userCol === col;
  let isAnyCellActive = $derived(!compareCell(-1, -1));

  const getArrNumbers = (arr = []) => arr.filter((n) => n !== X).map((n) => Number(n));
  const check = (arr, n) => !arr.includes(n);

  const getColNumbers = (col, board) => getArrNumbers(board.map((row) => row[col]));
  const checkCol = (col, num, board) => check(getColNumbers(col, board), num);

  const getRowNumbers = (row, board) => getArrNumbers(board[row]);
  const checkRow = (row, key, board) => check(getRowNumbers(row, board), key);

  const get3x3Numbers = (row, col, board) => {
    let square = [];

    if (row < 3) {
      square = board.slice(0, 3);
    } else if (row < 6) {
      square = board.slice(3, 6);
    } else {
      square = board.slice(6);
    }

    if (col < 3) {
      square = square.map((row) => row.slice(0, 3));
    } else if (col < 6) {
      square = square.map((row) => row.slice(3, 6));
    } else {
      square = square.map((row) => row.slice(6));
    }
    return getArrNumbers(square.flatMap((row) => row));
  };
  const check3x3 = (row, col, key, board) => check(get3x3Numbers(row, col, board), key);

  const checkAll = (gameRow, gameCol, key, gameBoard) => {
    const row = gameRow ?? userRow;
    const col = gameCol ?? userCol;
    const board = gameBoard ?? userBoard;
    const num = Number(key);
    const isValidRow = checkRow(row, num, board);
    const isValidCol = checkCol(col, num, board);
    const isValid3x3 = check3x3(row, col, num, board);
    return isValidRow && isValidCol && isValid3x3;
  };

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

  const EMPTY_SET = new Set();
  const findAlreadyUsedNumbers = () => {
    if (!isAnyCellActive) {
      return EMPTY_SET;
    }

    const row = getRowNumbers(userRow, userBoard);
    const col = getColNumbers(userCol, userBoard);
    const square = get3x3Numbers(userRow, userCol, userBoard);
    return new Set([...row, ...col, ...square].sort());
  };
  let invalidNumberKeys = $derived($settingInputValidation ? findAlreadyUsedNumbers() : EMPTY_SET);

  const resetUserSelectedCell = () => {
    userRow = -1;
    userCol = -1;
  };
  const handleUserInput = (key) => {
    userBoard[userRow][userCol] = String(key);
    resetUserSelectedCell();
  };

  const handleNumberInput = (key) => {
    if ($settingInputValidation) {
      //const mine = checkAll(key);
      const stolen = isValid(userBoard, userRow, userCol, key);
      if (stolen) {
        handleUserInput(key);
      }
      return;
    }

    handleUserInput(key);
  };
</script>

<svelte:window
  onkeydown={(e) => {
    if (isAnyCellActive) {
      switch (e.key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          handleNumberInput(e.key);
          break;
        case '-':
        case 'Backspace':
          if (checkIsCellUserInput(userRow, userCol)) {
            handleUserInput(X);
          }
          break;
        default:
          break;
      }
    }
  }} />

<div class="game-wrapper container w-fit mx-auto">
  <div class="game-win-wrapper">
    {#if isUserWin}
      <Confetti
        x={[-5, 5]}
        y={[0, 0.1]}
        delay={[0, 5000]}
        duration={5000}
        amount={666}
        iterationCount={3}
        fallDistance="100vh" />
    {/if}
  </div>

  <div class="game-board">
    {#each userBoard as rows, rowIndex}
      <div class="game-row">
        {#each rows as cell, colIndex}
          <span class="game-cell-span">
            <button
              class="game-cell"
              class:btn-info={compareCell(rowIndex, colIndex)}
              class:btn-success={isBoardWinChecked && checkIsCellValid(rowIndex, colIndex)}
              class:btn-error={isBoardWinChecked && !checkIsCellValid(rowIndex, colIndex)}
              class:btn-warning={!isBoardWinChecked && checkIsCellUserInput(rowIndex, colIndex)}
              disabled={cell !== X && !checkIsCellUserInput(rowIndex, colIndex)}
              onclick={() => {
                const currentCellIsActive = compareCell(rowIndex, colIndex);
                if (!currentCellIsActive) {
                  userRow = rowIndex;
                  userCol = colIndex;
                } else {
                  resetUserSelectedCell();
                }
              }}>{cell}</button>
          </span>
        {/each}
      </div>
    {/each}
  </div>

  <div class="game-input mt-12" class:hidden={!isAnyCellActive}>
    <div class="game-input-numbers">
      {#each numberKeys as key}
        <button
          class="game-key"
          disabled={invalidNumberKeys.has(key)}
          onclick={() => handleNumberInput(key)}>
          {key}
        </button>
      {/each}
    </div>

    <div class="game-input-utils mt-2 justify-between">
      <button
        class="btn btn-outline btn-secondary"
        style="width: 81.25px;"
        onclick={() => {
          userBoard = solveInit(initialBoard);
        }}>Solve</button>
      <!-- on pc width of a button is 39x39 + margin is 3.25, so 2 are 81.25 -->
      <button class="btn btn-outline btn-primary" style="width: 81.25px;" onclick={checkBoard}
        >Check</button>
      <button class="game-key" onclick={() => handleUserInput(X)}>{X}</button>
    </div>
  </div>
</div>

<style>
  .game-cell,
  .game-key {
    @apply text-lg btn btn-square btn-primary btn-outline;
  }

  .game-row {
    @apply mb-1;
    &:nth-child(3),
    &:nth-child(6) {
      @apply mb-0 border-b-2 border-dashed border-sky-500;
    }
  }
  .game-cell-span {
    @apply mr-1;
    &:nth-child(3),
    &:nth-child(6) {
      @apply mr-0 border-r-2 border-solid border-sky-500;
    }
  }

  .game-input-numbers,
  .game-input-utils {
    @apply flex space-x-1;
  }

  .game-win-wrapper {
    position: fixed;
    top: -50px;
    left: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;
  }
</style>

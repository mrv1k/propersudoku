<script>
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
    [X, X, X, X, '8', X, X, '7', '9']
  ];

  //const initialBoardURL = initialBoard.map((row) => row.join('')).join(',');

  const emptyBoardRow = Array.from({ length: 9 }).map(() => X);
  const emptyBoard = Array.from({ length: 9 }).map(() => [...emptyBoardRow]);
  let board = $state(emptyBoard);
  //let boardURL = $derived(board.map((row) => row.join('')).join(','));

  let isBoardInitiated = $state(false);
  $effect(() => {
    if (isBoardInitiated) {
      return;
    }
    board = initialBoard;
    isBoardInitiated = true;
  });

  let userRow = $state(-1);
  let userCol = $state(-1);

  const compareCell = (row, col) => userRow === row && userCol === col;
  let isAnyCellActive = $derived(!compareCell(-1, -1));

  let checkIsCellUserInput = (row, col) => initialBoard[row][col] !== board[row][col];

  const getArrNumbers = (arr = []) => arr.filter((n) => n !== X).map((n) => Number(n));
  const check = (arr, n) => !arr.includes(n);

  const getColNumbers = (col) => getArrNumbers(board.map((row) => row[col]));
  const checkCol = (col, num) => check(getColNumbers(col), num);

  const getRowNumbers = (row) => getArrNumbers(board[row]);
  const checkRow = (row, key) => check(getRowNumbers(row), key);

  const get3x3Numbers = (row, col) => {
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
  const check3x3 = (row, col, key) => check(get3x3Numbers(row, col), key);

  const checkAll = (gameRow, gameCol, key) => {
    const row = gameRow ?? userRow;
    const col = gameCol ?? userCol;
    const num = Number(key);
    const isValidRow = checkRow(row, num);
    const isValidCol = checkCol(col, num);
    const isValid3x3 = check3x3(row, col, num);
    return isValidRow && isValidCol && isValid3x3;
  };

  const solve = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === X) {
          for (let n = 1; n < 10; n++) {
            console.count('k');
            if (checkAll(row, col, n)) {
              board[row][col] = String(n);
              solve();
              board[row][col] = X;
            }
          }
          console.log(board);
          return;
        }
      }
    }
    console.log('derp');
  };

  const setStub = new Set();
  const findAlreadyUsedNumbers = () => {
    if (!isAnyCellActive) {
      return setStub;
    }

    const row = getRowNumbers(userRow);
    const col = getColNumbers(userCol);
    const square = get3x3Numbers(userRow, userCol);
    return new Set([...row, ...col, ...square].sort());
  };
  let invalidNumberKeys = $derived(findAlreadyUsedNumbers());

  const handleInput = (key) => {
    board[userRow][userCol] = String(key);
    userRow = -1;
    userCol = -1;
  };

  const handleNumberInput = (key) => {
    if (checkAll(key)) {
      handleInput(key);
    }
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
        case 'Backspace':
          if (checkIsCellUserInput(userRow, userCol)) {
            handleInput(X);
          }
          break;
        default:
          break;
      }
    }
  }}
/>

<div class="game-wrapper container w-fit mx-auto">
  <div class="game-board">
    {#each board as rows, rowIndex}
      <div class="game-row">
        {#each rows as cell, colIndex}
          <span class="game-cell-span">
            <button
              class="game-cell"
              class:btn-info={compareCell(rowIndex, colIndex)}
              class:btn-warning={checkIsCellUserInput(rowIndex, colIndex)}
              disabled={cell !== X && !checkIsCellUserInput(rowIndex, colIndex)}
              onclick={() => {
                const currentCellIsActive = compareCell(rowIndex, colIndex);
                if (!currentCellIsActive) {
                  userRow = rowIndex;
                  userCol = colIndex;
                } else {
                  userRow = -1;
                  userCol = -1;
                }
              }}>{cell}</button
            >
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
          onclick={() => handleNumberInput(key)}
        >
          {key}
        </button>
      {/each}
    </div>

    <div class="game-input-utils mt-2 justify-end">
      <button class="btn btn-outline btn-secondary" style="width: 81.25px;" onclick={solve}
        >Solve</button
      >
      <!-- on pc width of a button is 39x39 + margin is 3.25, so 2 are 81.25 -->
      <button class="btn btn-outline btn-primary" style="width: 81.25px;">Check</button>
      <button class="game-key" onclick={() => handleInput(X)}>{X}</button>
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
</style>

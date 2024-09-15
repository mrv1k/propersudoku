<script>
  const X = '-';

  const numberKeys = Array.from({ length: 9 }).map((_, i) => i + 1);
  //const emptyBoardRow = Array.from({ length: 9 }).map(() => X);
  //const emptyBoard = Array.from({ length: 9 }).map(() => [...emptyBoardRow]);

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

  let board = $state(initialBoard);
  //let boardURL = $derived(board.map((row) => row.join('')).join(','));

  //let isBoardInitiated = $state(false);
  //$effect(() => {
  //  if (isBoardInitiated) {
  //    return;
  //  }
  //});

  let activeRow = $state(-1);
  let activeCol = $state(-1);

  const compareCell = (row, col) => activeRow === row && activeCol === col;
  let isAnyCellActive = $derived(!compareCell(-1, -1));

  let checkIsCellUserInput = (row, col) => initialBoard[row][col] !== board[row][col];

  const getNumbers = (arr = []) => arr.filter((n) => n !== X).map((n) => Number(n));
  const getRowNumbers = () => getNumbers(board[activeRow]);
  const getColNumbers = () => getNumbers(board.map((row) => row[activeCol]));

  const check = (arr, n) => !arr.includes(n);
  const checkRow = (key) => check(getRowNumbers(), key);
  const checkCol = (key) => check(getColNumbers(), key);

  const get3x3Numbers = () => {
    let square = [];

    if (activeRow < 3) {
      square = board.slice(0, 3);
    } else if (activeRow < 6) {
      square = board.slice(3, 6);
    } else {
      square = board.slice(6);
    }

    if (activeCol < 3) {
      square = square.map((row) => row.slice(0, 3));
    } else if (activeCol < 6) {
      square = square.map((row) => row.slice(3, 6));
    } else {
      square = square.map((row) => row.slice(6));
    }
    return getNumbers(square.flatMap((row) => row));
  };

  const check3x3 = (key) => {
    const square = get3x3Numbers();
    return check(square, key);
  };

  const setStub = new Set();
  const findAlreadyUsedNumbers = () => {
    if (!isAnyCellActive) {
      return setStub;
    }

    const row = getRowNumbers();
    const col = getColNumbers();
    const square = get3x3Numbers();
    return new Set([...row, ...col, ...square].sort());
  };
  let invalidNumberKeys = $derived(findAlreadyUsedNumbers());

  const handleInput = (key) => {
    board[activeRow][activeCol] = String(key);
    activeRow = -1;
    activeCol = -1;
  };

  const handleNumberInput = (key) => {
    const num = Number(key);
    const isValidRow = checkRow(num);
    const isValidCol = checkCol(num);
    const isValid3x3 = check3x3(num);
    if (isValidRow && isValidCol && isValid3x3) {
      handleInput(num);
      return;
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
          if (checkIsCellUserInput(activeRow, activeCol)) {
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
                  activeRow = rowIndex;
                  activeCol = colIndex;
                } else {
                  activeRow = -1;
                  activeCol = -1;
                }
              }}>{cell}</button
            >
          </span>
        {/each}
      </div>
    {/each}
  </div>

  <div class="game-input mt-12" class:hidden={!isAnyCellActive && false}>
    <div class="game-input-numbers space-x-1">
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

    <div class="game-input-utils mt-4 text-right">
      <button class="btn btn-outline btn-primary">Check</button>
      <button class="game-key" onclick={() => handleInput(X)}>
        {X}
      </button>
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
</style>

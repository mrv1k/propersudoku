<script>
  const X = '-';
  const keys = Array.from({ length: 9 }).map((_, i) => i + 1);

  let board = $state([
    ['5', '3', X, X, '7', X, X, X, X],
    ['6', X, X, '1', '9', '5', X, X, X],
    [X, '9', '8', X, X, X, X, '6', X],
    ['8', X, X, X, '6', X, X, X, '3'],
    ['4', X, X, '8', X, '3', X, X, '1'],
    ['7', X, X, X, '2', X, X, X, '6'],
    [X, '6', X, X, X, X, '2', '8', X],
    [X, X, X, '4', '1', '9', X, X, '5'],
    [X, X, X, X, '8', X, X, '7', '9']
  ]);
  let activeRow = $state(-1);
  let activeCol = $state(-1);

  const compareCell = (row, col) => activeRow === row && activeCol === col;
  let isAnyCellActive = $derived(!compareCell(-1, -1));

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
  let invalidKeys = $derived(findAlreadyUsedNumbers());
</script>

<div id="wrapper">
  <h1>Welcome to Sudoku</h1>

  <div class="game-wrapper">
    {#each board as rows, rowIndex}
      <div class="game-row">
        {#each rows as cell, colIndex}
          <span class="game-cell">
            <button
              class="square-2rem"
              class:selectable={cell === X}
              class:selected={compareCell(rowIndex, colIndex)}
              onclick={() => {
                if (cell !== X) {
                  return;
                }

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
  <br />
  <br />

  <div id="keys" style="text-align: center;" class:visually-hidden={!isAnyCellActive}>
    {#each keys as key}
      <button
        class="square-2rem"
        disabled={invalidKeys.has(key)}
        onclick={() => {
          const isValidRow = checkRow(key);
          const isValidCol = checkCol(key);
          const isValid3x3 = check3x3(key);
          if (isValidRow && isValidCol && isValid3x3) {
            board[activeRow][activeCol] = String(key);
            activeRow = -1;
            activeCol = -1;
            return;
          }
        }}
      >
        {key}
      </button>
    {/each}
  </div>
</div>

<style>
  :root {
    --font-body: Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
      Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    /*--font-mono: 'Fira Mono', monospace;*/
    --font-mono: monospace;
    --color-bg-0: rgb(202, 216, 228);
    --color-bg-1: hsl(209, 36%, 86%);
    --color-bg-2: hsl(224, 44%, 95%);
    --color-theme-1: #ff3e00;
    --color-theme-2: #4075a6;
    --color-text: rgba(0, 0, 0, 0.7);
    --column-width: 42rem;
    --column-margin-top: 4rem;
    /*font-family: var(--font-body);*/
    font-family: var(--font-mono);
    color: var(--color-text);
  }

  .game-wrapper {
    width: fit-content;
    margin: 0 auto;
  }

  .game-row:nth-child(3n) {
    border-bottom: 2px dashed black;
  }
  .game-row:last-child {
    border-bottom: none;
  }

  .game-cell:nth-child(3n) {
    border-right: 2px dashed black;
  }

  .game-cell:last-child {
    border-right: none;
  }

  .square-2rem {
    height: 2rem;
    width: 2rem;
    margin: 1px;
    &.selectable {
      cursor: pointer;
    }
    &.selected {
      border-radius: 3px;
      background-color: lightgreen;
      border: 1px solid green;
    }
    &:disabled {
      cursor: not-allowed;
    }
  }

  body {
    min-height: 100vh;
    margin: 0;
    background-attachment: fixed;
    background-color: var(--color-bg-1);
    background-size: 100vw 100vh;
    background-image: radial-gradient(
        50% 50% at 50% 50%,
        rgba(255, 255, 255, 0.75) 0%,
        rgba(255, 255, 255, 0) 100%
      ),
      linear-gradient(180deg, var(--color-bg-0) 0%, var(--color-bg-1) 15%, var(--color-bg-2) 50%);
  }

  h1,
  h2,
  p {
    font-weight: 400;
  }

  p {
    line-height: 1.5;
  }

  a {
    color: var(--color-theme-1);
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  h1 {
    font-size: 2rem;
    text-align: center;
  }

  h2 {
    font-size: 1rem;
  }

  pre {
    font-size: 16px;
    font-family: var(--font-mono);
    background-color: rgba(255, 255, 255, 0.45);
    border-radius: 3px;
    box-shadow: 2px 2px 6px rgb(255 255 255 / 25%);
    padding: 0.5em;
    overflow-x: auto;
    color: var(--color-text);
  }

  .text-column {
    display: flex;
    max-width: 48rem;
    flex: 0.6;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
  }

  input,
  button {
    font-size: inherit;
    font-family: inherit;
  }

  button:focus:not(:focus-visible) {
    outline: none;
  }

  @media (min-width: 720px) {
    h1 {
      font-size: 2.4rem;
    }
  }

  .visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: auto;
    margin: 0;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
  }
</style>

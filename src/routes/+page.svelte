<script>
  let board = [
    ['5', '3', '.', '.', '7', '.', '.', '.', '.'],
    ['6', '.', '.', '1', '9', '5', '.', '.', '.'],
    ['.', '9', '8', '.', '.', '.', '.', '6', '.'],
    ['8', '.', '.', '.', '6', '.', '.', '.', '3'],
    ['4', '.', '.', '8', '.', '3', '.', '.', '1'],
    ['7', '.', '.', '.', '2', '.', '.', '.', '6'],
    ['.', '6', '.', '.', '.', '.', '2', '8', '.'],
    ['.', '.', '.', '4', '1', '9', '.', '.', '5'],
    ['.', '.', '.', '.', '8', '.', '.', '7', '9']
  ];
  const keys = Array.from({ length: 9 }).map((_, i) => i + 1);
</script>

<h1>Welcome to Sudoku (proper)</h1>

<div>
  <div>
    {#each board as rows, rowIndex}
      {#each rows as cell, cellIndex}
        <button
          onclick={() => {
            console.log({ rowIndex, cellIndex });
            if (cell !== '.') {
              return;
            }
            console.log(cell);

            // display number menu
          }}>{cell}</button
        >
      {/each}
      <br />
    {/each}
  </div>
  <br />
  <br />
  <div id="keys">
    {#each keys as key}
      <button onclick={() => console.log(key)}>
        {key}
      </button>
    {/each}
  </div>
</div>

<style>
</style>

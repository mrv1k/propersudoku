<script lang="ts">
  import { settings } from './settings.svelte';
  //import { Confetti } from 'svelte-confetti';
  import { INPUT, GameState } from './GameState.svelte';

  const game = new GameState(settings);

  const handleKeyboardInput = (e: KeyboardEvent) => {
    if (!game.isAnyCellActive) {
      return;
    }
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
        game.setCellValue(e.key);
        break;
      case '-':
      case '0':
      case 'Backspace':
      case 'Delete':
        game.resetCellValue();
        break;
      default:
        break;
    }
  };
</script>

<svelte:window onkeydown={handleKeyboardInput} />

<div class="game-wrapper container w-fit mx-auto">
  <!--   <div class="game-win-wrapper"> -->
  <!--     {#if isUserWin} -->
  <!--       <Confetti -->
  <!--         x={[-5, 5]} -->
  <!--         y={[0, 0.1]} -->
  <!--         delay={[0, 5000]} -->
  <!--         duration={5000} -->
  <!--         amount={666} -->
  <!--         iterationCount={3} -->
  <!--         fallDistance="100vh" /> -->
  <!--     {/if} -->
  <!--   </div> -->

  <div class="game-board">
    {#each game.userBoard as rows, rowIndex}
      <div class="game-row">
        {#each rows as cell, colIndex}
          <span class="game-cell-span">
            <!-- class:btn-success={isBoardWinChecked && checkIsCellValid(rowIndex, colIndex)} -->
            <!-- class:btn-error={isBoardWinChecked && !checkIsCellValid(rowIndex, colIndex)} -->
            <!-- class:btn-warning={!isBoardWinChecked && checkIsCellUserInput(rowIndex, colIndex)} -->
            <!-- disabled={cell !== X && !checkIsCellUserInput(rowIndex, colIndex)} -->
            <button
              class="game-cell"
              class:btn-info={game.checkIsCellActive(rowIndex, colIndex)}
              onclick={() => {
                game.selectCell(rowIndex, colIndex);
              }}>{cell}</button>
          </span>
        {/each}
      </div>
    {/each}
  </div>

  <div class="game-input mt-12" class:hidden={!game.isAnyCellActive}>
    <div class="game-input-numbers">
      {#each INPUT as key}
        <button
          class="game-key"
          disabled={game.validatedInputNumbersSet.has(key)}
          onclick={() => game.setCellValue(key)}>
          {key}
        </button>
      {/each}
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

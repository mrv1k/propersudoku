<script>
  import '../app.css';

  let isSettingsVisible = $state(false);
</script>

<div class="layout-wrapper">
  <div class="navbar bg-base-100">
    <div class="navbar-start">
      <button class="dropdown" onclick={() => (isSettingsVisible = !isSettingsVisible)}>
        <div tabindex="0" role="button" class="btn btn-ghost btn-circle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </div>
      </button>
    </div>
    <div class="navbar-center">
      <btn class="btn btn-ghost text-xl no-animation">sudoku</btn>
    </div>
  </div>

  {#if isSettingsVisible}
    <div class="collapse bg-base-200">
      <div class="collapse-title text-xl font-medium">Click me to show/hide content</div>
      <div class="collapse-content">
        <p>hello</p>
      </div>
    </div>
  {/if}
</div>

<slot />

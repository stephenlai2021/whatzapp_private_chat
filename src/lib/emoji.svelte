<script>
  import { fly } from "svelte/transition";
  import { createEventDispatcher } from 'svelte'

  export let showEmojiMenu

  const dispatch = createEventDispatcher() 

  let min;
  let max;
  let textBox;
  let isActive;
  let emojis = [];
  let message = "";
  let selectedSet = 0;
  let modalOpen = true;
  let setIcons = [128512, 129313, 128074, 129417, 128664, 129504];
  let emojiSets = [
    { type: "faces", minVal: 128512, maxVal: 128580 },
    { type: "faces2", minVal: 129296, maxVal: 129327 },
    { type: "body", minVal: 128066, maxVal: 128080 },
    { type: "animals", minVal: 129408, maxVal: 129442 },
    { type: "transport", minVal: 128640, maxVal: 128676 },
    { type: "misc", minVal: 129494, maxVal: 129535 },
  ];

  isActive = setIcons[0];

  const clearEmojiMenu = () => (emojis = []);

  const chooseEmojiSet = (e) => {
    selectedSet = Number(e.target.dataset.id);
    console.log("emoji id: ", selectedSet);
    isActive = setIcons[selectedSet];

    clearEmojiMenu();
  };

  const addEmoji = (e) => {
    message += e.target.textContent;
    dispatch('add-emoji', { emoji: e.target.textContent })
  };

  $: min = emojiSets[selectedSet].minVal;
  $: max = emojiSets[selectedSet].maxVal;

  $: for (let i = min; i <= max; i++) {
    emojis = [...emojis, String.fromCodePoint(i)];
  }
</script>

{#if showEmojiMenu}
  <div id="emoji-menu" transition:fly={{ y: 10 }}>
    <header style="padding: 0 5px; background: #f0f0f0; border-top-right-radius: 10px;">
      {#each setIcons as icon, i}
        <div
          class="emoji-menu-item"
          class:active={isActive === setIcons[i]}
          data-id={i}
          on:click={chooseEmojiSet}
        >
          {String.fromCodePoint(icon)}
        </div>
      {/each}
      <div class="icon-close" style="display: grid; justify-item: center; font-size: 1.2rem;">
        <ion-icon name="close-outline" on:click={() => dispatch('close-menu')}></ion-icon>
      </div>
    </header>

    <main>
      {#each emojis as emoji}
        <span class="emoji-grid" on:click={addEmoji}>{emoji}</span>
      {/each}
    </main>
  </div>
{/if}

<style>
  main {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 275px;
    height: 220px;
    overflow-y: scroll;
  }

  .active {
    background: #aaa;
    padding: 3px;
    border-radius: 5px;
  }

  .emoji-grid {
    width: 44px;
    height: 44px;
    display: grid;
    justify-content: center;
  }

  #emoji-menu {
    position: absolute;
    bottom: 60px;
    left: 30%;
    width: 236px;
    height: 248px;
    display: flex;
    flex-wrap: wrap;
    /* overflow-y: scroll; */
    /* border: 1px solid; */
  }

   @media (max-width: 575px) {
     #emoji-menu {
       left: 22%;
     }
   }

  #emoji-menu header {
    width: 270px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* border: 1px solid; */
  }

  #emoji-menu header div {
    cursor: pointer;
  }

  span {
    font-size: 1.5rem;
    padding: 0.3rem;
    background: #eee;
    cursor: pointer;
  }

  span:active {
    background: #fff;
  }
</style>

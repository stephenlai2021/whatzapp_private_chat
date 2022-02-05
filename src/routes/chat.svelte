<script>
  import { auth } from "$lib/functions/firebase";
  import { onAuthStateChanged } from "firebase/auth";
  import LeftSide from "$lib/leftside.svelte";
  import RightSide from "$lib/rightside.svelte";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let showPage = false;

  onMount(() => {
    /* implement route guard when component is mounted is not the right approach with Sveltekit,
      insteead we should check auth state on server side */
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        goto("/");
      } else {
        showPage = true;
      }
      return unsub;
    });
  });
</script>

{#if showPage}
  <div class="container">
    <LeftSide />
    <!-- <RightSide on:showUserList={} /> -->
    <RightSide />
  </div>
{:else}
  <img width="200" src="loading.gif" alt="spinner gif" />
{/if}

<style>
  .container {
    position: relative;
    max-width: 1396px;
    margin: auto;
    height: calc(100vh - 40px);
    background: #fff;
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.06), 0 2px 5px 0 rgba(0, 0, 0, 0.06);
    display: flex;
  }
  @media (max-width: 800px) {
    .container {
      /* height: 100vh; */
    }
  }
</style>

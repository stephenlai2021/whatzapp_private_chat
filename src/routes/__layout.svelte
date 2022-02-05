<!-- <script context="module">
  import { onAuthStateChanged } from "@firebase/auth";
  import { auth } from "$lib/functions/firebase";
  import { goto } from "$app/navigation";
  import { browser } from "$app/env";

  browser &&
    onAuthStateChanged(auth, (user) => {
      if (user) {
        goto("/chat");
      } else {
        goto("/");
      }
    });
</script> -->

<script>
  import "../global.css";
</script>

<svelte:head>
  <script
    defer
    type="module"
    src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.esm.js"></script>
  <script
    defer
    nomodule=""
    src="https://unpkg.com/ionicons@5.5.2/dist/ionicons/ionicons.js"></script>
</svelte:head>

<main>
  <slot />
</main>

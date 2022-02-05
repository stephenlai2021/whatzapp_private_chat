<script context="module">
  import { onAuthStateChanged } from "@firebase/auth";
  import { auth } from "$lib/functions/firebase";
  import { goto } from "$app/navigation";
  import { browser } from "$app/env";
  
  if (browser) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        goto("/chat");
      } else {
        goto("/");
      }
    });
  }
</script>

<slot />
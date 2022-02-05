<script>
  import SignupForm from "$lib/signupform.svelte";
  import LoginForm from "$lib/loginform.svelte";
  import { goto } from "$app/navigation";
  import { onAuthStateChanged } from "firebase/auth";
  import { auth } from "$lib/functions/firebase";
  import { onMount } from "svelte";

  let showLogin = true;
  let showPage = false;

  onMount(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        goto("/chat");
        // goto("/test");
      } else {
        showPage = true;
      }
      return unsub;
    });
  });
</script>

{#if showPage}
  <div class="welcome container">
    <div>
      <div class="img-wrapper">
        <img class="logo" src="whatzapp.png" alt="whatzapp logo" />
      </div>
      {#if !showLogin}
        <h2>Sign up</h2>
        <SignupForm />
        <p>
          Already registered ? <span on:click={() => (showLogin = true)}
            >Login</span
          > instead
        </p>
      {:else}
        <h2>Login</h2>
        <LoginForm />
        <p>
          No account yet ? <span on:click={() => (showLogin = false)}
            >Signup</span
          > instead
        </p>
      {/if}
    </div>
  </div>
{:else}
  <img width="200" src="loading.gif" alt="spinner gif" />
{/if}

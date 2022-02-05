<script>
  import { auth, db } from "$lib/functions/firebase";
  import { signInWithEmailAndPassword } from "firebase/auth";
  import { updateDoc, doc } from 'firebase/firestore'
  // import { registeredUser } from './functions/store'

  let email = null,
    password = null,
    errorMessage = null;

  const handleSubmit = async () => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const tempUser = cred.user
      // registeredUser.set(tempUser)

      let ref = doc(db, "whatzapp_users", tempUser.uid);
      await updateDoc(ref, {
        isOnline: true,
      });
      email = "";
      password = "";
      errorMessage = null;
    } catch (err) {
      errorMessage = err.message;
    }
  };
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input type="email" required placeholder="email" bind:value={email} />
  <input
    type="password"
    required
    placeholder="password"
    bind:value={password}
  />
  <button>Log in</button>
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
</form>

<style>
  .error {
    color: red;
  }
</style>

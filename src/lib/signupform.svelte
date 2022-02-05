<script>
  import { auth, db } from "./functions/firebase";
  import { createUserWithEmailAndPassword } from "firebase/auth";
  import { doc, setDoc, addDoc, collection, Timestamp } from 'firebase/firestore'

  let name = "",
    email = null,
    password = null,
    errorMessage = null
    
  const handleSubmit = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)

      let ref = doc(db, 'whatzapp_users', res.user.displayName)
      await setDoc(ref, {
        uid: res.user.uid,
        name,
        email,
        createdAt: Timestamp.fromDate(new Date()),
        isOnline: true,
        avatar: null
      })
      name = ''
      email = ''
      password = ''
      errorMessage = null
    } catch (err) {
      errorMessage = err.message
    }
  };
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input
    type="text"
    required
    placeholder="display name"
    bind:value={name}
  />
  <input type="email" required placeholder="email" bind:value={email} />
  <input
    type="password"
    required
    placeholder="password"
    bind:value={password}
  />
  <button>Sign up</button>
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
</form>

<style>
  .error {
    color: red;
  }
</style>
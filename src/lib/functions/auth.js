import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { readable } from 'svelte/store'
import { browser } from '/env'

export const initAuth = () => {
  const user = readable(null, set => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) {
        set(user)
      } else {
        set(null)
      }
    })
    return unsub
  })
  return {
    user
  }
}


import { writable } from "svelte/store";
import { browser } from '$app/env'

const selectedUser = writable({})
const selectedUserMessages = writable([])
const combinedID = writable(null)

/* save user to localstorage */
const user = writable(browser && JSON.parse(localStorage.getItem("user")));
user.subscribe((val) => browser && localStorage.setItem("user", JSON.stringify(val)));

export { selectedUser, selectedUserMessages, combinedID }
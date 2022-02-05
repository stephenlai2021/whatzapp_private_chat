<script>
  import { fly, fade } from "svelte/transition";
  import { auth, db } from "$lib/functions/firebase";
  import {
    doc,
    onSnapshot,
    collection,
    query,
    where,
    orderBy,
  } from "firebase/firestore";
  import useStorage from "$lib/functions/useStorage";
  import {
    selectedUserMessages,
    combinedID,
    selectedUser,
  } from "$lib/functions/store";
  import { formatDistanceToNow } from "date-fns";

  let id = null;
  let file = null;
  let user = null;
  let users = null;
  let messages = [];
  let lastMsg = null;
  let ids_val = null;
  let leftSide = null
  let fileError = null;
  let hasAvatar = false;
  let activeItem = null;
  let showProfileModal = false;
  let loggedInUser = auth.currentUser.uid;

  const docRef = doc(db, "whatzapp_users", auth.currentUser.uid);
  const usersRef = collection(db, "whatzapp_users");
  const q = query(usersRef, where("uid", "not-in", [auth.currentUser.uid]));

  // allowed file types
  const types = ["image/png", "image/jpeg", "image/jpg"];

  combinedID.subscribe((val) => (ids_val = val));

  const handleChange = (e) => {
    let selected = e.target.files[0];
    console.log(selected);

    if (selected && types.includes(selected.type)) {
      file = selected;
      fileError = null;

      useStorage(file);
    } else {
      file = null;
      fileError = "Please select an image file (png or jpg)";
    }
  };

  const showProfile = () => {
    showProfileModal = true;
  };

  const selectUser = async (user) => {
    activeItem = user.uid;

    id =
      loggedInUser > activeItem
        ? `${loggedInUser + activeItem}`
        : `${activeItem + loggedInUser}`;

    const msgsRef = collection(db, "whatzapp_messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, (querySnapshot) => {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.unshift(doc.data());
      });
      messages = msgs;

      selectedUserMessages.set(messages);
      return () => unsub();
    });

    selectedUser.set(user);

    if (window.innerWidth <= 575) leftSide.style.width = '0px'
  };

  // get current user
  const unsubUser = onSnapshot(docRef, (doc) => {
    user = doc.data();

    if (user.avatar !== null) {
      hasAvatar = true;
    }

    return () => unsubUser();
  });

  // get last message
  $: if (!ids_val) {
    console.log("can't find id!");
  } else {
    const unsub = onSnapshot(doc(db, "whatzapp_lastMsg", ids_val), (doc) => {
      console.log("last message: ", doc.data());
      lastMsg = doc.data();

      return () => unsub();
    });
  }

  // get all users
  const unsubUsers = onSnapshot(q, (querySnapshot) => {
    let tempUsers = [];
    querySnapshot.forEach((doc) => {
      tempUsers.push(doc.data());
    });
    users = tempUsers;

    return () => unsubUsers();
  });
</script>

{#if !showProfileModal}
  <div class="leftSide" bind:this={leftSide}>
    <div class="header">
      <div class="userimg" style="cursor: pointer;">
        {#if !hasAvatar}
          <img src="avatar.png" class="cover" alt="default user avatar" />
        {:else}
          <img
            src={user.avatar}
            class="cover"
            alt="user avatar"
            style="cursor: pointer;"
          />
        {/if}
        <input
          type="file"
          on:change={handleChange}
          style="width: 0; height: 0; opacity: 0; cursor: pointer;"
        />
      </div>
      <ul class="nav_icons">
        <li on:click={showProfile}>
          <ion-icon name="person-outline" />
        </li>
      </ul>
      {#if user}
        <li class="user-name" on:click={showProfile}>
          {user.name.match(/(?:\s|^)(\S)/g).join("")}
        </li>
      {/if}
    </div>
    <div class="search_chat">
      <div>
        <input type="text" placeholder="Search User" />
        <ion-icon name="search-outline" />
      </div>
    </div>
    {#if users}
      <div class="chatlist">
        {#each users as user (user.uid)}
          <div
            class="block"
            class:active={activeItem === user.uid}
            on:click={selectUser(user)}
          >
            <div class="imgbx" style="position: relative;">
              <img src={user.avatar} class="cover" alt="user avatar" />
              {#if user.isOnline}
                <div class="user-status" style="background: lightgreen;" />
              {:else}
                <div class="user-status" style="background: lightgrey;" />
              {/if}
            </div>
            <div class="details">
              <div class="listHead">
                <h4>{user.name}</h4>
                {#if user.unread}
                  <p class="time unread">
                    {formatDistanceToNow(user.createdAt.toDate())}
                  </p>
                {:else}
                  <p class="time">
                    {formatDistanceToNow(user.createdAt.toDate())}
                  </p>
                {/if}
              </div>
              <div class="message_p">
                {#if lastMsg}
                  {#if user.uid === lastMsg.to}
                    {lastMsg.message}
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else}
  <div class="profile-modal" in:fade={{ x: -30 }}>
    <div class="close-icon" style="text-align: right; padding: 5px;">
      <ion-icon
        name="close-outline"
        on:click={() => (showProfileModal = false)}
        style="font-size: 1.5rem;"
      />
    </div>
    <!-- {#if hasAvatar} -->
    <div class="avatar-container">
      <div class="avatar-box">
        <img src={user.avatar} alt="user avatar" />
        <label>
          <ion-icon class="icon-camera" name="camera-outline" />
          <input type="file" on:change={handleChange} />
        </label>
      </div>
    </div>
    <!-- {/if} -->
    <p class="center">{user.name}</p>
  </div>
{/if}

<style>
  .center {
    text-align: center;
  }
  .icon-camera {
    font-size: 1.8rem;
    color: #666;
  }
  .avatar-box label input {
    width: 0;
    height: 0;
    opacity: 0;
    cursor: pointer;
  }
  .avatar-box label {
    position: absolute;
    bottom: 5px;
    right: 10px;
    width: 25px;
    height: 25px;
  }
  .avatar-box img {
    border-radius: 50%;
    width: 120px;
    height: 120px;
    object-fit: cover;
  }
  .avatar-box {
    position: relative;
    width: 120px;
  }
  .avatar-container {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
  }
  .user-name {
    display: none;
    font-size: 22px;
    font-weight: bold;
    color: #00BFA5;
  }
  .user-status {
    position: absolute;
    width: 12px;
    height: 13px;
    bottom: -1px;
    right: 7px;
    border-radius: 50%;
    border: 2px solid;
  }
  .userimg {
    cursor: pointer;
  }
  .profile-modal {
    height: calc(100% - 20px);
  }
  .profile-modal,
  .leftSide {
    position: relative;
    flex: 30% 5%;
    background: #fff;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
  }
  .header {
    position: relative;
    width: 100%;
    height: 60px;
    background: #ededed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
  }
  .userimg {
    position: relative;
    width: 40px;
    height: 40px;
    overflow: hidden;
    border-radius: 50%;
  }
  img {
    width: 100%;
  }
  .cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    object-fit: cover;
  }
  .nav_icons {
    display: flex;
  }
  li {
    display: flex;
    list-style: none;
    cursor: pointer;
    color: #51585c;
    font-size: 1.5em;
  }
  .search_chat {
    position: relative;
    width: 100%;
    height: 50px;
    background: #f6f6f6;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 15px;
  }
  .search_chat div {
    width: 100%;
  }
  .search_chat div input {
    width: 100%;
    outline: none;
    border: none;
    background: #fff;
    padding: 6px;
    height: 38px;
    border-radius: 30px;
    font-size: 14px;
    padding-left: 40px;
  }
  .search_chat div input::placeholder {
    color: #bbb;
  }
  .search_chat div ion-icon {
    position: absolute;
    left: 30px;
    top: 14px;
    font-size: 1.2em;
  }
  .chatlist {
    position: relative;
    height: calc(100% - 110px);
    overflow-y: auto;
  }
  .chatlist .block {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    cursor: pointer;
  }
  .chatlist .block.active {
    background: #ebebeb;
  }
  .chatlist .block:hover {
    background: #f5f5f5;
  }
  .chatlist .block .imgbx {
    position: relative;
    min-width: 45px;
    height: 45px;
    overflow: hidden;
    border-radius: 50%;
    margin-right: 10px;
  }
  .details {
    position: relative;
    width: 100%;
  }
  .listHead {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 5px;
  }
  .listHead h4,
  p {
    text-align: left;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chatlist .block .details .listHead h4 {
    font-size: 1.1em;
    font-weight: 600;
    color: #111;
  }
  /* .chatlist .block .details .listHead .time {
    font-size: 0.75em;
    color: #aaa;
  }
  .chatlist .block .details .listHead .time {
    color: #111;
  } */
  /* .chatlist .block.unread .details .listHead .time {
    color: #06d755;
  } */
  /* .chatlist .block .details .listHead .time.unread {
    color: #06d755;
  } */
  .time {
    font-size: 0.75em;
  }
  .unread {
    color: #06d755;
  }
  .message_p {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .message_p p {
    color: #aaa;
    font-size: 0.9em;
    text-align: left;
    /* white-space: nowrap; */
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .message_p b {
    background: #06d755;
    color: #fff;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    padding: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.75em;
  }
  @media (max-width: 575px) {
    .user-name {
      display: block;
    }
    .userimg,
    .search_chat,
    .nav_icons,
    .details {
      /* display: none; */
    }
    .leftSide {
      /* flex: min-content; */
      /* flex: 0%; */
      /* flex: 1; */
      /* width: 100vw; */
    }
    .header {
      /* display: flex;
      justify-content: center; */
    }
    .chatlist .block {
      /* padding: 10px; */
    }
    .chatlist .block .imgbx {
      /* margin-right: 0; */
    }
  }
</style>

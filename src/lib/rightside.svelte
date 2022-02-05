<script>
  import { auth, db, storage } from "$lib/functions/firebase";
  import {
    doc,
    addDoc,
    setDoc,
    Timestamp,
    updateDoc,
    collection,
  } from "firebase/firestore";
  import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
  import { signOut } from "firebase/auth";
  import {
    selectedUser,
    selectedUserMessages,
    combinedID,
  } from "$lib/functions/store";
  import { onMount } from "svelte";
  import { formatDistanceToNow } from "date-fns";
  import EmojiMenu from "$lib/emoji.svelte";
  import { createEventDispatcher } from 'svelte'

  // image input
  let file = null;
  let fileError = null;
  let image_url = null;

  // audio recording
  let chuck = null;
  let audio_url = null;
  let rightSide = null;
  let mediaStream = null;
  let mediaRecorder = null;

  let rwd = false;
  let message = "";
  let user_val = null;
  let isAudioOn = false;
  let micActive = false;
  let messages_val = null;
  let showEmojiMenu = false;
  let loggedInUser = auth.currentUser.uid;

  const dispatch = createEventDispatcher()

  selectedUser.subscribe((val) => {
    user_val = val;
  });

  selectedUserMessages.subscribe((val) => {
    messages_val = val;
  });

  const logout = async () => {
    let userRef = doc(db, "whatzapp_users", loggedInUser);
    try {
      await updateDoc(userRef, {
        isOnline: false,
      });
      await signOut(auth);
      console.log("user logged out");
    } catch (err) {
      console.log(err.message);
    }
  };

  const submitMessage = async (e) => {
    if (e.charCode === 13) {
      if (message === null) {
        alert("Please enter something !");
        return;
      }

      showEmojiMenu = false;

      try {
        let selectedUser = user_val.uid;

        let tempMessage = message;

        message = "";

        // combined id of two users
        let id =
          loggedInUser > selectedUser
            ? `${loggedInUser + selectedUser}`
            : `${selectedUser + loggedInUser}`;

        let ref = collection(db, "whatzapp_messages", id, "chat");
        await addDoc(ref, {
          message: tempMessage,
          from: loggedInUser,
          to: selectedUser,
          createdAt: Timestamp.fromDate(new Date()),
          image: image_url || "",
          audio: audio_url || "",
        });

        await setDoc(doc(db, "whatzapp_lastMsg", id), {
          message: tempMessage,
          from: loggedInUser,
          to: selectedUser,
          createdAt: Timestamp.fromDate(new Date()),
          image: image_url || "",
          audio: audio_url || "",
          unread: true,
        });

        // dispatch('combinedID', id)
        combinedID.set(id);
      } catch (err) {
        console.log(err.message);
      }
      file = null;
      image_url = null;
      audio_url = null;
    }
  };

  const handleChange = async (e) => {
    let selected = e.target.files[0];
    console.log(selected);

    // allowed file types
    const types = ["image/png", "image/jpeg", "image/jpg"];

    if (selected && types.includes(selected.type)) {
      file = selected;
      fileError = null;
      console.log("selected file name: ", file.name);

      const imgRef = ref(storage, `whatzapp/${file.name}`);

      const snap = await uploadBytes(imgRef, file);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      image_url = dlUrl;
    } else {
      file = null;
      fileError = "Please select an image file (png or jpg)";
    }
  };

  const addEmoji = (e) => {
    message += e.detail.emoji;
  };

  const toggleAudio = () => {
    isAudioOn = !isAudioOn;
    console.log("audio state: ", isAudioOn);

    if (isAudioOn) {
      micActive = true;

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaStream = stream;
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        chuck = [];

        mediaRecorder.addEventListener("dataavailable", (e) => {
          chuck.push(e.data);
        });

        mediaRecorder.addEventListener("stop", async (e) => {
          let blob = new Blob(chuck, {
            type: "audio/wav",
          });

          // audio_url = URL.createObjectURL(blob);
          let file = new File([blob], Date.now() + ".wav", { type: blob.type });
          console.log("audio url: ", file);

          const audioRef = ref(storage, `whatzapp/${file.name}`);

          const snap = await uploadBytes(audioRef, file);
          const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
          audio_url = dlUrl;
        });
      });
    } else {
      micActive = false;

      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const showUserList = () => {
    rightSide.style.width = '0'
    
    dispatch('showUserList', true)
  }

  $: if (user_val) {
    console.log("selected user: ", user_val);
  }

  $: if (messages_val) {
    console.log("selected user messages: ", messages_val);
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth <= 575) {
      rwd = true;
    } else {
      rwd = false;
    }
  });

  onMount(() => {
    selectedUser.set(null);
    rightSide.style.width = "100vw";

    console.log("window inner width: ", window.innerWidth);
    if (window.innerWidth <= 575) rwd = true;
  });
</script>

{#if !user_val}
  <div class="loading">
    <img
      src="whatsapp_web.jpg"
      alt="logo pic"
      style="height: calc(100%); width: 100%; object-fit: cover;"
    />
  </div>
{:else}
  <div class="rightSide" bind:this={rightSide}>
    <div class="header">
      <div style="display: flex; align-items: center;">
        {#if rwd}
          <ion-icon name="arrow-back-outline" style="margin-right: 10px;" on:click={showUserList} />
        {/if}
        {#if user_val}
          <div class="imgText">
            <div class="userimg">
              <img src={user_val.avatar} class="cover" alt="" />
            </div>
            <h4>{user_val.name}</h4>
          </div>
        {/if}
      </div>
      <ul class="nav_icons">
        <li on:click={logout}>
          <ion-icon name="log-out-outline" />
        </li>
      </ul>
    </div>
    <div class="chatBox">
      <div
        class="loading"
        style="object-fit: cover; visibility: hidden; height: 0;"
      >
        <img src="whatsapp_web.jpg" alt="logo pic" />
      </div>
      {#if messages_val.length}
        {#each messages_val as item (item.createdAt)}
          {#if item.from === auth.currentUser.uid}
            <div class="message my_message">
              <p
                style="display: flex; flex-direction: column; align-items: flex-end;"
              >
                {#if item.image}
                  <img
                    src={item.image}
                    alt={item.text}
                    style="margin-bottom: 12px;"
                  />
                {/if}
                {#if item.audio}
                  <audio controls style="margin-bottom: 12px;">
                    <source src={item.audio} />
                    <track kind="captions" />
                  </audio>
                {/if}
                {item.message}
                <span>{formatDistanceToNow(item.createdAt.toDate())}</span>
              </p>
            </div>
          {/if}
          {#if item.from === user_val.uid}
            <div class="message friend_message">
              <p style="display: flex; flex-direction: column;">
                {#if item.image}
                  <img
                    src={item.image}
                    alt={item.text}
                    style="margin-bottom: 12px;"
                  />
                {/if}
                {#if item.audio}
                  <audio controls style="margin-bottom: 12px;">
                    <source src={item.audio} />
                    <track kind="captions" />
                  </audio>
                {/if}
                {item.message}
                <span>{formatDistanceToNow(item.createdAt.toDate())}</span>
              </p>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
    <div class="chatbox_input" style="position: relative;">
      {#if file}
        <div class="file-name common">{file.name}</div>
      {/if}
      {#if audio_url}
        <div class="audio-notice common">Audio is ready</div>
      {/if}
      <li>
        <ion-icon
          name="happy-outline"
          on:click={() => (showEmojiMenu = !showEmojiMenu)}
        />
      </li>
      <label class="icon-attach">
        <ion-icon name="attach-outline" />
        <input
          class="attach-input"
          type="file"
          on:change={handleChange}
          style="margin: 0;
            padding: 0;
            box-sizing: border-box;
            width: 0;
            height: 0;
            opacity: 0;
            cursor: pointer;"
        />
      </label>
      <div class="input-box">
        <input
          type="text"
          placeholder="Type a message"
          bind:value={message}
          on:keypress={submitMessage}
        />
        <!-- <li><ion-icon class="icon-send" name="send-outline" /></li> -->
      </div>
      <li>
        <ion-icon
          class="icon-mic"
          class:micActive
          name="mic"
          on:click={toggleAudio}
        />
      </li>
    </div>
  </div>
  <EmojiMenu
    {showEmojiMenu}
    on:add-emoji={addEmoji}
    on:close-menu={() => (showEmojiMenu = false)}
  />
{/if}

<style>
  audio {
    max-width: 100%;
  }
  .micActive {
    color: #f0f0f0;
    background: #dd3333;
    padding: 3px;
    border-radius: 50%;
  }
  .common {
    position: absolute;
    background: transparent;
    backdrop-filter: blur(5px);
    padding: 5px;
    border-radius: 5px;
  }
  .audio-notice {
    top: -30px;
    right: 30px;
  }
  .file-name {
    top: -30px;
  }
  .userimg {
    cursor: pointer;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading,
  .rightSide {
    position: relative;
    flex: 95% 70%;
    /* width: 70%; */
    background: #e5ddd5;
  }
  .loading::before,
  .rightSide::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(pattern.jpg);
    opacity: 0.06;
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
  label,
  li {
    display: flex;
    list-style: none;
    cursor: pointer;
    color: #51585c;
    font-size: 1.5em;
  }
  li .icon-mic {
    margin-left: 15px;
  }
  .icon-send {
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    font-size: 1.2rem;
  }
  @media (max-width: 400px) {
    .icon-send {
      font-size: 1rem;
      right: 5px;
    }
  }
  .input-box {
    width: 100%;
    position: relative;
    /* border: 1px solid; */
  }
  input {
    outline: none;
    border: none;
    background: #fff;
    padding: 6px;
    height: 38px;
    border-radius: 30px;
    font-size: 14px;
    padding-left: 40px;
  }
  input::placeholder {
    color: #bbb;
  }
  .imgText {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .imgText h4 {
    font-weight: 500;
    line-height: 1.2em;
    margin-left: 15px;
    text-align: left;
  }
  .chatBox {
    position: relative;
    width: 100%;
    height: calc(100% - 120px);
    padding: 50px;
    overflow-y: auto;
  }
  .message {
    position: relative;
    display: flex;
    width: 100%;
    margin: 5px 0;
  }
  .message p {
    position: relative;
    right: 0;
    text-align: right;
    max-width: 65%;
    padding: 12px;
    background: #dcf8c6;
    border-radius: 10px;
    font-size: 0.9em;
  }
  .message p::before {
    content: "";
    position: absolute;
    top: 0;
    right: -12px;
    width: 20px;
    height: 20px;
    background: linear-gradient(
      135deg,
      #dcf8c6 0%,
      #dcf8c6 50%,
      transparent 50%,
      transparent
    );
  }
  .message p span {
    display: block;
    margin-top: 5px;
    font-size: 0.85em;
    opacity: 0.5;
  }
  .my_message {
    justify-content: flex-end;
  }
  .my_message p {
    word-wrap: break-word;
  }
  .friend_message {
    justify-content: flex-start;
  }
  .friend_message p {
    background: #fff;
    text-align: left;
    word-wrap: break-word;
  }
  .message.friend_message p::before {
    content: "";
    position: absolute;
    top: 0;
    left: -12px;
    width: 20px;
    height: 20px;
    background: linear-gradient(
      225deg,
      #fff 0%,
      #fff 50%,
      transparent 50%,
      transparent
    );
  }
  .chatbox_input {
    position: relative;
    width: 100%;
    height: 60px;
    background: #f0f0f0;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    justify-content: flex-start;
    align-items: center;
  }
  /* .chatbox_input img {
    cursor: pointer;
    font-size: 1.8em;
    color: #51585c;
  }
  .chatbox_input img:nth-child(1) {
    margin-right: 15px;
  } */
  .chatbox_input input {
    position: relative;
    width: 100%;
    /* margin: 0 20px; */
    padding: 10px 20px;
    border: none;
    outline: none;
    border-radius: 30px;
    font-size: 1em;
  }
  .icon-attach {
    margin: 0 20px;
    padding: 0;
    box-sizing: border-box;
  }
  @media (max-width: 575px) {
    .rightSide {
      /* width: 0; */
      /* flex: 0%; */
      /* display: none; */
    }
    label,
    li {
      margin: 0;
    }
    .chatBox {
      padding: 20px;
    }
    .chatbox_input {
      padding: 10px;
    }
  }
</style>

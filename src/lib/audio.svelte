<script>
  let audio_url = null
  let chuck = null
  let mediaStream = null
  let mediaRecorder = null

  const record = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      mediaStream = stream
      mediaRecorder = new MediaRecorder(stream)
      mediaRecorder.start()
      chuck = []

      mediaRecorder.addEventListener("dataavailable", e => {
        chuck.push(e.data)
      })

      mediaRecorder.addEventListener("stop", e => {
        let blob = new Blob(chuck, {
          type: 'audio/wav; codecs=0'
        })
        audio_url = URL.createObjectURL(blob)
        console.log('audio url: ', audio_url)
      })
    });
  };
  const stop = () => {    
    mediaStream.getTracks().forEach(track => {
      track.stop()
    })
  };
</script>

<button on:click={record}>Record</button>
<button on:click={stop}>Stop</button>
<br>

<audio controls src={audio_url}>
  <track kind="captions">
</audio>

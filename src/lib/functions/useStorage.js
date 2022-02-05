import { auth, storage, db } from "./firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";

const useStorage = async (file) => {
  let user = null;

  // reference
  const docRef = doc(db, "whatzapp_users", auth.currentUser.uid);
  const fileRef = ref(storage, `whatzapp/${file.name}`);

  /* Using uploadBytesResumable */
  // Monitor Upload Progress
  // const uploadTask = uploadBytesResumable(path, file);

  // uploadTask.on(
  //   "state_changed",
  //   (snapshot) => {
  //     let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //     console.log("upload is " + progress + "% done");
  //   },
  //   (err) => {
  //     console.log(err.message)
  //   },
  //   () => {
  //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //       console.log("File available at", downloadURL);
  //       imageUrl.set(downloadURL)

  //        let ref = doc(db, "whatzapp_users", auth.currentUser.uid);
  //        updateDoc(ref, {
  //          avatar: downloadURL,
  //        });
  //     });
  //   }
  // );

  // delete user's previous image
  getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      user = docSnap.data();
      console.log("user data: ", user);
      deleteObject(ref(storage, user.avatarPath))
        .then(() => {
          console.log("file deleted successfully");
        })
        .catch((error) => {
          console.log(error.message);

        });
    }
  });

  // Using uploadBytes
  try {
    const snap = await uploadBytes(fileRef, file);
    const url = await getDownloadURL(ref(storage, snap.ref.fullPath));
    console.log("file name: ", snap.ref.fullPath);
    console.log("file url: ", url);

    await updateDoc(docRef, {
      avatar: url,
      avatarPath: snap.ref.fullPath,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export default useStorage;

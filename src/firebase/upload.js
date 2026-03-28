import { storage } from "./firebase";
import { getDownloadURL, ref,  uploadBytesResumable } from "firebase/storage";

const upload = async (file, folder, onProgress) =>{
    const timestamp = Date.now();
    const filePath = `RBMarket/${folder}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress){
              onProgress(progress);
            }
          }, 
          (error) => {
            reject("Upload failed: " + error.message);
          }, 
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve({downloadURL, filePath});
            });
          }
        );
    })
}

export default upload;
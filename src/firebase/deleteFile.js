import { storage } from "./firebase";
import { ref, deleteObject } from "firebase/storage";

const deleteFile = async (filePath) => {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return true;
    } 
    catch (error) {
        if (error.code === "storage/object-not-found"){
            return true; // it means the file has already been deleted before
        }
        throw new Error("Error deleting file: " + error.message);
    }
};

export default deleteFile;
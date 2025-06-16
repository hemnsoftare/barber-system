// import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
// import { storage } from "./firebase";

export async function uploadImage(file: File): Promise<string> {
  try {
    // Create a storage reference
    // const storageRef = ref(storage, `images/${file.name}`);

    // // Upload the file
    // const snapshot = await uploadBytes(storageRef, file);

    // // Get the download URL
    // const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(file);
    return "images/barber.png";
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

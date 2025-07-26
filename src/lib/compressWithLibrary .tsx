import imageCompression from "browser-image-compression";

export const compressWithLibrary = async (file: File) => {
  const options = {
    maxSizeMB: 0.3, // 300KB
    maxWidthOrHeight: 1200,
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log("Original size:", (file.size / 1024).toFixed(2) + "KB");
    console.log(
      "Compressed size:",
      (compressedFile.size / 1024).toFixed(2) + "KB"
    );
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    return file;
  }
};

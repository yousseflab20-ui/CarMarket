export const uploadToCloudinary = async (
  imageUri: string,
  mediaType: "image" | "video",
): Promise<string> => {
  try {
    const CLOUD_NAME = "dkdelt4tc";
    const UPLOAD_PRESET = "expo_cars";

    const formData = new FormData();

    if (!imageUri) {
      throw new Error("Image URI is missing");
    }

    // @ts-ignore
    formData.append("file", {
      uri: imageUri,
      type: mediaType === "image" ? "image/jpeg" : "video/mp4",
      name: mediaType === "image" ? "photo.jpg" : "video.mp4",
    } as any);

    console.log("UPLOAD URI:", imageUri);
    console.log("FORMDATA READY");
    formData.append("upload_preset", UPLOAD_PRESET);
    console.log("UPLOAD URI:", imageUri);
    console.log("MEDIA TYPE:", mediaType);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${mediaType}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Cloudinary error:", error);
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    console.log("✅ Uploaded:", data.secure_url);

    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

export const uploadMultipleToCloudinary = async (
  media: {
    uri: string;
    type: "image" | "video";
  }[],
): Promise<string[]> => {
  try {
    console.log(`📤 Uploading ${media.length} files...`);

    const uploadPromises = media.map((item) =>
      uploadToCloudinary(item.uri, item.type),
    );
    const urls = await Promise.all(uploadPromises);

    console.log("✅ All media uploaded");
    return urls;
  } catch (error) {
    console.error("Multiple upload error:", error);
    throw error;
  }
};

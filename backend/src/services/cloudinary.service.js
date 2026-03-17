import cloudinary from "../config/cloudinary.js";

class CloudinaryService {
  async uploadAudio(fileBuffer) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "voice_messages",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error.message);
            return reject(new Error("Failed to upload audio to Cloudinary"));
          }
          resolve(result.secure_url);
        }
      );

      uploadStream.end(fileBuffer);
    });
  }
}

export default new CloudinaryService();

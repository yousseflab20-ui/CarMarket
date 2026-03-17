import cloudinary from "../config/cloudinary.js";
import fs from "fs";

class CloudinaryService {
  async uploadAudio(filePath) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "video", // Cloudinary uses 'video' for audio files
        folder: "voice_messages",
      });

      // Delete local file after upload
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return result.secure_url;
    } catch (error) {
      console.error("❌ Cloudinary Upload Error:", error.message);
      
      // Still try to delete local file on failure
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      throw new Error("Failed to upload audio to Cloudinary");
    }
  }
}

export default new CloudinaryService();

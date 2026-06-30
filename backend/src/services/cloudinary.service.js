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
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async uploadImage(fileBuffer) {
    // if (!fileBuffer || fileBuffer.length === 0) {
    //   throw new Error("uploadImage: fileBuffer is empty or undefined");
    // }
    // const { cloud_name, api_key, api_secret } = cloudinary.config();
    // if (!cloud_name || !api_key || !api_secret) {
    //   throw new Error("Cloudinary credentials are not configured (check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars)");
    // }
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "chat_images",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error.message);
            return reject(
              new Error(`Cloudinary image upload failed: ${error.message}`),
            );
          }
          resolve(result.secure_url);
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteFile(fileUrl, resourceType = "image") {
    try {
      if (!fileUrl) return;

      const urlParts = fileUrl.split("/");
      const fileWithExt = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];

      const fileName = fileWithExt.split(".")[0];
      const publicId = `${folder}/${fileName}`;

      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      console.log(`✅ Successfully deleted ${publicId} from Cloudinary`);
    } catch (error) {
      console.error("❌ Cloudinary Delete Error:", error.message);
    }
  }
}

export default new CloudinaryService();

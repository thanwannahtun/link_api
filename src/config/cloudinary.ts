import { v2 as cloudinary } from 'cloudinary';
import pLimit from 'p-limit';
import path from 'path';
import fs from 'fs';

/**
 * A class which operates uploading images file to the 
 * cloudinary cloud storage .
 * 
 * Before using this class 
 * configure all the credentials firstly.
 * ```ts
    Cloudinary.confiureCloudinary();
 * ```
 * @see [official documentation for uploading images](https://cloudinary.com/documentation/upload_images)
 */
export class Cloudinary {

    /// Organize files in Cloudinary
    private static folder = "uploads";

    private constructor() { }
    /**
    * Configure the **Cloudinary** credentials
    */
    static confiureCloudinary() {
        try {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRECT,
                // Return "https" URLs by setting secure: true
                secure: true
            });
            console.log(`🎉 Cloudinary configured! Cloud_name = ${process.env.CLOUDINARY_CLOUD_NAME}`);
        } catch (error) {
            console.error(`⚠️ Error configuring Cloudinary => ${error}`);
        }
    }
    /**
     * upload to Cloudinary and 
     * return `secure_url` **string** value  for accessing the image url
     * */
    static async uploadSingle(file: Express.Multer.File): Promise<string> {
        // return "secure_url_mock";
        const filePath = path.resolve(file.path);
        console.log(`File Path Before Uploading: ${filePath}`);

        // Verify if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            throw new Error(`File missing from disk`);
        }
        try {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, {
                folder: Cloudinary.folder, // Organize files in Cloudinary
            });

            // // Clean up temporary file
            // fs.unlinkSync(filePath);

            return result.secure_url;
        } catch (e) {
            if (e instanceof Error) {
                // Log the error message and stack trace
                console.error(`⚠️ Failed uploading file: ${e.message}`);
                console.error(e.stack);
            } else {
                // Handle unexpected error types
                console.error(`⚠️ Unexpected error: ${JSON.stringify(e)}`);
            }
            throw new Error(`Failed Uploading file to Cloudinary!`);
        }
    }
    /**
     * upload to Cloudinary and 
     * return array of `secure_url` **string[]** values  for accessing the images urls
     * */
    static async uploadMultiple(files: Express.Multer.File[]): Promise<string[]> {
        const limit = pLimit(5); // concurrency limit to five files
        try {
            const images = files.map(async (file) => limit(() => Cloudinary.uploadSingle(file)));
            return await Promise.all(images);
        } catch (e) {
            console.error(`Error uploading files: ${e}`);
            throw new Error(`Error Uploading files to Cloudinary!`);
        }
    }
}

/*
/// https://cloudinary.com/documentation/upload_images
@types/cloudinary --save-dev
High-Level Architecture (Workflow)

Render Disk (Temporary storage):
    Images are uploaded from the client to the Render instance.
    Images are validated and processed.
    Stored temporarily in the /tmp folder (a good practice for transient storage).
Cloud Storage:
    Once the image is uploaded to the temporary folder, the server uploads it to a free cloud storage service like Cloudinary or Google Cloud Storage.
    The backend stores only the URL of the uploaded image in the database (e.g., MongoDB Atlas).

(() => { })();
const public_id = cloudinary.url("app_logo_wt6n8t")
console.log(`Public ID = ${public_id}`);
///https://www.youtube.com/watch?v=2Z1oKtxleb4

- an example of the JSON response returned: by cloudinary.upload()
{
  "asset_id": "3515c6000a548515f1134043f9785c2f",
  "public_id": "gotjephlnz2jgiu20zni",
  "version": 1719307544,
  "version_id": "7d2cc533bee9ff39f7da7414b61fce7e",
  "signature": "d0b1009e3271a942836c25756ce3e04d205bf754",
  "width": 1920,
  "height": 1441,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2024-06-25T09:25:44Z",
  "tags": [],
  "pages": 1,
  "bytes": 896838,
  "type": "upload",
  "etag": "2a2df1d2d2c3b675521e866599273083",
  "placeholder": false,
  "url": "http://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg",
  "secure_url": "https://res.cloudinary.com/cld-docs/image/upload/v1719307544/gotjephlnz2jgiu20zni.jpg",
  "asset_folder": "",
  "display_name": "gotjephlnz2jgiu20zni",
  "original_filename": "sample",
  "api_key": "614335564976464"
}
*/
/*
https://github.com/cloudinary-devs/cld-node-sdk-quick-start
https://cloudinary.com/documentation/node_quickstart
/////////////////////////
// Uploads an image file
/////////////////////////
const uploadImage = async (imagePath) => {

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(imagePath, options);
      console.log(result);
      return result.public_id;
    } catch (error) {
      console.error(error);
    }
};


/////////////////////////////////////
// Gets details of an uploaded image
/////////////////////////////////////
const getAssetInfo = async (publicId) => {

    // Return colors in the response
    const options = {
      colors: true,
    };

    try {
        // Get details about the asset
        const result = await cloudinary.api.resource(publicId, options);
        console.log(result);
        return result.colors;
        } catch (error) {
        console.error(error);
    }
};

/// Usage
//////////////////
//
// Main function
//
//////////////////
(async () => {

    // Set the image to upload
    const imagePath = 'https://cloudinary-devs.github.io/cld-docs-assets/assets/images/happy_people.jpg';

    // Upload the image
    const publicId = await uploadImage(imagePath);

    // Get the colors in the image
    const colors = await getAssetInfo(publicId);

    // Create an image tag, using two of the colors in a transformation
    const imageTag = await createImageTag(publicId, colors[0][0], colors[1][0]);

    // Log the image tag to the console
    console.log(imageTag);

})();

{
  cloud_name: 'demo',
  api_key: '1234',
  api_secret: 'abcd',
  private_cdn: false,
  secure_distribution: null,
  secure: true
}
*/
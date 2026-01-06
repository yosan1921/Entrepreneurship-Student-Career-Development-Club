const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Generate thumbnail for uploaded images
 * @param {string} originalPath - Path to original image
 * @param {string} fileName - Original filename
 * @returns {Promise<string>} - Path to generated thumbnail
 */
async function generateThumbnail(originalPath, fileName) {
    try {
        // Create thumbnails directory if it doesn't exist
        const thumbnailsDir = path.join(__dirname, '../uploads/gallery/thumbnails');
        if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir, { recursive: true });
        }

        // Generate thumbnail filename
        const ext = path.extname(fileName);
        const baseName = path.basename(fileName, ext);
        const thumbnailFileName = `thumb_${baseName}${ext}`;
        const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);

        // Generate thumbnail using Sharp
        await sharp(originalPath)
            .resize(300, 200, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

        console.log(`✅ Thumbnail generated: ${thumbnailFileName}`);
        return thumbnailPath;

    } catch (error) {
        console.error('❌ Error generating thumbnail:', error);
        return null;
    }
}

/**
 * Generate video thumbnail using ffmpeg (optional)
 * @param {string} videoPath - Path to video file
 * @param {string} fileName - Original filename
 * @returns {Promise<string>} - Path to generated thumbnail
 */
async function generateVideoThumbnail(videoPath, fileName) {
    try {
        // For now, return a placeholder or skip video thumbnails
        // You can implement ffmpeg integration here if needed
        console.log('📹 Video thumbnail generation not implemented yet');
        return null;
    } catch (error) {
        console.error('❌ Error generating video thumbnail:', error);
        return null;
    }
}

/**
 * Delete thumbnail file
 * @param {string} thumbnailPath - Path to thumbnail file
 */
function deleteThumbnail(thumbnailPath) {
    try {
        if (thumbnailPath && fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
            console.log('🗑️ Thumbnail deleted:', path.basename(thumbnailPath));
        }
    } catch (error) {
        console.error('❌ Error deleting thumbnail:', error);
    }
}

module.exports = {
    generateThumbnail,
    generateVideoThumbnail,
    deleteThumbnail
};
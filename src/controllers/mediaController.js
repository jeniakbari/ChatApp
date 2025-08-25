import { putSignedUrl } from '../utility/putSignedUrl.js';
import { v4 as uuidv4 } from 'uuid';

const requestImageUploadUrl = async (req, res, next) => {
  try {
    const { fileName, fileType, fileSize } = req.body; // from client
    const mediaKey = `chat_media/${Date.now()}_${fileName}`;

    const uploadUrl = await getSignedPutUrl(mediaKey, fileType);

    res.json({
      success: true,
      uploadUrl,    // For client to PUT file
      media_key: mediaKey,
      media_mime: fileType,
      media_size: fileSize
    });
  } catch (error) {
    next(error);
  }
};

export {requestImageUploadUrl};

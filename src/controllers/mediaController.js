import { putSignedUrl } from '../utility/putSignedUrl.js';
import { v4 as uuidv4 } from 'uuid';

const requestImageUploadUrl = async (req, res, next) => {
  try {
    const { fileName, fileType } = req.body;

    const uniqueKey = `chat_images/${uuidv4()}-${fileName}`;
    const signedUrl = await putSignedUrl(uniqueKey, fileType);

    res.status(200).json({
      uploadUrl: signedUrl,
      fileKey: uniqueKey
    });
  } catch (err) {
    next(err);
  }
};

export {requestImageUploadUrl};

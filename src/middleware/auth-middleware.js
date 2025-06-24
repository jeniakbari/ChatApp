import CryptoJS from "crypto-js";

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Decrypt the token
        const decryptedData = CryptoJS.AES.decrypt(token, process.env.ACCESS_SECRET).toString(CryptoJS.enc.Utf8);

        if (!decryptedData) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        // Split the decrypted data to get userId
        const [userId, issuedAt] = decryptedData.split("##");

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token payload" });
        }

        req.user = userId;

        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.status(401).json({ message: "Unauthorized: Token error" });
    }
};

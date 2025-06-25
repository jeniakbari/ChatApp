import { User } from "../models/usersModel.js";
import CryptoJS from 'crypto-js';
import crypto from 'crypto'; 
import { sendEmail } from '../utility/sendEmail.js';
import { generateAlphanumericOTP } from "../utility/generateOtp.js";
import { UserLoginLogs } from "../models/userLoginLogsModel.js"; 
import { UserOtpLogs } from "../models/userOtpLogsModel.js";
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
// import cron from 'node-cron';


const registerUser = async (req,res,next) => {
    try {
        const { first_name, last_name, email } = req.body;


        const existingUser = await User.findOne({ where: { email } });
        if (existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        const token = crypto.randomBytes(32).toString('hex');

        const tokenData = await User.findAndCountAll();
        tokenData.rows.forEach((row) => {
            if (row.verification_token === token) {
                // If the token already exists, generate a new one
                token = crypto.randomBytes(32).toString('hex');
            }
        });

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            verification_token: token,
        });

        const verifyLink = `http://localhost:8080/api/auth/verify/${token}`;

        const htmlContent = `
            <h3>Welcome, ${newUser.first_name}!</h3>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verifyLink}">Verify Email</a>
            <p>If you didn't request this, ignore this email.</p>
            `;

        await sendEmail(
            newUser.email,
            "Verify your email address",
            htmlContent
        );

        return res.status(201).json({
            message: "User registered successfully, verification email sent",
            user: {
                user_id: newUser.user_id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                token: newUser.verification_token,
            }
        });
    } catch (error) {
        next(error);
    }
}


const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ where: { verification_token: token } });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }
        if(user.is_verified === 1) {
            return res.status(400).json({ message: "Email already verified" });
        }

        user.is_verified = 1;
        await user.save();

        return res.status(200).json({ message: "Email verified successfully" });
    } catch (error) {
        next(error);
    }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const rawOtp = generateAlphanumericOTP()
    // const encryptedOtp = CryptoJS.AES.encrypt(rawOtp, process.env.OTP_SECRET).toString();
    const encryptedOtp = await bcrypt.hash(rawOtp, 10);

    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await sendEmail(
      email,
      "Your Login OTP",
      `Your OTP is: ${rawOtp}` 
    );

    await UserOtpLogs.create({
      user_id: user.user_id,
      otp: encryptedOtp,
      expired_at: expiry,
    });


    return res.status(200).json({otp:rawOtp, message: "OTP sent to email" });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email:email} });
    if (!user) return res.status(404).json({ message: "You are not registered user" });
    if(user.failed_attempts === 3) {
        return res.status(403).json({ message: "Your account is locked due to multiple failed attempts. Please try again tomorrow" });
    }
    if(user.is_verified === 0) {
        return res.status(403).json({ message: "Please verify your email first" });
    }

    const otpEn = await UserOtpLogs.findAll({
      where : {user_id: user.user_id,
        expired_at: {
          [Op.gt]: new Date() // Check if the OTP is not expired
        }
      },
    })


    if(!otpEn || otpEn.count === 0) {
      return res.status(400).json({ message: "OTP not found or expired." });
    }

   let matchFound = false;

    for (const log of otpEn) {
    const isMatch = await bcrypt.compare(otp, log.otp);
      if (isMatch) {
        matchFound = true;
        break;
      }
    }


    if (!matchFound) {
      user.failed_attempts += 1;
      await user.save();
      return res.status(401).json({ message: "Invalid OTP" });
    }   

    const rawAccessToken = `${user.user_id}##${Date.now()}`;

    const accessToken = CryptoJS.AES.encrypt(rawAccessToken, process.env.ACCESS_SECRET).toString();
    const refreshToken = CryptoJS.AES.encrypt(user.email + Date.now(), process.env.REFRESH_SECRET).toString();
    const accessExp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 days
    const refreshExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days


    await UserLoginLogs.create({
      user_id: user.user_id,
      access_token: accessToken,
      access_token_expiration_datetime: accessExp,
      refresh_token: refreshToken,
      refresh_token_expire_datetime: refreshExp,
    });

    return res.status(200).json({
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
    });

  } catch (err) {
    next(err);
  }
};


const refreshAccessToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    const tokenLog = await UserLoginLogs.findOne({
      where: {
        refresh_token: refresh_token,
        refresh_token_expire_datetime: { [Op.gt]: new Date() },
        is_logout: 0
      }
    });

    if (!tokenLog) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    const user = await User.findOne({
      where: { user_id: tokenLog.user_id }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const rawAccessToken = `${tokenLog.user_id}-${Date.now()}`;
    const newAccessToken = CryptoJS.AES.encrypt(rawAccessToken, process.env.ACCESS_SECRET).toString();
    const newAccessExp = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    const newrefreshToken = CryptoJS.AES.encrypt(user.email + Date.now(), process.env.REFRESH_SECRET).toString();
    const newrefreshExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await UserLoginLogs.create({
      user_id: tokenLog.user_id,
      is_logout: 0,
      access_token: newAccessToken,
      access_token_expiration_datetime: newAccessExp,
      logoout_datetime: null,
      refresh_token: newrefreshToken,
      refresh_token_expire_datetime: newrefreshExp
    });

    return res.status(200).json({
      message: "New access token generated",
      access_token: newAccessToken
    });

  } catch (err) {
    next(err);
    console.error("Error in refreshAccessToken:", err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const { access_token } = req.body;

    const tokenLog = await UserLoginLogs.findOne({
      where: {
        access_token: access_token,
        is_logout: 0
      }
    });

    if (!tokenLog) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    tokenLog.is_logout = 1;
    tokenLog.logout_datetime = new Date();
    await tokenLog.save();

    return res.status(200).json({ message: "Logged out successfully" });

  }
  catch (err) {
    next(err);
  }
};


export { registerUser, verifyEmail ,sendOtp,loginUser,refreshAccessToken ,logoutUser};

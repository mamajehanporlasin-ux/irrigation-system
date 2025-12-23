import express from 'express';

import userAuthentication from '../functions/userAuthentication.js';
import { register, update, login, logout, sendPasswordResetOTP, resetPasswordWithOTP, changePassword, isOTPCodesCorrect, validateMyPassword } from '../controllers/user.controller.js';

const router= express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", userAuthentication, logout);
router.post("/request-password-reset-otp", sendPasswordResetOTP);
router.post("/reset-password-with-otp", resetPasswordWithOTP);
router.post("/change-password", userAuthentication, changePassword);
router.post("/verify-otp-codes", isOTPCodesCorrect);
router.post("/validate-my-password", userAuthentication, validateMyPassword);
router.put("/update", userAuthentication, update);

export default router;
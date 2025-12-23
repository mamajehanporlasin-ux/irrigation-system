import express from 'express';
import { registerNewDevice, getMyDevices, deviceOnline, updateDevice } from '../controllers/device.controller.js';
import userAuthentication from '../functions/userAuthentication.js';

const router= express.Router();

router.post("/register", userAuthentication, registerNewDevice);
router.get("/get-my-devices", userAuthentication, getMyDevices);
router.post("/online", deviceOnline);
router.put("/update/:deviceDBID", userAuthentication, updateDevice);

export default router;
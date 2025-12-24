import express from 'express';
import { submitData } from '../controllers/event.controller.js';
import userAuthentication from '../functions/userAuthentication.js';

const router= express.Router();

router.post("/submit-data", submitData);

export default router;
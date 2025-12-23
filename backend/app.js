import express from 'express';
import { dbConnection } from './config/db_access.js';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import deviceRouter from './routers/device.router.js';
<<<<<<< HEAD
import userRouter from './routers/user.router.js';
import checkOfflineDevices from './functions/checkOfflineDevices.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === "null")
      return callback(null, false);

    return callback(null, origin);
  },
  credentials: true
}));

=======
import checkOfflineDevices from './functions/checkOfflineDevices.js';
import cors from 'cors';

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
}));


>>>>>>> f400d892dd942d18ad749483142ac48e37a687c5
const PORT = process.env.PORT || 5000;
const secretPath =
  fs.existsSync('/etc/secrets/.env')
    ? '/etc/secrets/.env'
    : './.env';
<<<<<<< HEAD

dotenvConfig({ path: secretPath });

app.use("/api/device", deviceRouter);
app.use("/api/user", userRouter);
app.get("/", (req, res)=>{
    res.json({message: "Server is working!"})
});
=======
dotenvConfig({ path: secretPath });

app.get("/", (req, res)=>{
    res.json({message: "Server is working!"})
});
app.use("/device", deviceRouter);
>>>>>>> f400d892dd942d18ad749483142ac48e37a687c5

setInterval(checkOfflineDevices, 30000);

app.listen(PORT, ()=>{
    dbConnection();
    console.log("server started at http://localhost:"+PORT);
});
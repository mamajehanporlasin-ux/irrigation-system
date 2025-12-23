import Device from "../models/device.model.js";
import User from "../models/user.model.js";
import { isDeviceIDExisting } from "../functions/functions.js";

import mongoose from "mongoose";

export const registerNewDevice = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const deviceID =  req.body.deviceID;
    const id=req.body._id;
    
    if(!deviceID){
        return res.status(200).json({success: false, message: "Invalid Device ID!"});
    }

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(200).json({success: false, message: "Authentication Failed!"});
    }

    const session = await mongoose.startSession();
    try{
        const onRecordUser = await User.findById(id);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        if(await isDeviceIDExisting(deviceID)){
            return res.status(200).json({success: false, message: "Device ID is already in use!"});
        }

        session.startTransaction();

        const newDevice = new Device();
        newDevice.deviceID = deviceID;
        newDevice.owner=id;

        await newDevice.save();

        await session.commitTransaction();
        res.status(200).json({success: true, data: [newDevice]});
    }catch(error){
        await session.abortTransaction();
        console.error("Error in registering Device! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        await session.endSession();
    }
    
    return res;
}

export const getMyDevices = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }
    const id=req.body._id;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(200).json({success: false, message: "Authentication Failed!"});
    }

    try{
        const onRecordUser = await User.findById(id);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        const devices = await Device.find({"owner": id});

        if(!devices){
            res.status(500).json({success: false, message:"No device found!"});
        }else{
            res.status(200).json({success: true, data: devices});
        }
    }catch(error){
        res.status(500).json({success: false, message:"Server Error"});
    }

    return res;
}

export const updateDevice = async(req, res)=>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const deviceID =  req.body.deviceID;
    const deviceDBID=req.params.deviceDBID;
    const id=req.body._id;
    
    if(!deviceID){
        return res.status(200).json({success: false, message: "Invalid Device ID!"});
    }

    if(!mongoose.Types.ObjectId.isValid(deviceDBID)){
        return res.status(200).json({success: false, message: "Invalid Device DB ID!"});
    }

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(200).json({success: false, message: "Authentication Failed!"});
    }

    const session = await mongoose.startSession();
    try{
        const onRecordUser = await User.findById(id);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        const onRecordDevice = await Device.findById(deviceDBID);
        if(!onRecordDevice){
            return res.status(200).json({success: false, message: "Invalid Device DB ID!"});
        }

        if(await isDeviceIDExisting(deviceID, deviceDBID)){
            return res.status(200).json({success: false, message: "Device ID is already in use!"});
        }

        session.startTransaction();

        onRecordDevice.deviceID = deviceID;
        
        const updatedDevice =await Device.findByIdAndUpdate(deviceDBID, onRecordDevice, {new: true, session});
        await session.commitTransaction();
        res.status(200).json({success: true, data: [updatedDevice]});

    }catch(error){
        await session.abortTransaction();
        console.error("Error in updating Device ID! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        await session.endSession();
    }
    
    return res;
}


export const deviceOnline = async(req, res) =>{
    const deviceID =  req.body.deviceID;
    
    try{
        const result = await Device.find({deviceID});
        if(!result){
            res.status(500).json({success: false, message:"Device Not found!"});    
        }else{
            const device=result[0];

            device.isOnline = true;
            const updatedDevice = await Device.findByIdAndUpdate(device._id, device, {new: true});
            res.status(200).json({success: true, data: [updatedDevice]});
        }
    }catch(error){
        console.log(error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }
    
    return res;
}
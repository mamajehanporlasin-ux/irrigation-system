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
        
        const updatedDevice =await Device.findByIdAndUpdate(deviceDBID, onRecordDevice, {runValidators: true, new: true, session});
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
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const deviceID =  req.body.deviceID;
    var temperature= req.body.temperature;
    var humidity=req.body.humidity;
    var reservoirLevel=req.body.reservoirLevel;
    var soilMoisture1=req.body.soilMoisture1;
    var soilMoisture2=req.body.soilMoisture2;
    var soilMoisture3=req.body.soilMoisture3;
    const waterLevel1=req.body.waterLevel1;
    const waterLevel2=req.body.waterLevel2;
    const waterLevel3=req.body.waterLevel3;
    
    if(!deviceID){
        return res.status(200).json({success: false, message: "Invalid Device ID!"});
    }

    if(!temperature){
        temperature=0;
    }

    if(!humidity){
        humidity=0;
    }

    if(!reservoirLevel){
        reservoirLevel='LOW';
    }

    if(typeof soilMoisture1 !== "boolean"){
        soilMoisture1=false;
    }

    if(typeof soilMoisture2 !== "boolean"){
        soilMoisture2=false;
    }

    if(typeof soilMoisture3 !== "boolean"){
        soilMoisture3=false;
    }

    const session = await mongoose.startSession();
    try{
        const result = await Device.find({deviceID});
        if(!result){
            res.status(500).json({success: false, message:"Device Not found!"});    
        }else{
            session.startTransaction();

            const device=result[0];
            device.isOnline = true;
            device.lastUpdate=Date.now();
            device.temperature=temperature;
            device.humidity=humidity;
            device.reservoirLevel=reservoirLevel;
            device.soilMoisture1=soilMoisture1;
            device.soilMoisture2=soilMoisture2;
            device.soilMoisture3=soilMoisture3;
            device.waterLevel1=waterLevel1;
            device.waterLevel2=waterLevel2;
            device.waterLevel3=waterLevel3;

            const updatedDevice = await Device.findByIdAndUpdate(device._id, device, {runValidators: true, new: true, session});
            await session.commitTransaction();

            res.status(200).json({success: true, data: [updatedDevice]});
        }
    }catch(error){
        console.log(error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }
    
    return res;
}
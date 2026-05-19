import Device from "../models/device.model.js";
import User from "../models/user.model.js";
import { isDeviceIDExisting } from "../functions/functions.js";
import { isDateValid } from "../functions/functions.js";

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

    try{
        const onRecordUser = await User.findById(id);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        if(await isDeviceIDExisting(deviceID)){
            return res.status(200).json({success: false, message: "Device ID is already in use!"});
        }


        const newDevice = new Device();
        newDevice.deviceID = deviceID;
        newDevice.owner=id;

        await newDevice.save();


        res.status(200).json({success: true, data: [newDevice]});
    }catch(error){
        console.error("Error in registering Device! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{

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

        onRecordDevice.deviceID = deviceID;
        if(!("field1CropAlertDate" in onRecordDevice)){
            onRecordDevice.field1CropAlertDate = -1;
        }
        if(!("field2CropAlertDate" in onRecordDevice)){
            onRecordDevice.field2CropAlertDate = -1;
        }
        
        const updatedDevice = await Device.findByIdAndUpdate(deviceDBID, onRecordDevice, {runValidators: true, new: true});
        if(!updatedDevice || updatedDevice === undefined){
            console.log("Error updating deviceID...");
            return res.status(200).json({success: false, message: "Device ID is already in use!"});
        }


        
        res.status(200).json({success: true, data: [updatedDevice]});

    }catch(error){
        
        console.error("Error in updating Device ID! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        
    }
    
    return res;
}


export const deviceOnline = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    console.log("data: "+JSON.stringify(req.body));

    const deviceID =  req.body.deviceID;
    var temperature= req.body.temperature;
    var humidity=req.body.humidity;
    const waterLevel1=req.body.waterLevel1;
    const waterLevel2=req.body.waterLevel2;
    const isRaining=req.body.isRaining;
    const soilMoist1=req.body.soilMoist1;
    const soilMoist2=req.body.soilMoist2;
    const soilMoist3=req.body.soilMoist3;
    const soilMoist4=req.body.soilMoist4;
    const soilMoist5=req.body.soilMoist5;
    const soilMoist6=req.body.soilMoist6;
    const isPump1On=req.body.isPump1On;
    const isPump2On=req.body.isPump2On;
    const isPump3On=req.body.isPump3On;
    const isPump4On=req.body.isPump4On;
    const isPump5On=req.body.isPump5On;
    const isPump6On=req.body.isPump6On;


    if(!deviceID){
        return res.status(200).json({success: false, message: "Invalid Device ID!"});
    }

    if(!temperature){
        temperature=0;
    }

    if(!humidity){
        humidity=0;
    }

    try{
        const result = await Device.find({deviceID});
        if(!result){
            res.status(500).json({success: false, message:"Device Not found!"});    
        }else{

            const device=result[0];
            device.isOnline = true;
            device.lastUpdate=Date.now();
            device.temperature=temperature;
            device.humidity=humidity;
            device.waterLevel1=waterLevel1;
            device.waterLevel2=waterLevel2;
            device.isRaining=isRaining;
            device.soilMoist1=soilMoist1;
            device.soilMoist2=soilMoist2;
            device.soilMoist3=soilMoist3;
            device.soilMoist4=soilMoist4;
            device.soilMoist5=soilMoist5;
            device.soilMoist6=soilMoist6;
            device.pump1=isPump1On;
            device.pump2=isPump2On;
            device.pump3=isPump3On;
            device.pump4=isPump4On;
            device.pump5=isPump5On;
            device.pump6=isPump6On;

            const updatedDevice = await Device.findByIdAndUpdate(device._id, device, {runValidators: true, new: true});

            res.status(200).json({success: true, data: [updatedDevice]});
        }
    }catch(error){
        console.log(error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
    
    }
    
    return res;
}

export const getADevice = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const id=req.body._id;
    const deviceID=req.params.deviceID;

    if(!deviceID || deviceID.length<1){
        return res.status(200).json({success: false, message: "Invalid Device ID!"});
    }
    
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(200).json({success: false, message: "Authentication Failed!"});
    }

    try{
        const onRecordUser = await User.findById(id);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        const device = await Device.find({"deviceID": deviceID});
        if(!device){
            res.status(500).json({success: false, message:"No device found!"});
        }else if(device[0].owner.toString() != id){
            res.status(500).json({success: false, message:"Authentication Failed!"});
        }else{
            res.status(200).json({success: true, data: device});
        }
    }catch(error){
        console.log("An error occured retrieving Device! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }

    return res;
}

export const getNumberOfDevicesOnline = async (req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const ownerId=req.body._id;   
    if(!mongoose.Types.ObjectId.isValid(ownerId)){
        return res.status(200).json({success: false, message: "Authentication Failed!"});
    }

    try{
        const onRecordUser = await User.findById(ownerId);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        const response = await Device.aggregate([
            {
                $match: {
                owner: onRecordUser._id
                }
            },
            {
                $group: {
                _id: null,
                online: {
                    $sum: {
                    $cond: [{ $eq: ["$isOnline", true] }, 1, 0]
                    }
                },
                offline: {
                    $sum: {
                    $cond: [{ $eq: ["$isOnline", false] }, 1, 0]
                    }
                }
                }
            },
            {
                $project: {
                _id: 0,
                online: 1,
                offline: 1
                }
            }
            ]);

        if(!response || response.length<1){
            res.status(500).json({success: false, message:"No device found!"});
        }else{
            console.log("response: "+JSON.stringify(response));
            res.status(200).json({success: true, data: response});
        }

    }catch(error){
        console.log("An error occured retrieving Device! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }

    return res;
}

export const setDeviceAlertDate = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    const deviceDBID=req.body.deviceDBID;
    const id=req.body._id;
    const inputDate=req.body.inputDate;
    const fieldNumber=req.body.fieldNumber;

    if(!mongoose.Types.ObjectId.isValid(deviceDBID)){
        return res.status(200).json({success: false, message: "Invalid Device DB ID!"});
    }

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(200).json({success: false, message: "Authentication Failed!"});
    }

    if(!inputDate || !isDateValid(inputDate)){
        return res.status(200).json({success: false, message: "Invalid Alert Date!"});
    }

    if(typeof fieldNumber !== 'number' || fieldNumber<1||fieldNumber>2){
        return res.status(200).json({success: false, message: "Invalid field to set Alert Date!"});
    }

    try{

        const onRecordUser = await User.findById(id);
        if(!onRecordUser){
            return res.status(200).json({success: false, message: "Authentication Failed!"});
        }

        const onRecordDevice = await Device.findById(deviceDBID);
        if(!onRecordDevice){
            return res.status(200).json({success: false, message: "Invalid Device DB ID!"});
        }

        if(fieldNumber==1){
            onRecordDevice.field1CropAlertDate=new Date(inputDate);
        }else if(fieldNumber == 2){
            onRecordDevice.field2CropAlertDate=new Date(inputDate);
        }
        
        const updatedDevice = await Device.findByIdAndUpdate(deviceDBID, onRecordDevice, {runValidators: true, new: true});
        if(!updatedDevice || updatedDevice === undefined){
            console.log("Error updating field Alert Date...");
            return res.status(200).json({success: false, message: "An error occured while setting-up field Alert Date!"});
        }

        res.status(200).json({success: true, data: [updatedDevice]});

    }catch(error){
        console.error("Error in Setting-up Device Alert Date! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        
    }
    
    return res;
}
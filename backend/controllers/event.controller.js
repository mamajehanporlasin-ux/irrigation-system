import Device from "../models/device.model.js";
import Event from '../models/event.model.js';
import mongoose from "mongoose";


export const submitData = async(req, res)=>{
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
        const onRecordDevice = await Device.find({"deviceID": deviceID});
        if(!onRecordDevice){
            return res.status(200).json({success: false, message: "Device not found!"});
        }
        
        session.startTransaction();

        const newEvent = new Event();
        newEvent.device = onRecordDevice[0]._id;
        newEvent.eventDate = Date.now();
        newEvent.eventType = 'Data Submission';
        newEvent.temperature=temperature;
        newEvent.humidity=humidity;
        newEvent.reservoirLevel=reservoirLevel;
        newEvent.soilMoisture1=soilMoisture1;
        newEvent.soilMoisture2=soilMoisture2;
        newEvent.soilMoisture3=soilMoisture3;
        newEvent.waterLevel1=waterLevel1;
        newEvent.waterLevel2=waterLevel2;
        newEvent.waterLevel3=waterLevel3;

        await newEvent.save();

        await session.commitTransaction();
        res.status(200).json({success: true, message: "data submission successfully saved!"});
    }catch(error){
        await session.abortTransaction();
        console.error("Error in saving Data from device! - "+error.message);
        res.status(500).json({success: false, message:"Server Error"});
    }finally{
        await session.endSession();
    }
    
    return res;
}
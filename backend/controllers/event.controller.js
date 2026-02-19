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
    const waterLevel1=req.body.waterLevel1;
    const waterLevel2=req.body.waterLevel2;
    const waterLevel3=req.body.waterLevel3;
    
    var w1="LOW";
    var w2="LOW";
    var w3="LOW";

    if(!deviceID){
        return res.status(200).json({success: false, message: "Invalid Device ID!"});
    }

    if(!temperature){
        temperature=0;
    }

    if(!humidity){
        humidity=0;
    }

    if(!reservoirLevel || reservoirLevel < 4 ){
        reservoirLevel='LOW';
    }else if(reservoirLevel > 18){
        reservoirLevel="FULL";
    }else{
        reservoirLevel="OK";
    }

    if(waterLevel1==2){
        w1="FULL";
    }else if(waterLevel1==1){
        w1="OK";
    }else{
        w1="LOW";
    }

    if(waterLevel2==2){
        w2="FULL";
    }else if(waterLevel2==1){
        w2="OK";
    }else{
        w2="LOW";
    }

    if(waterLevel3==2){
        w3="FULL";
    }else if(waterLevel3==1){
        w3="OK";
    }else{
        w3="LOW";
    }

    const session = await mongoose.startSession();
    try{
        const onRecordDevice = await Device.find({"deviceID": deviceID});
        console.log("data: "+JSON.stringify(onRecordDevice));
        if(!onRecordDevice || onRecordDevice.length<1){
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
        newEvent.waterLevel1=w1;
        newEvent.waterLevel2=w2;
        newEvent.waterLevel3=w3;

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

export const getSensorReadingRecords = async(req, res) =>{
    if(!req.body){
        return res.status(400).json({success: false, message: "Invalid values!"});
    }

    
    const deviceID = req.body.deviceID;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const ownerID = req.body._id;

    const pipeline = [];

    const initialMatch = {};

    if (startDate || endDate) {
        initialMatch.eventDate = {}; 

        if (startDate) {
            const sDate = new Date(startDate);
            sDate.setHours(0, 0, 0, 0); 
            initialMatch.eventDate.$gte = sDate.getTime();
        }

        if (endDate) {
            const eDate = new Date(endDate);
            eDate.setHours(23, 59, 59, 999);
            initialMatch.eventDate.$lte = eDate.getTime();
        }
    }

    if (!mongoose.isValidObjectId(ownerID)) {
        return res.status(200).json({ success: false, message: "Authentication failed!" });
    }

    if (Object.keys(initialMatch).length > 0) {
        pipeline.push({ $match: initialMatch });
    }

    pipeline.push({
        $lookup: {
            from: "devices",
            let: { deviceId: "$device" },
            pipeline: [
            {
                $match: {
                $expr: { $eq: ["$_id", "$$deviceId"] }
                }
            },
            {
                $project: {
                _id: 1,
                deviceID: 1,
                owner: 1
                }
            }
            ],
            as: "device"
        }
        },
        {
        $addFields: {
            device: { $first: "$device" }
        }
    });

    const secondaryMatch = {};

    secondaryMatch["device.owner"] = new mongoose.Types.ObjectId(ownerID);

    if (deviceID && deviceID.trim() !== "" && deviceID !== "null") {
        secondaryMatch["device.deviceID"] = deviceID;
    }

    pipeline.push({ $match: secondaryMatch });

    try {
        const response = await Event.aggregate(pipeline);
        
        if (!response || response.length < 1) {
            return res.status(200).json({ success: false, message: "No Device Record found!" });
        }

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        console.error("Error in retrieving Device Records! - " + error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }

    return res;
}

/*
export const getTemperatureSummary = async(req, res) =>{
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const ownerID = req.body._id;

    if (!mongoose.isValidObjectId(ownerID)) {
        return res.status(200).json({ success: false, message: "Authentication failed!" });
    }

    try{
        const response = await Event.aggregate([
            {
                $lookup: {
                    from: "devices",
                    let: { deviceId: "$device" },
                    pipeline: [
                    {
                        $match: {
                        $expr: { $eq: ["$_id", "$$deviceId"] }
                        }
                    },
                    {
                        $project: {
                        _id: 1,
                        deviceID: 1,
                        owner: 1
                        }
                    }
                    ],
                    as: "device"
                }
                },
                {
                $addFields: {
                    device: { $first: "$device" }
                }
            },{
                $match: {
                    eventDate: { $gte: sevenDaysAgo }
                }
            },{
                $sort: { eventDate: 1 }
            },{
                $group: {
                _id: "$device",
                temperatures: {
                    $push: {
                    date: "$eventDate",
                    value: "$temperature"
                    }
                }
                }
            },{
                $project: {
                _id: 0,
                device: "$_id",
                temperatures: 1
                }
            },{
                $match: {
                    "device.owner": new mongoose.Types.ObjectId(ownerID)
                }
            }
        ]);

        if (!response || response.length < 1) {
            return res.status(200).json({ success: false, message: "No temperature record found from the last 7 days!" });
        }

        res.status(200).json({ success: true, data: response });
    }catch(error){
        console.log("Error in retrieving the temperature summary from 7 days ago! - "+error.message);
        res.status(200).json({success: false, message: "Server Error!"});
    }

    return res;
}*/

export const getTemperatureSummary = async (req, res) => {
  const ownerID = req.body._id;
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (!mongoose.isValidObjectId(ownerID)) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed!"
    });
  }

  try {
    const response = await Event.aggregate([
      {
        $addFields: {
          eventDateObj: { $toDate: "$eventDate" }
        }
      },{
        $match: {
          eventDateObj: { $gte: twentyFourHoursAgo }
        }
      },{
        $lookup: {
          from: "devices",
          localField: "device",
          foreignField: "_id",
          as: "device"
        }
      },
      { $unwind: "$device" },{
        $match: {
          "device.owner": new mongoose.Types.ObjectId(ownerID)
        }
      },{
        $group: {
          _id: {
            device: "$device._id",
            hour: {
              $dateTrunc: {
                date: "$eventDateObj",
                unit: "hour"
              }
            }
          },
          avgTemp: { $avg: "$temperature" },
          device: { $first: "$device" }
        }
      },{
        $densify: {
          field: "_id.hour",
          range: {
            step: 1,
            unit: "hour",
            bounds: [twentyFourHoursAgo, now]
          }
        }
      },{
        $fill: {
          output: {
            avgTemp: { value: 0 }
          }
        }
      },{
        $group: {
          _id: "$_id.device",
          device: { $first: "$device" },
          temperatures: {
            $push: {
              hour: {
                $dateToString: { format: "%H", date: "$_id.hour" }
              },
              value: { $round: ["$avgTemp", 2] }
            }
          }
        }
      },{
        $project: {
          _id: 0,
          device: {
            _id: "$device._id",
            deviceID: "$device.deviceID"
          },
          temperatures: 1
        }
      }
    ]);

    return res.status(200).json({ success: true, data: response });

  } catch (error) {
    console.error("Hourly temperature aggregation error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server Error!"
    });
  }
};
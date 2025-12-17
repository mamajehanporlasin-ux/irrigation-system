import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    deviceID:{
        type: String,
        required: true
    },
    isOnline:{
        type: Boolean,
        default: false
    },
    lastUpdate:{
        type: Number,
        required: true,
        default: 0
    },
    temperature:{
        type: Number,
        required: true,
        default: 0
    },
    humidity:{
        type: Number,
        required: true,
        default: 0
    },
    reservoirLevel:{
        type: String,
        required: true,
        default: "OK"
    },
    soilMoisture1:{
        type: Number,
        required: true,
        default: 0
    },
    soilMoisture2:{
        type: Number,
        required: true,
        default: 0
    },
    soilMoisture3:{
        type: Number,
        required: true,
        default: 0
    },
    isWaterLevelLow1:{
        type: Boolean,
        required: true,
        default: false
    },
    isWaterLevelLow2:{
        type: Boolean,
        required: true,
        default: false
    },
    isWaterLevelLow3:{
        type: Boolean,
        required: true,
        default: false
    }
});

const Device = mongoose.model('Device', DeviceSchema);

export default Device;
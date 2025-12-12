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
    tankLevel:{
        type: Number,
        required: true,
        default: 0
    },
    humidity:{
        type: Number,
        required: true,
        default: 0
    },
    temperature:{
        type: Number,
        required: true,
        default: 0
    },
    soilMoisture:{
        type: Number,
        required: true,
        default: 0
    },
    isRaining:{
        type: Boolean,
        required: true,
        default: false
    }
});

const Device = mongoose.model('Device', DeviceSchema);

export default Device;
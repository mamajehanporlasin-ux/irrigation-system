import mongoose from 'mongoose';

const NO_ALERT = -1;

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
    owner:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
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
    waterLevel1:{
        type: Number,
        required: true,
        default: 0
    },
    waterLevel2:{
        type: Number,
        required: true,
        default: 0
    },
    isRaining:{
        type: Number,
        require: false,
        default: 0
    },
    soilMoist1:{
        type: Number,
        require: false,
        default: 0
    },
    soilMoist2:{
        type: Number,
        require: false,
        default: 0
    },
    soilMoist3:{
        type: Number,
        require: false,
        default: 0
    },
    soilMoist4:{
        type: Number,
        require: false,
        default: 0
    },
    soilMoist5:{
        type: Number,
        require: false,
        default: 0
    },
    soilMoist6:{
        type: Number,
        require: false,
        default: 0
    },
    pump1:{
        type: Number,
        require: false,
        default: 0
    },
    pump2:{
        type: Number,
        require: false,
        default: 0
    },
    pump3:{
        type: Number,
        require: false,
        default: 0
    },
    pump4:{
        type: Number,
        require: false,
        default: 0
    },
    pump5:{
        type: Number,
        require: false,
        default: 0
    },
    pump6:{
        type: Number,
        require: false,
        default: 0
    },
    field1CropAlertDate:{
        type: Number,
        require: false,
        default: NO_ALERT
    },
    field2CropAlertDate:{
        type: Number,
        require: false,
        default: NO_ALERT
    }
});

const Device = mongoose.model('Device', DeviceSchema);

export default Device;
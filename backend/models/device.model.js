import mongoose from 'mongoose';

const reservoirLevels = ['OK', 'LOW', 'FULL'];
const waterLevels = ['OK', 'LOW', 'FULL'];
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
    reservoirLevel:{
        type: String,
        enum: reservoirLevels,
        required: true,
        default: "OK"
    },
    waterLevel1:{
        type: String,
        required: true,
        enum: waterLevels,
        default: 'OK'
    },
    waterLevel2:{
        type: String,
        required: true,
        enum: waterLevels,
        default: 'OK'
    },
    waterLevel3:{
        type: String,
        required: true,
        enum: waterLevels,
        default: 'OK'
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
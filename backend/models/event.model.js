import mongoose from 'mongoose';

const types = ['Irrigation Activation', 'Data Submission', 'Seedling Sow', 'Seedling Ready'];
const reservoirLevels = ['OK', 'LOW', 'FULL'];
const waterLevels = ['OK', 'LOW', 'FULL']

const EventSchema = new mongoose.Schema({
    device:{
        type: mongoose.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    eventDate:{
        type: Number,
        required: true,
        default: Date.now()
    },
    eventType:{
        type: String,
        enum: types,
        required: true,
        default: 'Data Submission'
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
    soilMoisture1:{
        type: Boolean,
        default: true
    },
    soilMoisture2:{
        type: Boolean,
        default: true
    },
    soilMoisture3:{
        type: Boolean,
        default: true
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
    }
});

const Event=mongoose.model('Event', EventSchema);

export default Event;
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
});

const Event=mongoose.model('Event', EventSchema);

export default Event;
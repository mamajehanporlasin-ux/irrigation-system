import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    password:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    firstName:{
        type: String,
        required: true
    },
    middleName:{
        type: String,
        required: true
    },
    contactNumber:{
        type: String,
        required: true
    },
    emailAddress:{
        type: String,
        required: true,
        unique: true
    },
    addressDetail:{
        type: String,
        required: false
    },
    regCode:{
        type: Number,
        required: true
    },
    provCode:{
        type: Number,
        required: true
    },
    citymunCode:{
        type: Number,
        required: true
    },
    brgyCode:{
        type: Number,
        required: true
    },
    resetOTP:{
        type: String,
        default: ""
    },
    resetOTPExpire:{
        type: Number,
        default: 0
    }
});

const User=mongoose.model('User', UserSchema);

export default User;
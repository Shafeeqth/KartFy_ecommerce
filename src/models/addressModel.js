const mongoose = require('mongoose');


const addressSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

    }, type: {
        type: String,
        required: true,
        enum: ['Home', "Work"],


    }, phone: {
        type: String,
        required: true,

    }, alternatePhone: {
        type: String,

    }, name: {
        type: String,
        required: true,

    }, street: {
        type: String,
        required: true,

    }, pincode: {
        type: String,
        required: true,

    }, locality: {
        type: String,
        required: true,

    }, state: {
        type: String,

    }, district: {
        type: String,

    }

},
    {
        timestamps: true
    });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
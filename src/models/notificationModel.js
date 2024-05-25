
const mongoose = require('mongoose');


const notificationSchema = mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'error', 'success', 'message', 'alert'],
        required: true,

    },
    title: {
        type: String,
        required: true

    },
    message: {
        type: String,
        required: true

    },
    read: {
        type: Boolean,
        default: false

    },
    url: {
        type: String,
        required: true
    },
    image: {
        type: String,
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Notification', notificationSchema)
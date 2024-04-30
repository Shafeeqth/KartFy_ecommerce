const mongoose = require('mongoose');


const returnShcema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    oreder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,

    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,

    },
    reason: {
        type: String,
        required: true

    },
    comment: {
        type: String,
        required: false

    }
},
{
    timestamps: true
})

const Return = mongoose.model('Return', returnShcema)
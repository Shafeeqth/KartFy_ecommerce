const mongoose = require('mongoose');


const returnShcema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        
        ref: 'Order',
        required: true,

    },
    orderedItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order.orderedItems',
        required: true,

    },
    reason: {
        type: String,
        required: true

    },
    comments: {
        type: String,
        required: false

    }
},
{
    timestamps: true
})

module.exports = mongoose.model('Return', returnShcema)
const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    offerName: {
        type: String,
        required: true,

    }, offerExpire: {
        type: Date,
        required: true,

    }, discount: {
        type: String,
        required: true,

    }, isListed: {
        type: Boolean,

    }, minConst: {
        type: Number,

    },

});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
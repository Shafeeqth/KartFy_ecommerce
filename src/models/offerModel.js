const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,

    },description: {
        type: String,
        required: true

    },
     expiryDate: {
        type: Date,
        required: true,

    }, discount: {
        type: String,
        required: true,

    }, isListed: {
        type: Boolean,

    },appliedCategory: {
        type: Array,
    }

});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
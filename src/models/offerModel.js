const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,

    },description: {
        type: String,
        required: true

    },
     endDate: {
        type: Date,
        required: true,

    }, discount: {
        type: Number,
        required: true,

    }, isListed: {
        type: Boolean,
        default: true

    },appliedCategory: {
        type: Array,
    },
    productIds:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }],

},
{
    timestamps: true
}
);

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
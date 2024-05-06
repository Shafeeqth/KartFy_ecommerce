const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,

    },description: {
        type: String,
        required: true

    },url: {
        type: String,
        required: true,

    },image: {
        type: String,
        required: true,

    }, isListed: {
        type: Boolean,
        default: true

    },
    

},
{
    timestamps: true
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
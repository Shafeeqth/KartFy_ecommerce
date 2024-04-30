const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,

    }, description: {
        type: String,

    }, isListed: {
        type: Boolean,
        default: true,
    }, appliedOffer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',

    },
    subCategories:[{
        title:{
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String,
            required: true,

        }
    }]

}, {

    timestamps: true
}
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
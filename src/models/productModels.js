const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    } 
    ,category: {
        type: Array
    },
     mrpPrice: {
        type: Number,
        required: true,
    },price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
    }, color: {
        type: String,

    }, images: {
        type: Array,
        validate: [arrayLimit, 'must be four images']
    },
     isListed: {
        type: Boolean,
        default: true,
    }
    

},
{
    timestamps: true
});
function arrayLimit(val) {
    return val.length >= 4

}

const Product = mongoose.model('Product', productSchema);

const inventorySchema = mongoose.Schema({
    product: {
        type:mongoose.Types.ObjectId,
        ref: 'Product',

        required: true,
    },sizeVariant: [{
        size: {
            type: String,
            required: true,
        },stock: {
            type: Number,
            default: 0,
            min: 0,

        }
    }],
    
},
{
    timestamps: true
});


const Inventory = mongoose.model('Inventory', inventorySchema);


module.exports = {
    Product,
    Inventory,
    
}
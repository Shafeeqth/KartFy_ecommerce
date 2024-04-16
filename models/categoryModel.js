const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Offer',    

    },name:{
        type:String,
        required:true,
        
    },description: {
        type: String,
      
    },

});

module.exports = mongoose.model('Category', categorySchema);


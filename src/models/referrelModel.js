const mongoose = require('mongoose');

const referrelSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },code: {
        type: String,
        unique: true,
        required: true,

    }
    

},
{
    timestamps: true
});

const Referrel = mongoose.model('Referrel', referrelSchema);

module.exports = Referrel;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    screen_name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('User', userSchema)
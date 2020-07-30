const mongoose = require("mongoose")

const Signup = mongoose.model('signup',{
    username: {
        type: String,
        unique: true,
        require: true
    },

    password: {
        type: String,
        require: true
    },

    type: {
        type: String,
        require: true
    }
})

module.exports = Signup
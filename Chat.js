const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    users:[String],
    messages:[String],
})

module.exports = mongoose.model("Chat" , chatSchema)
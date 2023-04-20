const mongoose = require('mongoose');

const fileUploads = new mongoose.Schema({
    fileType: {
        type: String,
        required: true
    },
    requireAuth: {
        type: Boolean,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true
    }
},{ timestamps: true });

module.exports = mongoose.model('fileUploads', fileUploads)
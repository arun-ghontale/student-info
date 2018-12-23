const mongoose = require('mongoose');


//---------------------====================NEED TO ADD LATEST TIME IN THE SCHEMA AS WELL.=================-----------------
const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    student_id: String,
    student_name: String,
    email_id: String,
    classroom_name: String,
    assignmentAttempted: {
        default: 0,
        type: Number
    },
    assignmentCompleted: {
        default: 0,
        type: Number
    },
    Placed: {
        default: "no",
        type: String
    }
}, {
    timestamps: true
});

// Convention is uppercase for the model name
module.exports = mongoose.model('Student', studentSchema);
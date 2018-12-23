const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

//---------------------====================NEED TO ADD LATEST TIME IN THE SCHEMA AS WELL.=================-----------------

//the score should be 0 by default for old planets
const assignmentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    assignment_name: String,
    student_id: String,
    student_name: String,
    resub_count: Number,
    latest_submission_time: {
        type: Date
    },
    first_submission_time: {
        type: Date
    },
    latest_active_time: {
        type: Date
    },
    done_status: Number,
    doc_score: {
        type: Number,
        default: 0
    },
    read_score: {
        type: Number,
        default: 0
    },
    auc_score: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Convention is uppercase for the model name
module.exports = mongoose.model('assignment', assignmentSchema);
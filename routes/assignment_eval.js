const AssignmentEval = require('../api/models/assignment_eval');
const Student = require('../api/models/student');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

const assignments = {
    "HAB": "Haberman",
    "TSNE": "TSNE",
    "KNN": "KNN",
    "NB": "Naive Bayes",
    "LR": "Logistic Regression",
    "SGD": "Stochastic Gradient Descent",
    "SVM": "Support Vector Machines",
    "DT": "Decision Trees",
    "RF": "Random Forest",
    "KMEAN": "Clustering",
    "SVD": "SVD",
    "MLP": "MLP MNIST",
    "CNN": "CNN MNIST",
    "LSTM": "LSTM Sentiment Analysis",
    "CANCER": "Cancer Case Study",
    "TAXI": "New York Taxi Prediction Case Study",
    "MLWARE": "Microsoft Malaware Case Study",
    "NETFLIX": "Netflix Recommendation Case Study",
    "STACK": "Stack Overflow Case Study",
    "QUORA": "Quora Question Pair Case Study",
    "HumanAR": "Human Activity Recognition Case Study",
    "AIRBNB": "Airbnb Recommendation Case Study",
    "FAECBOOK": "Facebook Friend Recommendation Case Study",
    "CharRNN": "Music Generation Case Study",
    "AD-CLK": "Ad Click Case Study",
    "SELF-DRIVING": "Self Driving Car Case Study",
    "CS1": "Student Case Study 1",
    "CS2": "Student Case Study 2",
    "BLG1": "Student Blog 1",
    "BLG2": "Student Blog 2",
    "OA1": "Optional Assingment 1",
    "OA2": "Optional Assignment 2"
}

//POST to add a document to the DB
router.post('/', (req, res, next) => {
    assignEvalObj = {
        assignment_name: req.body.assignment_name.trim(),
        student_id: req.body.student_id.trim(),
        student_name: req.body.student_name.trim(),
        resub_count: parseInt(req.body.resub_count),
        latest_submission_time: new Date(req.body.latest_submission_time),
        first_submission_time: new Date(req.body.first_submission_time),
        latest_active_time: new Date(req.body.latest_active_time),
        done_status: parseInt(req.body.done_status),
        doc_score: parseInt(req.body.doc_score),
        read_score: parseInt(req.body.read_score),
        auc_score: parseInt(req.body.auc_score),
    };

    //find a student based on student_id and assignment_name, update that document if it exists
    let searchBySpecific = new Object();
    searchBySpecific.assignment_name = assignEvalObj.assignment_name
    searchBySpecific.student_id = assignEvalObj.student_id


    let query = searchBySpecific,
        update = assignEvalObj

    AssignmentEval.findOne(query, function (err, obj) {
        if (err) {
            return res.status(500).json({
                error: err
            })
        } else if (!(obj)) {
            let saveAssignEvalObj = assignEvalObj
            saveAssignEvalObj._id = mongoose.Types.ObjectId();
            saveAssignEvalObj = new AssignmentEval(saveAssignEvalObj)

            saveAssignEvalObj.save(function (err) {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                }
                return res.status(200).json(saveAssignEvalObj);
            })
        } else {
            AssignmentEval.findByIdAndUpdate(obj._id, {
                $set: update
            }, {
                new: true
            }, function (err, objupdate) {
                if (err) {
                    return res.status(500).json({
                        error: err
                    })
                }
                return res.status(200).json({
                    "update": objupdate
                })
            });
        }
    });
});

//find by ID
router.get('/:id', (req, res, next) => {

    AssignmentEval.find({
        student_id: req.params.id
    }, (err, assignObj) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        }
        let assignmentObjTotal = [];
        let assignmentAttempted = new Set();
        let studentName = ""

        assignObj.forEach(function (everyAssignment) {
            assignmentObjTotal.push(everyAssignment)
            assignmentAttempted.add(everyAssignment.assignment_name)
            studentName = everyAssignment.student_name
        })

        Object.keys(assignments).forEach(function (key) {
            if (!(assignmentAttempted.has(key))) {
                assignmentObjTotal.push(assignObjTemplate = {
                    "doc_score": 0,
                    "read_score": 0,
                    "auc_score": 0,
                    "_id": "",
                    "assignment_name": assignments[key],
                    "student_id": req.params.id,
                    "student_name": studentName,
                    "resub_count": "NA",
                    "latest_submission_time": "NA",
                    "first_submission_time": "NA",
                    "latest_active_time": "NA",
                    "done_status": 0,
                    "createdAt": "",
                    "updatedAt": "",
                    "__v": 0
                })
            }

        });
        console.log(assignmentObjTotal.length)
        return res.status(200).json(assignmentObjTotal);
    });
})

//find by ID
router.get('/counts/:id', (req, res, next) => {

    console.log("counts", req.params.id)

    AssignmentEval.find({
        student_id: req.params.id
    }, (err, assignObj) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        }
        let completed = 0;

        assignObj.forEach(function (everyAssignment) {
            if (everyAssignment.done_status == 1) {
                completed += 1
            }
        })

        console.log("counts", completed)
        return res.status(200).json({
            assignmentAttempted: assignObj.length,
            assignmentCompleted: completed
        });
    });
})

module.exports = router;
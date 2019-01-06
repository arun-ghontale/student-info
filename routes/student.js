const Student = require('../api/models/student');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const docLIMIT = 50

//POST to add a document to the DB
router.post('/create', (req, res, next) => {

    studentObj = {
        student_id: req.body.student_id.trim(),
        student_name: req.body.student_name.trim(),
        email_id: req.body.email_id.trim(),
        classroom_name: req.body.classroom_name.trim(),
        assignmentAttempted: req.body.assignmentAttempted ? req.body.assignmentAttempted : 0,
        assignmentCompleted: req.body.assignmentCompleted ? req.body.assignmentCompleted : 0,
        Placed: req.body.Placed,
    };

    Student.findOne({
            student_id: studentObj.student_id,
            student_name: studentObj.student_name,
            email_id: studentObj.email_id,
            classroom_name: studentObj.classroom_name,
        })
        .exec()
        .then(result => {
            console.log(result)
            if (!result) {
                console.log("result not found");
                //If the document is not already present then create the document and save it in the database
                studentObj._id = new mongoose.Types.ObjectId()
                const student = new Student(studentObj);

                student
                    .save()
                    .then(result => {
                        console.log(result);
                        res.status(201).json({
                            message: 'Handling POST requests to /student',
                            createdStudent: result
                        });
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            message: 'Error while updating the database',
                            Error: err
                        });
                    });
            } else {
                Student.findByIdAndUpdate(result._id, {
                    $set: studentObj
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
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })

});

//search for documents based on emalID and student name -> regexp based match
router.post('/', (req, res, next) => {

    let query = req.body.query.trim().split(" ");
    let page = Math.max(0, req.param('page') - 1)

    console.log(query, page)

    Student.find({
            $or: [{
                    email_id: {
                        $regex: req.body.query.trim(),
                        $options: 'i'
                    }
                },
                {
                    student_name: {
                        $regex: query.join(".*"),
                        $options: 'i'
                    }
                }
            ]
        }, null, {
            limit: docLIMIT,
            skip: docLIMIT * page,
            sort: {
                assignmentAttempted: -1, //DESCENDING order
                assignmentCompleted: -1 //DESCENDING order
            }
        },
        function (err, students) {
            if (err) {
                res.status(500).json(err);
            }
            Student.find({
                $or: [{
                        email_id: {
                            $regex: req.body.query.trim(),
                            $options: 'i'
                        }
                    },
                    {
                        student_name: {
                            $regex: query.join(".*"),
                            $options: 'i'
                        }
                    }
                ]
            }).count(function (err, count) {
                console.log("Number of docs: ", count);
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(201).json({
                        docs: students,
                        ndocs: count,
                        pg: page+1
                    });
                }
            });
        });
});

router.get('/:id', (req, res, next) => {

    Student.find({
        student_id: req.params.id
    }, (err, studentObj) => {
        if (err) {
            return res.status(500).json({
                error: err
            });
        }
        return res.status(201).json(studentObj);
    })
});

module.exports = router;

const Student = require('../api/models/student');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const sendMail = require('../send_student_report')
const emailDetails = require('../details.js')
//POST to send mail
router.post('/', (req, res, next) => {
    const io = req.app.get('socketio');

    sendMail({
        from: emailDetails.EMAIL,
        pass: emailDetails.PASSWORD,
        to: String(req.body.to),
        subject: 'Candidate Progress Report : Applied AI Course',
        text: req.body.text,
        resObj: res,
        ioObj: io
    })
})

module.exports = router;

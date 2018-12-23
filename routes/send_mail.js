const Student = require('../api/models/student');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const sendMail = require('../send_student_report')

//POST to send mail
router.post('/', (req, res, next) => {
    const io = req.app.get('socketio');

    sendMail({
        from: '',
        pass: '',
        to: String(req.body.to),
        subject: 'Student Report',
        text: req.body.text,
        resObj: res,
        ioObj: io
    })
})

module.exports = router;
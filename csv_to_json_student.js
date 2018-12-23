const path = require("path");
const csv = require("csvtojson");
// const request = require('request');
const syncRequest = require("sync-request");
const sendMail = require("./send_mail");
const moment = require("moment");

const scanFilesDir = "STUDENT_DETAILS";
let responseStatus = 0;
let totalDocs = 0;

const user_args = {};
process.argv.slice(2).map(each => {
    user_args[each.split("=").slice(0)[0]] = each.split("=").slice(1)[0];
});


const csvFilePath = path.join(__dirname, scanFilesDir, user_args.file);
console.log(csvFilePath);

csv()
    .fromFile(csvFilePath)
    .then(jsonObjList => {
        // console.log(jsonObjList);
        logStatus = "";
        jsonObjList.forEach(jsonObj => {

            let res_get = syncRequest("GET", `http://206.189.140.119:3000/assignment/counts/${String(jsonObj["Links"].split("/").slice(-2)[0])}`);
            var response_get = JSON.parse(res_get.getBody("utf8"));

            if (response_get.assignmentAttempted) {
                console.log(response_get.assignmentAttempted)
                console.log(response_get.assignmentCompleted)
            }
            // console.log(res)
            let data = {
                student_name: jsonObj["Full Name"],
                email_id: jsonObj["Email Address"],
                student_id: jsonObj["Links"].split("/").slice(-2)[0],
                classroom_name: jsonObj["Classroom Name"],
                assignmentAttempted: response_get.assignmentAttempted ? response_get.assignmentAttempted : 0,
                assignmentCompleted: response_get.assignmentCompleted ? response_get.assignmentCompleted : 0
            };
            //sync request
            let res_post = syncRequest("POST", "http://206.189.140.119:3000/student/create", {
                json: data
            });
            var response = JSON.parse(res_post.getBody("utf8"));
            if (!("Error" in response)) {
                responseStatus += 1;
            } else {
                logStatus +=
                    ` Student name: ${data.student_name}, Error: ${response.Error}` +
                    "\n";
            }
            console.log(responseStatus)
            totalDocs += 1;
        });
        sendMail({
            subject: `Student Information database update: ${moment().format(
        "MMMM Do YYYY, h:mm:ss a"
      )}`,
            text: `${responseStatus} documents successfully added to the database out of ${totalDocs} documents`,
            logStatus: logStatus
        });
    });
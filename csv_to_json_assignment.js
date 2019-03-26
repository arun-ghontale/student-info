const path = require("path");
const csv = require("csvtojson");
// const request = require('request');
const syncRequest = require("sync-request");
const sendMail = require("./send_mail");
const moment = require("moment");

const scanFilesDir = "ASSIGNMENT_DETAILS";
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
      let data = {
        assignment_name: jsonObj["assignment Name"],
        student_id: jsonObj["Student ID"],
        student_name: jsonObj["student name"],
        resub_count: parseInt(jsonObj["resub_count"]),
        latest_submission_time: jsonObj["Latest submission Time"],
        first_submission_time: jsonObj["First submission Time"],
        latest_active_time: jsonObj["Latest active Time"],
        done_status: parseInt(jsonObj["Done status"]),
        doc_score: 0,
        read_score: 0,
        auc_score: 0,
      };
      console.log(data);
      //sync request
      var res = syncRequest("POST", "http://206.189.140.119:3000/assignment", {
        json: data
      });
      var response = JSON.parse(res.getBody("utf8"));
      if (!("Error" in response) & !("update in response")) {
        responseStatus += 1;
      } else if ("Error" in response) {
        logStatus +=
          ` Student name: ${data.student_name}, Error: ${response.Error}` +
          "\n";
      } else if ("update" in response) {
        logStatus +=
          ` Student name: ${data.student_name}, updates: ${response.update}` +
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

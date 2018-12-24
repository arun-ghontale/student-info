var student; // object that stores all the students information.

function getDateString(date){
    if(date == "NA"){
        return "NA"
    }else{
        // convert the string to human readable format.
        date = new Date(date.substring(0, date.length - 1))
        return date.toDateString();
    }
}

function timeSince(date) {
    if(date == "NA"){
        return "NA"
    }
    // convert the string to human readable format.
    date = new Date(date.substring(0, date.length - 1))

    let seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    
    if (interval > 1) {
        return  interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return  interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return  interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return  interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return  interval + " minutes ago";
    }
    
    return  Math.floor(seconds) + " seconds ago"
}  

$(document).ready(function(){
    stud_id = window.location.hash.substr(1);
    // get the htmlcode of the row.
    
    const ass_row_html = $("#ass_row_template").html();
    const ass_row_template = Handlebars.compile(ass_row_html);


    console.log(stud_id);

    
    // get the student basic details and fill them up.
    $.get("http://206.189.140.119:3000/student/"+stud_id, function(data){
        if(data[0] == undefined){
            console.log("Student Id seems wrong");
        }else{
            student = data[0];
            // console.log(student);            
            $("tr[prop=name] td").last().html(student.student_name);
            $("tr[prop=email] td").last().html(student.email_id);
            $("tr[prop=classroom] td").last().html(student.classroom_name);
            const ass_string = student.assignmentCompleted +'/'+ student.assignmentAttempted;
            $("tr[prop=ass_count] td").last().html(ass_string);
        }
    });
    
    // get the list of assignments of a 
    $.get("http://206.189.140.119:3000/assignment/"+stud_id, function(assignments){
        // console.log(assignments);
        assignments.forEach((assignment, index) => {
            assignment['s_no'] = index+1;
            // console.log(ass_row_template(assignment));
            
            // console.log(getDateString(assignment.latest_active_time));

            assignment.first_submission_time = getDateString(assignment.first_submission_time)
            assignment.latest_submission_time = getDateString(assignment.latest_submission_time)
            assignment.latest_active_time = timeSince(assignment.latest_active_time)
            
            $("#assignment_list").append(ass_row_template(assignment));
        });
    });


    // Send the details to 
    $("#send-email").click(function(){
        // get the value from text area
        const custom_msg = $("#custom-mail").val();
        
        // localhost:3000/mail/ 
        // {
        //     "to": "arun.g.ghontale@gmail.com",
        //     "text": "test message"
        // }
        let mail_body = student.student_name + "<br/><br/>"
                        +"Assignemnts Submitted : "+student.assignmentAttempted+"<br/><br/>"
                        +"Assignments Completed : "+student.assignmentCompleted+"<br/><br/>"
                        +"Google Classroom Name : "+student.classroom_name+"<br/><br/>";

        // console.log(mail_body + custom_msg + "");
        const to_and_body = {"to" : student.email_id,
                        "text" : mail_body + "<br/><br/>" + custom_msg + "<br/><br/>" + $(".striped").html() + "\n\n"}

        // M.toast({"html" : "Mail to ramanareddysane@gmail.com is Successful", classes: 'rounded'});

        $.post("http://localhost:3000/mail/",to_and_body)
        .done(function(data) {
        //   console.log("success : ", data);
        })
        .fail(function(error) {
          console.log("failed", error);
        })
        .always(function() {
          // console.log("Always");
        });
    });
    
});

// socket on successfully sending the mail..
var socket = io();


socket.on('mailStatus', (msg) => {

    // console.log("here", msg)
    M.toast({"html" : msg.status, classes: 'rounded'});
    // alert(msg.status)
})



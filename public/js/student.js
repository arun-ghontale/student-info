var s;
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
            const student = data[0];
            // console.log(student);
            s = student;
            
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
            console.log(ass_row_template(assignment));
            $("#assignment_list").append(ass_row_template(assignment));
        });
    });
    
});
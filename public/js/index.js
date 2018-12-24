$(window).on("beforeunload", function () {
    $.get("http://206.189.140.119:3000/sessions/logout",
        function (data) {
            console.log("Data: " + data);
        });
    // return confirm("Do you really want to close?");
})



jQuery('#date-select').on('submit', function (e) {
    e.preventDefault();
    let date = jQuery('[name=evalDate]').val()
    $.post("http://206.189.140.119:3000/scan/submissions", {
            "start_year": 2018,
            "start_month": 11,
            "start_day": 25,
            "end_year": 2018,
            "end_month": 11,
            "end_day": 25,
        },
        function (data, status) {
            console.log("Data: " + data + "\nStatus: " + status);
        });

})



// =================== Added by Ramana =====================
var queryString = "";

$(document).ready(function() {

  // ==================************* get all the students list by making empty search *************==================  
  $(".results-header").show()
  
  // compile the template for displaying the results. 
  var source   = document.getElementById("search-result-template").innerHTML;
  var resultstemplate = Handlebars.compile(source);


  // get all the student details on empty search.
  $.post("http://206.189.140.119:3000/student/", { query: " ", page : '1' })
        .done(function(data) {
          // console.log("success", data);
          // updateSearchResults(data);
          console.log(data);
          show_search_header = false;
          updateSearchResults(data.docs, show_search_header)
          
        })
        .fail(function(error) {
          console.log("failed", error);
        })
        .always(function() {
          // console.log("Always");
    });


  
  // get the student details on search
  $("#search-form").submit(function(event) {    
    event.preventDefault();
    // get the text
    queryString = "vya"
    queryString = $("#student-search-query").val();

    if (queryString.trim() != "") {
      $.post("http://206.189.140.119:3000/student/", { query: queryString, page : '1' })
        .done(function(data) {
          // console.log("success", data);
          // updateSearchResults(data);
          console.log(data);
          updateSearchResults(data.docs, true)
          
        })
        .fail(function(error) {
          console.log("failed", error);
        })
        .always(function() {
          // console.log("Always");
        });
    }
  }); // on submit the search query

  $("#search-form").submit()

  function updateSearchResults(data, show_search_header){
    // show the table

    $('table').show()

    // clear all the rows
    $("#search-results-rows").html("");
    // alert(show_search_header)
    $("tabe thead").show()
    // set the results length
    if(show_search_header){
      $(".results-header").html("<h4> "+ data.length +
      " results found for <i>\""+ queryString +"\"</i></h4>");
    }

    // console.log(data);
    data.forEach((element, index) => {
      // console.log(element, index)
      element["sno"] = index+1;
      // console.log(resultstemplate(element))
      $("#search-results-rows").append(resultstemplate(element));
    });
  }
  
});
// function to send the get request to get all the student values.
function getStudInfo(){
  stud_id = $(this).parent().parent().attr("id")
  console.log(stud_id);
  window.open("student.html#"+stud_id, '_blank')
  
}
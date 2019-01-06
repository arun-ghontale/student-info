$(window).on("beforeunload", function () {
    $.get("http://206.189.140.119:3000/sessions/logout",
        function (data) {
            console.log("Data: " + data);
        });
    // return confirm("Do you really want to close?");
})

var d;
var query_results = {
  queryString : " ",
  cur_page : 0,
  tot_pages: 0,
  tot_records: 0
}
// =================== Added by Ramana =====================
var queryString = "";

$(document).ready(function() {

  // ==================************* get all the students list by making empty search *************==================  
  // $(".results-header").show()
  $(".pagination-header").hide()
  $(".pagination-header").show()
  $('.tooltipped').tooltip(); // initialize the tooltip.

  // compile the template for displaying the results. 
  var source   = document.getElementById("search-result-template").innerHTML;
  var resultstemplate = Handlebars.compile(source);

  getRecordsForPage(query_results.cur_page + 1);

  
  // get the student details on search
  $("#search-form").submit(function(event) {
    event.preventDefault();
    // get the text
    query_string = "vya"
    query_string = $("#student-search-query").val();

    // reset the current_page
    query_results.cur_page = 0;

    if (query_string.trim() != "") {
      // update the queryString
      query_results.queryString = query_string;
      // query the first page with  
      getRecordsForPage(query_results.cur_page + 1)

    }
  }); // on submit the search query

  // Just to get the all the rows, do this.
  $("#search-form").submit()





  // ***************************************************************************
  // *************** Functions to get the results of a page ********************
  // ***************************************************************************
  function getRecordsForPage(page_number){
    console.log("getting results");
    
    const query_string = query_results.queryString
    const cur_page = query_results.cur_page;

    $.post("http://206.189.140.119:3000/student/", { query: query_string, page : page_number })
    .done(function(data) {
      // console.log(data);
      updateSearchResults(data, true)
      
    })
    .fail(function(error) {
      console.log("failed", error);
    })
    .always(function() {
      // console.log("Always");
    });
    
  }



  // ***************************************************************************
  // ****************** Functions to send prev and next page ********************
  // ***************************************************************************
  $(".next-page").click(function() {
    getRecordsForPage(query_results.cur_page + 1);
  });

  $(".prev-page").click(function(){
    getRecordsForPage(query_results.cur_page-1);
  });



  // ***************************************************************************
  // ******************** update the table for search query ********************
  // ***************************************************************************
  function updateSearchResults(data, show_search_header){

    // update the cur_page of the object
    query_results.cur_page = data.pg

    // enable the next and prev-page buttons
    $(".prev-page").attr("disabled", false); 
    $(".next-page").attr("disabled", false);

    // show the table
    $('table').show()
    d = data
    
    // current page
    query_results.cur_page = data.pg;

    if(query_results.cur_page == 1){
      // disable the prev-page button
      $(".prev-page").attr("disabled", true); 
    }

    // total pages
    query_results.tot_pages = Math.ceil(data.ndocs / 50);
    //  if it is last page, then disable the next-page button.
    if(query_results.tot_pages == query_results.cur_page){
      $(".next-page").attr("disabled", true);
    }
    
    // total_docs
    query_results.tot_records = data.ndocs;

    console.log("asdf", query_results);
    
    $(".current-page").html(query_results.cur_page);
    $(".total-pages").html(query_results.tot_pages);
    $(".total-docs").html(query_results.tot_records);
    // clear all the rows
    $("#search-results-rows").html("");
    // alert(show_search_header)
    $("tabe thead").show()
    // set the results length
    if(show_search_header){
      $(".results-header").html("<h4> "+ data.length +
      " results found for <i>\""+ queryString +"\"</i></h4>");
    } 

    // const start_record_index = 
    // console.log(data);
    data.docs.forEach((element, index) => {
      // console.log(element, index)
      element["sno"] = (query_results.cur_page-1)*50 + index + 1;
      // console.log(resultstemplate(element))
      $("#search-results-rows").append(resultstemplate(element));
    });
  }



  // ***************************************************************************
  // ******************** function to scroll to the top  ***********************
  // ***************************************************************************

  $(".move-to-top-btn").click(function(){
    // alert("adsf");
    // window.scrollTo(0, 0);
    // $("body").animate({scrollTop:0}, '500');

    $("html, body").animate({ scrollTop: 0 }, 300);
  });

});

// function to send the get request to get all the student values.
function getStudInfo(){
  stud_id = $(this).parent().parent().attr("id")
  console.log(stud_id);
  window.open("student.html#"+stud_id, '_blank')  
}
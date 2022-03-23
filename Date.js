// this is the code provided by the course web --------------------------
(function(){
  Date.prototype.deltaDays=function(c){
    return new Date(this.getFullYear(),this.getMonth(),this.getDate()+c)
  };
  Date.prototype.getSunday=function(){
    return this.deltaDays(-1*this.getDay())
  }
})();

function Week(c){
  this.sunday=c.getSunday();
  this.nextWeek=function(){
    return new Week(this.sunday.deltaDays(7))};
  this.prevWeek=function(){
    return new Week(this.sunday.deltaDays(-7))};
  this.contains=function(b){
    return this.sunday.valueOf()===b.getSunday().valueOf()};
  this.getDates=function(){
    for(var b=[],a=0;7>a;a++)
      b.push(this.sunday.deltaDays(a));
    return b;
  }
}

function Month(c,b){
  this.year=c;
  this.month=b;
  this.nextMonth=function(){
    return new Month(c+Math.floor((b+1)/12),(b+1)%12)};
  this.prevMonth=function(){
    return new Month(c+Math.floor((b-1)/12),(b+11)%12)};
  this.getDateObject=function(a){
    return new Date(this.year,this.month,a)};
  this.getWeeks=function(){
    let a=this.getDateObject(1),b=this.nextMonth().getDateObject(0),c=[];
    a=new Week(a);
    for(c.push(a);!a.contains(b);)
      a=a.nextWeek(),c.push(a);
    return c;
  }
}
// -----------------------------------------------------------------------
// this is code modified from the course web -----------------------------
// For our purposes, we can keep the current month in a variable in the global scope
let today = new Date();
let currentMonth = new Month(today.getFullYear(), today.getMonth()); // March 2020

// Change the month when the "next" button is pressed
document.getElementById("next_month_btn").addEventListener("click", function(event){
    currentMonth = currentMonth.nextMonth(); // Previous month would be currentMonth.prevMonth()
    updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
    $(".eventButton").remove();
    showEventView();
}, false);

// Change the month when the "previous" button is pressed
document.getElementById("prev_month_btn").addEventListener("click", function(event){
    currentMonth = currentMonth.prevMonth(); // Previous month would be currentMonth.prevMonth()
    updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
    $(".eventButton").remove();
    showEventView();
}, false);

document.addEventListener("DOMContentLoaded", function(event){
    updateCalendar(); // when the page is loaded, show the current month
}, false);


// This updateCalendar() function only alerts the dates in the currently specified month.  You need to write
// it to modify the DOM (optionally using jQuery) to display the days and weeks in the current month.
function updateCalendar(){
  //$("#calendarField").empty();
  
  $("#calendarField h1").text(`${currentMonth.year} - ${currentMonth.month + 1}`);
  let weeks = currentMonth.getWeeks();
  $("#myCalendar tr:gt(0)").remove(); // https://stackoverflow.com/questions/370013/jquery-delete-all-table-rows-except-first
  const calenTable = document.getElementById("myCalendar");
  let weekRow;
  
  for(let w in weeks){
    let days = weeks[w].getDates();
    //alert("Week starting on "+days[0]);
    weekRow = document.createElement("tr");
    
    for(let d in days){
      weekDayCell = document.createElement("td");
      weekDay = document.createElement("h4");
      weekDay.textContent = updateCalendarHelper_showDate(days[d]);
	weekDayCell.appendChild(weekDay);
	$(weekDayCell).append($("<div class=\"eventTagsField\"></div>"));

      // dates not in the current month is marked as gray
      if(days[d].getMonth() !== currentMonth.month) {
	weekDay.style.color = "#C8C8C8";
      }
      
      weekRow.appendChild(weekDayCell);
    }
    calenTable.appendChild(weekRow);
  }
  
  // mark today as blue.
  if(currentMonth.month === today.getMonth() && currentMonth.year === today.getFullYear()) {
      let sundayDate = today.getSunday().getDate();
      let row = (today.getDate() >= sundayDate)? Math.ceil(sundayDate / 7) + 1 : 1;
      let col = today.getDay();
    $(`#myCalendar tr:eq(${row}) td:eq(${col}) h4`).css("color", "#3396FF");
  }
}

// -----------------------------------------------------------------------
function updateCalendarHelper_showDate(Date) {
  const monthName = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  return Date.getDate() === 1 ? `${monthName[Date.getMonth()]} ${Date.getDate()}` : `${Date.getDate()}`;
}

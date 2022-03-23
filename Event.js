function submitEventAjax(event) {
    let eventTitle = $("#eventTitle").val();
    let eventDate = $("#eventDate").val();
    let eventTime = $("#eventTime").val();
    let eventTag = $("input[name='tag']:checked").val();
    let eventToken = $("#eventToken").val();

    let data = {'eventTitle' : eventTitle,
		'eventDate' : eventDate,
		'eventTime': eventTime,
		'eventTag': eventTag,
		'eventToken': eventToken
	       };

    fetch("WriteEvents.php", {
	method : 'POST',
	body: JSON.stringify(data),
	headers: {'content-type' : 'application/json'}
    })
	.then(response => response.json())
	.then(data => {
	    if(!data.logedin) {
		logedout();
		return;
	    }
	    if(data.success) {
		// update the calendar view
		// hide the eventField
		$("#eventField").css("display", "none");
		document.getElementById("submitEvent").removeEventListener("click", submitEventAjax, false);
		$("#eventField p").remove();
		$(".eventButton").remove();
		showEventView();
	    }
	    else {
		let eventWarning = document.createElement("p");
		eventWarning.textContent = data.message;
		eventWarning.style.backgroundColor = "#F5A9A9";
		document.getElementById("eventField").appendChild(eventWarning);
	    }
	})
	.catch(err => console.log(err));
}


function showEventView() {
    let currentWeeks = currentMonth.getWeeks();
    let fromDate = currentWeeks[0].sunday;
    let toDate = currentWeeks[currentWeeks.length - 1].nextWeek().sunday;

    data = {
	"fromDate": {
	    "year" : fromDate.getFullYear(),
	    "month" : fromDate.getMonth() + 1,
	    "date" : fromDate.getDate()
	},
	"toDate": {
	    "year" : toDate.getFullYear(),
	    "month" : toDate.getMonth() + 1,
	    "date" : toDate.getDate()
	}
    }
    
    fetch("ReadEvents.php", {
	method : "POST",
	body : JSON.stringify(data),
	headers : {"content-type" : "application/json"}
    })
	.then(response => response.json())
	.then(data => {
	    if(!data.logedin) {
		logedout();
		return;
	    }
	    if(data.success) {
		for(let i = 0; i < data.eventCnt; i++) {
		    let eventData = data[i];
		    showEvent(eventData);
		}
	    }
	})
	.catch(err => console.log(err));
}


function showEvent(eventData) {
    let dateEle = eventData.date.split("-"); // year-month-date
    date = new Date(parseInt(dateEle[0]), parseInt(dateEle[1]) - 1, parseInt(dateEle[2]));

    const colorPalette = ["#80bfff","#79d2a6","#99b3ff","#ff99ff", "#ffff99"];
    // const othMonColor = ["#cce6ff","#c6ecd9","#ccd8ff","#ffe6ff", "#ffffe6"];
    let tagNum = {"w" : 0, "l" : 1, "p" : 2, "s" : 3, "" : 4};
    
    let row;
    if (date.getMonth() == currentMonth.prevMonth().month) {
	row = 1;
    }
    else if (date.getMonth() == currentMonth.nextMonth().month){
	row = currentMonth.getWeeks().length;
    }
    else {
	let sundayDate = date.getSunday().getDate();
	row = (date.getDate() >= sundayDate)? Math.ceil(sundayDate / 7) + 1 : 1;
    }
    let color = colorPalette[tagNum[eventData.tag]]
    let col = date.getDay();
    let eventDiv = document.createElement("div");
    $(eventDiv).attr("id", eventData.eid);
    $(eventDiv).attr("class", "eventTag");
    $(eventDiv).css("background-color", color);
    if(eventData.time == "") {
	$(eventDiv).append($("<div class=\"titleDivTol\"></div>").text(eventData.title));
    } else {
	$(eventDiv).append($("<div class=\"titleDivHal\"></div>").text(eventData.title));
	$(eventDiv).append($("<div class=\"timeDiv\"></div>").text(eventData.time.slice(0, 5)));
    }
    let button = document.createElement("button");
    $(button).attr("class", "eventButton");
    $(button).val(eventData.eid);
    //button.addEventListener("click", selectEvent, false);
    $(button).append($(eventDiv));
    $(button).appendTo($(`#myCalendar tr:eq(${row}) td:eq(${col}) .eventTagsField`));
}

let eEid;
function selectEvent() {
    const modifyBtn = document.getElementById("modifyEventButton");
    const deleteBtn = document.getElementById("deleteEventButton");
    eEid = $(".eventButton:focus").val(); 
    if(eEid !== undefined) {
	modifyBtn.disabled = false;
	modifyBtn.addEventListener("click", fetchEventInfo, false);
	deleteBtn.disabled = false;
	deleteBtn.addEventListener("click", deleteAjax, false);
    }
    else {
	modifyBtn.disabled = true;
	modifyBtn.removeEventListener("click", fetchEventInfo, false);
	deleteBtn.disabled = true;
	deleteBtn.removeEventListener("click", deleteAjax, false);
    }
}

document.body.addEventListener("click", selectEvent, false);

function deleteAjax() {
    let token = $("#eventToken").val();
    const data = {"eid": eEid, "token": token};
    fetch("DeleteEvents.php", {
	method: "post",
	body: JSON.stringify(data),
	headers: {"content-type" : "application/json"}
    })
	.then(response => response.json())
	.then(data => {
	    if(!data.logedin) {
		logedout();
		return;
	    }
	    if(data.success) {
		$(".eventButton").remove();
		showEventView();
	    }
	})
	.catch(err => console.log(err));
}

let eEidMod;
function fetchEventInfo() {
    let token = $("#eventToken").val();
    eEidMod = eEid;
    const data = {"eid": eEidMod, "token": token};
    fetch("FetchEvents.php", {
	method: "post",
	body: JSON.stringify(data),
	headers: {"content-type" : "application/json"}
    })
	.then(response => response.json())
	.then(data => {
	    if(!data.logedin) {
		logedout();
		return;
	    }
	    if(data.success) {
		let tag = (data.eventTag === "")? "none" : data.eventTag;
		$("#eventTitle").val(data.eventTitle);
		$("#eventDate").val(data.eventDate);
		$("#eventTime").val(data.eventTime);
		$("#eventField #" + tag).prop("checked", true);

		$("#eventField").css("display", "block");
		document.getElementById("submitEvent").addEventListener("click", modifyAjax, false);
	    }
	})
	.catch(err => console.log(err));
}

function modifyAjax(eEid) {
    let eventTitle = $("#eventTitle").val();
    let eventDate = $("#eventDate").val();
    let eventTime = $("#eventTime").val();
    let eventTag = $("input[name='tag']:checked").val();
    let eventToken = $("#eventToken").val();
    let eventEid = eEidMod;

    let data = {
	'eventEid' : eventEid,
	'eventTitle' : eventTitle,
	'eventDate' : eventDate,
	'eventTime': eventTime,
	'eventTag': eventTag,
	'eventToken': eventToken
    };

    fetch("ModifyEvents.php", {
	method : 'POST',
	body: JSON.stringify(data),
	headers: {'content-type' : 'application/json'}
    })
	.then(response => response.json())
	.then(data => {
	    if(!data.logedin) {
		logedout();
		return;
	    }
	    if(data.success) {
		// update the calendar view
		// hide the eventField
		$("#eventField").css("display", "none");
		document.getElementById("submitEvent").removeEventListener("click", modifyAjax, false);
		$("#eventField p").remove();
		$(".eventButton").remove();
		showEventView();
	    }
	    else {
		let eventWarning = document.createElement("p");
		eventWarning.textContent = data.message;
		eventWarning.style.backgroundColor = "#F5A9A9";
		document.getElementById("eventField").appendChild(eventWarning);
	    }
	})
	.catch(err => console.log(err));
}



window.onload = () => {
    const leaveType = document.getElementById("leaveType");
    const otherType = document.getElementById("otherLeaveTypeHolder");

    leaveType.onchange = (e) => {
        otherType.hidden = e.target.value != "Other";
    }


    const form = document.getElementById("leaveForm");
    const addRangeButton = document.getElementById("addDateRange");
    const delRangeButton = document.getElementById("delDateRange");
    const dateRanges = document.getElementById("dateTimeRanges");

    // Stack to hold date and time range fields
    const rangeStack = [];

    delRangeButton.onclick = () => {
        // When delete is called, remove the most recently added range, if there is one
        if (rangeStack.length > 1) {
            rangeStack.pop().remove();
        }
    };

    
    const addDateRange = function() {
        // Fetch the html for the date and time range and insert it into the date-time-ranges div
        fetch("/static/html/date-time-range.html")
            .then(resp => resp.text())
            .then(html => {
                const newRange = document.createElement("div");
                // Index of this range i.e. is it the first, second, etc.
                const index = rangeStack.length;
                // Insert index of this date range into the document where required
                newRange.innerHTML = html.trim().replaceAll("{%INDEX%}", index);

                // Checking "Single Day" hides the end date selection and changes the
                // text of the start date label to "Date"
                const singleDayCheck = newRange.querySelector("#singleDay" + index);
                const startDateLabel = newRange.querySelector("#startDateLabel" + index);
                const endDateHolder = newRange.querySelector("#endDateHolder" + index);
                const endDate = newRange.querySelector("#endDate" + index);
                const startDateLabelText = startDateLabel.innerText;
                singleDayCheck.onclick = (e) => {
                    endDateHolder.hidden = e.target.checked;
                    endDate.required = !e.target.checked;
                    startDateLabel.innerText = e.target.checked ? "Date" : startDateLabelText;
                }

                // Checking "Full Day(s)" hides the time range and makes it's inputs non-required.
                const fullDayCheck = newRange.querySelector("#fullDay" + index);
                const timeRange = newRange.querySelector("#timeRangeHolder" + index);
                const timeFrom = newRange.querySelector("#timeFrom" + index);
                const timeTo = newRange.querySelector("#timeTo" + index);
                fullDayCheck.onclick = (e) => {
                    timeRange.hidden = e.target.checked;
                    timeFrom.required = !e.target.checked;
                    timeTo.required = !e.target.checked;
                }

                if (rangeStack.length > 0) {
                    newRange.className += " fade-in";
                }
                dateRanges.appendChild(newRange);
                rangeStack.push(newRange);

            })
            .catch(error => console.error("Error fetching date-time-range.html"))
    }

    addRangeButton.onclick = addDateRange;
    addDateRange();

    form.onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        const startDates = [];
        const endDates = [];
        const startTimes = [];
        const endTimes = [];

        for (let i = 0; i < rangeStack.length; i++) {
            const singleDay = rangeStack[i].querySelector("#singleDay" + i);
            const fullDay = rangeStack[i].querySelector("#fullDay" + i);
            const startDate = rangeStack[i].querySelector("#startDate" + i);
            const endDate = rangeStack[i].querySelector("#endDate" + i);
            const timeFrom = rangeStack[i].querySelector("#timeFrom" + i);
            const timeTo = rangeStack[i].querySelector("#timeTo" + i);

            startDates[i] = startDate.value;
            if (singleDay.checked) {
                endDates[i] = startDate.value;
            } else {
                endDates[i] = endDate.value;
            }

            if (fullDay.checked) {
                startTimes[i] = "08:30";
                endTimes[i] = "16:30";
            } else {
                startTimes[i] = timeFrom.value;
                endTimes[i] = timeTo.value;
            }

            if (fd.get("leaveType") == "Other") {
                fd.set("leaveType", fd.get("otherLeaveType"));
                fd.delete("otherLeaveType");
            }
                


            fd.append("startDates[]", startDates[i]);
            fd.append("endDates[]", endDates[i]);
            fd.append("startTimes[]", startTimes[i]);
            fd.append("endTimes[]", endTimes[i]);
        }


        fetch("/requestleave", {
            method: "POST",
            body: fd,
        }).then(resp => resp.json())
            .then(data => console.log(data));

    }
}

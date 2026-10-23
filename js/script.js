console.log("script.js connected!");

 // Escaped special characters before displaying API text as HTML.
function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function(character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}


 // Selected the community events container.
const eventContainer = document.querySelector("#event-container");

// Checked whether the events container exists on this page.
if (eventContainer) {
    // Displayed a loading message.
    eventContainer.textContent = "Loading Milwaukee community events...";

    // Stored the Find Local API key.
    const findLocalKey = "Hvy9cMKbHNAgoPMLzpYxwK";

    // Created the API URL for upcoming Milwaukee events.
    // Requested upcoming Milwaukee events, sorted by date.
    const eventURL =
        "https://findlocal.community/api/events" +
        "?city=milwaukee&when=anytime&sort=date&limit=40";
    
    // Requested events from the Find Local API.
    fetch(eventURL, {
        headers: {
            "Authorization": "Bearer " + findLocalKey
        }
    })
        .then(function(response) {
            // Checked whether the request succeeded.
            if (!response.ok) {
                throw new Error("Could not load community events.");
            }

            // Converted the response into JSON data.
            return response.json();
        })
        .then(function(data) {
            // Checked whether the API returned events.
            if (!data.data || data.data.length === 0) {
                eventContainer.textContent =
                    "No upcoming Milwaukee events were found.";
                return;
            }

            // Stored the events and prepared to build the cards.
            // Stored the events returned by the API.
            const events = data.data;

            // Set the maximum number of events to display per day.
            const maxEventsPerDay = 10;

            // Created a dictionary to count events for each date.
            const eventsPerDay = {};

            // Stored the events that will be displayed.
            const selectedEvents = [];


            // Stored the current date and time.
            const now = new Date();

            // Went through the events returned by the API.
            events.forEach(function(event) {
                const eventDate = event.event_date;
                const startTime = event.start_time || "";

                // Checked whether the event's date and time have passed.
                if (eventDate) {
                    const dateParts = eventDate.split("-").map(Number);
                    let eventStart = null;

                    // Converted the event's start time into numbers.
                    const timeMatch = startTime.match(
                        /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i
                    );

                    if (timeMatch) {
                        let hours = Number(timeMatch[1]);
                        const minutes = Number(timeMatch[2]);
                        const seconds = Number(timeMatch[3] || 0);
                        const period = timeMatch[4];

                        // Converted 12-hour time into 24-hour time when needed.
                        if (period) {
                            if (period.toUpperCase() === "PM" && hours < 12) {
                                hours += 12;
                            } else if (
                                period.toUpperCase() === "AM" &&
                                hours === 12
                            ) {
                                hours = 0;
                            }
                        }

                        // Created a date object using the event's local date and time.
                        eventStart = new Date(
                            dateParts[0],
                            dateParts[1] - 1,
                            dateParts[2],
                            hours,
                            minutes,
                            seconds
                        );
                    }

                    // Skipped events scheduled before the current date.
                    const today = new Date(
                        now.getFullYear(),
                        now.getMonth(),
                        now.getDate()
                    );

                    const eventDay = new Date(
                        dateParts[0],
                        dateParts[1] - 1,
                        dateParts[2]
                    );

                    if (eventDay < today) {
                        return;
                    }

                    // Skipped events that have already started today.
                    if (
                        eventDay.getTime() === today.getTime() &&
                        eventStart &&
                        eventStart <= now
                    ) {
                        return;
                    }
                }

                // Counted how many upcoming events have been selected for this date.
                if (!eventsPerDay[eventDate]) {
                    eventsPerDay[eventDate] = 0;
                }

                // Added the event only if the date has fewer than five events.
                if (eventsPerDay[eventDate] < maxEventsPerDay) {
                    selectedEvents.push(event);
                    eventsPerDay[eventDate]++;
                }
            });

            let eventHTML = "";
            const displayedIDs = new Set();
            const displayedDetails = new Set();
            let eventCount = 0;

            // Checked the dates returned by the API.
            console.log("Total matching events:", data.meta.total);

            events.forEach(function(event) {
                console.log(event.title, event.event_date);
            });



            // Went through each event returned by the API.
            selectedEvents.forEach(function(event)  {
                const eventName = event.title || "Event name unavailable";
                const eventDate = event.event_date || "Date unavailable";
                const venue = event.venue_name || "Location unavailable";

                // Created a key to identify matching event details.
                const detailKey =
                    eventName.toLowerCase().trim() + "|" +
                    eventDate + "|" +
                    venue.toLowerCase().trim();

                // Skipped events with a repeated ID or matching details.
                if (displayedIDs.has(event.id) ||
                    displayedDetails.has(detailKey)) {
                    return;
                }

                // Recorded the event so it won't be displayed again.
                if (event.id) {
                    displayedIDs.add(event.id);
                }
                displayedDetails.add(detailKey);

                // Prepared the event category and time.
                const category = event.category || "Community event";
                const startTime = event.start_time || "";

                // Escaped API text before displaying it as HTML.
                const safeName = escapeHTML(eventName);
                const safeDate = escapeHTML(eventDate);
                const safeVenue = escapeHTML(venue);
                const safeCategory = escapeHTML(category);
                const safeTime = escapeHTML(startTime);

                // Created a link to the event's details.
                // Requested events from October 22 through December 31, 2026.
                const eventURL =
                    "https://findlocal.community/api/events" +
                    "?city=milwaukee" +
                    "&date_from=2026-10-22" +
                    "&date_to=2026-12-31" +
                    "&sort=date&limit=40";

                // Built a card for the event.
                eventHTML +=
                    '<div class="col-md-6 mb-3">' +
                        '<div class="card h-100 p-3">' +
                            '<h3 class="h5">' + safeName + '</h3>' +
                            '<p><strong>Date:</strong> ' + safeDate +
                                (safeTime ? " at " + safeTime : "") +
                            '</p>' +
                            '<p><strong>Location:</strong> ' + safeVenue + '</p>' +
                            '<p><strong>Category:</strong> ' + safeCategory + '</p>' +
                            '<a href="' + eventURL +
                                '" target="_blank" rel="noopener noreferrer">' +
                                'Event details</a>' +
                        '</div>' +
                    '</div>';

                eventCount++;
            });

            // Displayed the event cards.
            if (eventCount === 0) {
                eventContainer.textContent =
                    "No upcoming community events were found.";
            } else {
                eventContainer.innerHTML = eventHTML;
            }
        })
        .catch(function(error) {
            // Displayed a message if the request failed.
            eventContainer.textContent =
                "Community events could not be loaded. Please try again later.";
            console.error("Find Local API error:", error);
        });
}


const diningContainer = document.querySelector("#dining-container");

// Checked whether the dining container exists on this page.
if (diningContainer) {
    // Displayed a loading message.
    diningContainer.textContent = "Loading Milwaukee restaurants...";

    // Created a query to find restaurants in Milwaukee.
    const restaurantQuery = `
        [out:json][timeout:25];
        (
            nwr["amenity"~"restaurant|cafe|fast_food"]
                (43.0,-88.1,43.2,-87.8);
        );
        out center 30;
    `;

    // Sent the query to the OpenStreetMap Overpass API.
    fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
            "Content-Type":
                "application/x-www-form-urlencoded;charset=UTF-8"
        },
        body: "data=" + encodeURIComponent(restaurantQuery)
    })
        .then(function(response) {
            // Checked whether the request succeeded.
            if (!response.ok) {
                throw new Error("Could not load restaurant data.");
            }

            // Converted the response into JSON.
            return response.json();
        })
        .then(function(data) {
            // Created a variable to store the restaurant HTML.
            let restaurantHTML = "";

            // Went through each location returned by the API.
            data.elements.forEach(function(place) {
                // Stored the restaurant's information.
                const tags = place.tags || {};
                const name = tags.name;
                const address = tags["addr:street"];
                const houseNumber = tags["addr:housenumber"];
                const cuisine = tags.cuisine;
                const website = tags.website || tags["contact:website"];

                // Found coordinates for nodes, ways, and relations.
                const latitude = place.lat || (place.center && place.center.lat);
                const longitude = place.lon || (place.center && place.center.lon);

                // Skipped locations missing required information.
                if (!name || !address || !houseNumber ||
                    !cuisine || !latitude || !longitude) {
                    return;
                }

                // Escaped text before inserting it into the page.
                const safeName = escapeHTML(name);
                const safeAddress = escapeHTML(
                    houseNumber + " " + address
                );
                const safeCuisine = escapeHTML(cuisine);

                // Created a map link using the coordinates.
                const mapLink =
                    "https://www.openstreetmap.org/?mlat=" +
                    latitude + "&mlon=" + longitude +
                    "#map=18/" + latitude + "/" + longitude;

                // Added the restaurant card to the HTML.
                restaurantHTML +=
                    '<div class="col-md-6 mb-3">' +
                        '<div class="card h-100 p-3">' +
                            '<h3 class="h5">' + safeName + '</h3>' +
                            '<p><strong>Address:</strong> ' +
                                safeAddress + ', Milwaukee, WI</p>' +
                            '<p><strong>Cuisine:</strong> ' +
                                safeCuisine + '</p>' +
                            '<a href="' + mapLink +
                                '" target="_blank" ' +
                                'rel="noopener noreferrer">' +
                                'View on OpenStreetMap</a>' +
                        '</div>' +
                    '</div>';
            });

            // Displayed the matching restaurants.
            if (restaurantHTML === "") {
                diningContainer.textContent =
                    "No restaurants with all required information were found.";
            } else {
                diningContainer.innerHTML = restaurantHTML;
            }
        })
        .catch(function(error) {
            // Displayed a message if the request failed.
            diningContainer.textContent =
                "Restaurant information could not be loaded.";
            console.error("OpenStreetMap error:", error);
        });
}

// Select all event titles that should trigger a card flip
let flipTriggers = document.querySelectorAll(".flip-trigger");

// Loop through each event title
flipTriggers.forEach(function(title) {

    // Listen for a click on the event title
    title.addEventListener("click", function(event) {

        // Prevent the link from jumping to the top of the page
        event.preventDefault();

        // Find the card containing the clicked title
        let eventCard = title.closest(".flip-card");

        // Toggle the flipped class to show or hide the event details
        eventCard.classList.toggle("is-flipped");
    });
});


// Checks whether the campus map exists on the current page
let campusMapElement = document.querySelector("#campusMap");

if (campusMapElement) {

    // Creates the map centered on Mount Mary University
    let campusMap = L.map("campusMap").setView(
        [43.0723, -88.03158],
        16
    );

    // Adds the OpenStreetMap map tiles
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(campusMap);

    // Stores campus building information for the campus map
    let campusLocations = [
        {
            id: "notre-dame",
            name: "Notre Dame Hall",
            category: ["academic", "services"],
            description: "Admissions, Welcome Center, administration offices, classrooms, Chapel, and Food Lab.",
            coordinates: [43.072553, -88.030709]
        },
        {
            id: "caroline",
            name: "Caroline Hall",
            category: ["academic", "services", "dining"],
            description: "Health Sciences Center, Nursing Skills Lab, Student Life Offices, and student residence.",
            coordinates: [43.071820, -88.030993]
        },
        {
            id: "gerhardinger",
            name: "Gerhardinger Center",
            category: ["academic", "dining"],
            description: "Cyber Café, science labs, and classrooms.",
            coordinates: [43.072741, -88.030060]
        },
        {
            id: "bergstrom",
            name: "Bergstrom Hall",
            category: ["services", "dining"],
            description: "Alumnae Conference Center, Campus Security, dining rooms, mail room, and archives.",
            coordinates: [43.071581, -88.030183]
        },
        {
            id: "bloechl",
            name: "Bloechl Center",
            category: ["wellness"],
            description: "Gym and fitness center.",
            coordinates: [43.070629, -88.030044]
        },
        {
            id: "library",
            name: "Haggerty Library",
            category: ["academic", "wellness", "services"],
            description: "Library, Student Success Center, Counseling and Wellness Center, Promise Program, Tech Haven, and IT Helpdesk.",
            coordinates: [43.071718, -88.031986]
        },
        {
            id: "kostka",
            name: "Kostka Hall",
            category: ["academic"],
            description: "Faculty offices.",
            coordinates: [43.073225, -88.031379]
        },
        {
            id: "fidelis",
            name: "Fidelis Hall",
            category: ["academic"],
            description: "Faculty offices and fashion labs.",
            coordinates: [43.073235, -88.030945]
        },
        {
            id: "dominic",
            name: "Dominic Hall",
            category: ["services"],
            description: "Campus Facilities and Marketing & Communications.",
            coordinates: [43.072201, -88.029923]
        },
        {
            id: "trinity",
            name: "Trinity Woods",
            category: ["services"],
            description: "Intergenerational housing community.",
            coordinates: [43.074032, -88.031805]
        },
        {
            id: "parking-a",
            name: "Parking Lot A",
            category: ["parking"],
            description: "Near Notre Dame Hall, with faculty/staff parking and reserved admission visitor spaces.",
            coordinates: [43.072506, -88.029393]
        },
        {
            id: "parking-b",
            name: "Parking Lot B",
            category: ["parking"],
            description: "Parking in the upper/rear area of campus.",
            coordinates: [43.071521, -88.028811]
        },
        {
            id: "parking-c",
            name: "Parking Lot C",
            category: ["parking"],
            description: "Parking in the south/front area of campus.",
            coordinates: [43.073456, -88.032000]
        }
    ];

    // Stores the Leaflet markers so the filters can control them
    let campusMarkers = {};

    // Creates a marker for each campus location
    campusLocations.forEach(function(location) {

        let marker = L.marker(location.coordinates);

        // Shows the building name and resources when the marker is clicked
        marker.bindPopup(
            "<strong>" + location.name + "</strong><br>" +
            location.description
        );

        // Shows the building name and resources when hovering over the marker
        marker.bindTooltip(
            "<strong>" + location.name + "</strong><br>" +
            location.description
        );

        // Adds the marker to the map initially
        marker.addTo(campusMap);

        // Saves the marker using the location ID
        campusMarkers[location.id] = marker;
    });

    // Selects the category and location dropdowns
    let campusCategory = document.querySelector("#campusCategory");
    let campusLocation = document.querySelector("#campusLocation");

    // Filters the map markers when a category is selected
    function filterCampusMarkers() {

        let selectedCategory = campusCategory.value;
        let selectedLocation = campusLocation.value;

        campusLocations.forEach(function(location) {

            let marker = campusMarkers[location.id];

            // Checks whether the location matches the selected category
            let matchesCategory =
                selectedCategory === "all" ||
                location.category.includes(selectedCategory);

            // Checks whether the location matches the selected building
            let matchesLocation =
                selectedLocation === "all" ||
                location.id === selectedLocation;

            // Displays the marker only if it matches both filters
            if (matchesCategory && matchesLocation) {
                marker.addTo(campusMap);
            } else {
                marker.remove();
            }
        });

        // Zooms to the selected location when one is chosen
        if (selectedLocation !== "all") {

            let selectedMarker = campusMarkers[selectedLocation];

            // Moves the map and opens the selected marker's information
            if (selectedMarker && campusMap.hasLayer(selectedMarker)) {
                campusMap.setView(selectedMarker.getLatLng(), 18);
                selectedMarker.openPopup();
            }
        }
    }

    // Runs the filter whenever either dropdown changes
    campusCategory.addEventListener("change", filterCampusMarkers);
    campusLocation.addEventListener("change", filterCampusMarkers);
}


// Checks whether the calendar exists on the current page
let calendarGrid = document.querySelector("#calendarGrid");

if (calendarGrid) {

    // Selects the calendar elements
    let calendarMonth = document.querySelector("#calendarMonth");
    let previousMonth = document.querySelector("#previousMonth");
    let nextMonth = document.querySelector("#nextMonth");
    let selectedDateMessage =
        document.querySelector("#selectedDateMessage");
    let showAllEvents = document.querySelector("#showAllEvents");
    let eventCategory = document.querySelector("#eventCategory");

    // Selects the existing campus event cards
    let campusEventCards =
        document.querySelectorAll(".events-page .flip-card");

    // Starts the calendar on October 2026
    let displayedMonth = new Date(2026, 9, 1);

    // Stores the date selected by the visitor
    let selectedDate = "";

    // Stores weekday names, starting with Sunday
    let weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Creates the calendar for the displayed month
    function displayCalendar() {

        // Clears the previous calendar
        calendarGrid.innerHTML = "";

        // Displays the month and year
        calendarMonth.textContent = displayedMonth.toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" }
        );

        // Adds the weekday headings
        weekdays.forEach(function(day) {
            let weekday = document.createElement("div");

            weekday.textContent = day;
            weekday.classList.add("calendar-weekday");

            calendarGrid.appendChild(weekday);
        });

        // Gets the year, month, first weekday, and number of days
        let year = displayedMonth.getFullYear();
        let month = displayedMonth.getMonth();
        let firstDay = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year, month + 1, 0).getDate();

        // Adds empty cells before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            let blankDay = document.createElement("div");
            calendarGrid.appendChild(blankDay);
        }

        // Creates a button for each date
        for (let day = 1; day <= daysInMonth; day++) {

            let dayButton = document.createElement("button");

            // Creates a date in YYYY-MM-DD format
            let dateValue = year + "-" +
                String(month + 1).padStart(2, "0") + "-" +
                String(day).padStart(2, "0");

            dayButton.type = "button";
            dayButton.textContent = day;
            dayButton.classList.add("calendar-day");

            // Provides an accessible description for the date
            dayButton.setAttribute(
                "aria-label",
                displayedMonth.toLocaleDateString("en-US",
                    { month: "long" }) + " " + day
            );

            // Highlights the selected date
            if (dateValue === selectedDate) {
                dayButton.classList.add("selected");
                dayButton.setAttribute("aria-pressed", "true");
            } else {
                dayButton.setAttribute("aria-pressed", "false");
            }

            // Checks whether an event is scheduled for this date
            campusEventCards.forEach(function(card) {
                if (card.dataset.date === dateValue) {
                    dayButton.classList.add("has-events");
                }
            });

            // Filters events when a date is clicked
            dayButton.addEventListener("click", function() {
                selectedDate = dateValue;

                displayCalendar();
                filterCampusEvents();
            });

            calendarGrid.appendChild(dayButton);
        }
    }
    // Clears the date and category filters
    showAllEvents.addEventListener("click", function() {
        selectedDate = "";
        eventCategory.value = "all";

        displayCalendar();
        filterCampusEvents();
    });

    // Filters campus events by date and category
    function filterCampusEvents() {

        let selectedCategory = eventCategory.value;
        let visibleEvents = 0;
        let noEventsMessage = document.querySelector("#noEventsMessage");

        campusEventCards.forEach(function(card) {

            // Gets the event date and category
            let cardDate = card.dataset.date;
            let cardCategory = card.dataset.category;

            // Checks whether the date matches
            let matchesDate =
                selectedDate === "" || cardDate === selectedDate;

            // Checks whether the category matches
            let matchesCategory =
                selectedCategory === "all" ||
                cardCategory === selectedCategory;

            // Finds the column containing the event card
            let eventColumn = card.closest(".col-12");

            // Shows events matching both filters
            if (matchesDate && matchesCategory) {
                eventColumn.style.display = "";
                visibleEvents++;
            } else {
                eventColumn.style.display = "none";
            }
        });
        
        // Shows a message when no events match
        noEventsMessage.hidden = visibleEvents > 0;

        // Updates the message below the calendar
        if (selectedDate === "") {
            selectedDateMessage.textContent =
                "Showing all events matching your category.";
        } else if (visibleEvents === 0) {
            selectedDateMessage.textContent =
                "No events match this date and category.";
        } else {
            selectedDateMessage.textContent =
                visibleEvents + " event(s) found for " + selectedDate + ".";
        }
    

        // Updates the message below the calendar
        if (selectedDate === "") {
            selectedDateMessage.textContent =
                "Showing all events matching your category.";
        } else if (visibleEvents === 0) {
            selectedDateMessage.textContent =
                "No events match this date and category.";
        } else {
            selectedDateMessage.textContent =
                visibleEvents + " event(s) found for " + selectedDate + ".";
        }
    }

    // Moves to the previous month
    previousMonth.addEventListener("click", function() {
        displayedMonth.setMonth(displayedMonth.getMonth() - 1);

        // Clears the previous date selection
        selectedDate = "";

        displayCalendar();
        filterCampusEvents();
    });

    // Moves to the next month
    nextMonth.addEventListener("click", function() {
        displayedMonth.setMonth(displayedMonth.getMonth() + 1);

        // Clears the previous date selection
        selectedDate = "";

        displayCalendar();
        filterCampusEvents();
    });

    // Shows all events again when the button is clicked
    showAllEvents.addEventListener("click", function() {
        selectedDate = "";

        displayCalendar();
        filterCampusEvents();
    });

    // Filters events when the category changes
    eventCategory.addEventListener("change", filterCampusEvents);

    // Displays the calendar and all events initially
    displayCalendar();
    filterCampusEvents();
}



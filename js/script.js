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
        "?city=milwaukee&when=anytime&sort=date&limit=30";
    
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
            const maxEventsPerDay = 5;

            // Created a dictionary to count events for each date.
            const eventsPerDay = {};

            // Stored the events that will be displayed.
            const selectedEvents = [];

            // Went through the events returned by the API.
            events.forEach(function(event) {
                const eventDate = event.event_date;

                // Counted how many events have been selected for this date.
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
                // Requested events from October 19 through November 18, 2026.
                const eventURL =
                    "https://findlocal.community/api/events" +
                    "?city=milwaukee" +
                    "&date_from=2026-10-19" +
                    "&date_to=2026-11-18" +
                    "&sort=date&limit=30";

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
            description: "Bookstore, Health Sciences Center, Nursing Skills Lab, Student Life Offices, and student residence.",
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



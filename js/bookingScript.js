const totalYears = 15;
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const visibleDays = 12;
const floors = ["1st Floor", "2nd Floor", "3rd Floor"];
const reservationTypes = ["Deluxe", "Standard", "VIP", "Group"];
const roomTypes = ["Single", "Double", "Family"];
const roomDetails = {
    'Single Room': [101, 102, 103],
    'Double Room': [201, 202, 203],
    'Family Room': [301, 302, 303]
};
const bookings = {};

// Calculate total rooms per type and overall total
let totalRooms = 0;
let currentStartYear = 2011;
let selectedYear = new Date().getFullYear();
let selectedMonthIndex = 0;
let currentStartIndex = 0;
let zoomLevel = 1;


const createElements = (tagName, className, htmlContent = '') => {
    const element = document.createElement(tagName);
    element.className = className;
    if (htmlContent) {
        element.innerHTML = htmlContent;
    }
    return element;
};
const createButton = (container, className, text, onClick) => {
    const button = createElements('button', className, text);
    button.addEventListener('click', onClick);
    container.appendChild(button);
    return button;
};
const createOption = (text, value = "", isPlaceholder = false) => {
    const option = document.createElement('option');
    option.textContent = text;
    option.value = value;
    if (isPlaceholder) {
        option.disabled = true;
        option.selected = true;
    }
    return option;
};

// Function to populate select dropdowns
const populateSelect = (selectId, options, placeholder) => {
        const selectElement = document.getElementById(selectId);
        selectElement.innerHTML = '';  // Clear existing options first
    
        // Create and append the placeholder option
        selectElement.appendChild(createOption(placeholder, "", true));
    
        // Create and append each option from the options array
        options.forEach(optionText => {
            selectElement.appendChild(createOption(optionText));
        });
};

// Setup UI controls for navigating the calendar
const setupControls = () => {
    // Setup year and month navigation buttons
    const setupNavigationButton = (buttonId, adjustmentFunction) => {
        const button = document.getElementById(buttonId);
        button.addEventListener('click', adjustmentFunction);
    };
    setupNavigationButton('prev-button', () => adjustYear(-1));
    setupNavigationButton('next-button', () => adjustYear(1));
    setupNavigationButton('prev-month-button', () => adjustMonth(-visibleDays));
    setupNavigationButton('next-month-button', () => adjustMonth(visibleDays));
};
// Adjust the year by increments of 5 years
const adjustYear = (direction) => {
    currentStartYear += direction * 5;
    selectedYear = adjustSelectedYear(selectedYear, currentStartYear, totalYears);
    populateYears(currentStartYear, totalYears);
    renderCalendar(selectedYear, selectedMonthIndex);
};
// Adjust the month within the visible range
const adjustMonth = (increment) => {
    const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
    currentStartIndex = Math.max(0, Math.min(daysInMonth - visibleDays, currentStartIndex + increment));
    renderCalendar(selectedYear, selectedMonthIndex);
};

// Ensure the selected year remains within a logical range
const adjustSelectedYear = (currentSelected, start, total) => {
    return (currentSelected < start || currentSelected >= start + total) ? start : currentSelected;
};

const populateYears = (startYear, total) => {
    const yearGrid = document.getElementById('year-grid');
    yearGrid.innerHTML = '';  // Clear existing buttons

    for (let year = startYear; year < startYear + total; year++) {
        const onClick = (event) => {
            document.querySelectorAll('.year-button').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active'); // Now using the explicitly passed event object
            selectedYear = year;
            renderCalendar(selectedYear, selectedMonthIndex);
        };
        const yearButton = createButton(yearGrid, 'year-button', year, onClick);
        if (year === selectedYear) {
            yearButton.classList.add('active');
        }
    }
};
const populateMonths = (months) => {
    const monthGrid = document.getElementById('month-navigation');
    monthGrid.innerHTML = '';  // Clear existing buttons

    months.forEach((month, index) => {
        const onClick = (event) => {
            document.querySelectorAll('.month-button').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active'); // Now using the explicitly passed event object
            selectedMonthIndex = index;
            renderCalendar(selectedYear, selectedMonthIndex);
        };
        const monthButton = createButton(monthGrid, 'month-button', month, onClick);
        if (index === selectedMonthIndex) {
            monthButton.classList.add('active');
        }
    });
};

// Function to book a room and update room availability
const bookRoom = (roomType, roomNumber, startDate, endDate)=>{
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!bookings[dateKey]) {
            bookings[dateKey] = {};
        }
        if (!bookings[dateKey][roomType]) {
            bookings[dateKey][roomType] = new Set();
        }
        bookings[dateKey][roomType].add(roomNumber);
    }
}


// Function to get the number of available rooms for a specific type on a date
const getAvailableRooms = (roomType, date) => {
    const dateKey = date.toISOString().split('T')[0];
    const bookedRoomsOnDate = bookings[dateKey] && bookings[dateKey][roomType];
    const totalRoomsOfType = roomDetails[roomType].length;
    return totalRoomsOfType - (bookedRoomsOnDate ? bookedRoomsOnDate.size : 0);
}
const updateAvailability = (dayCell, date) => {
    let totalAvailableRooms = 0;
    const availabilityHtml = Object.entries(roomDetails).map(([type, numbers]) => {
        const availableCount = getAvailableRooms(type, date);
        totalAvailableRooms += availableCount;
        return `<div>${type}: ${availableCount} available of ${numbers.length}</div>`;
    }).join('');

    const totalRoomsClass = totalAvailableRooms > 0 ? 'total-rooms-available' : 'total-room-not-available';
    dayCell.innerHTML += `<div class="${totalRoomsClass}">${totalAvailableRooms}</div>`;
};

// Add the helper function to check bookings
const checkIfBooked = (roomType, roomNumber, date) => {
    const dateKey = date.toISOString().split('T')[0];
    const bookingsOnDate = bookings[dateKey] && bookings[dateKey][roomType];
    return bookingsOnDate ? bookingsOnDate.has(roomNumber) : false;
}
const appendDateCells = (year, monthIndex, daysInMonth, parentElement) => {
    for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
        const date = new Date(year, monthIndex, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayCell = createElements('div', 'day-cell', `<div>${dayName}</div><div>${day}</div>`);
        updateAvailability(dayCell, date);
        parentElement.appendChild(dayCell);
    }
};
const appendRoomTypeCells = (year, monthIndex, daysInMonth, roomType, parentElement) => {
    for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
        const date = new Date(year, monthIndex, day);
        const availableRooms = getAvailableRooms(roomType, date);
        const boxClass = availableRooms > 0 ? 'total-rooms-available' : 'total-room-not-available';
        const typeDateCell = createElements('div', 'date-cell', `<div><span class='${boxClass}'>${availableRooms}</span> </div>`);
        parentElement.appendChild(typeDateCell);
    }
};
const createRoomNumberRow = (roomNumber, year, monthIndex, daysInMonth, roomType) => {
    const roomNumberRow = createElements('div', 'calendar-row room-number-row');
    const roomNumberCell = createElements('div', 'room-number', roomNumber.toString());
    roomNumberRow.appendChild(roomNumberCell);

    for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
        const date = new Date(year, monthIndex, day);
        const isBooked = checkIfBooked(roomType, roomNumber, date);
        const numberDateCell = createElements('div', 'date-cell', isBooked ? 'Booked' : '');
        roomNumberRow.appendChild(numberDateCell);
    }
    return roomNumberRow;
};

const renderCalendar = (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = ''; // Clear existing contents
    calendarContainer.style.gridTemplateColumns = `150px repeat(${visibleDays}, 1fr)`; // Set grid columns

    // Create and append the header row for dates
    const headerRow = createElements('div', 'calendar-row');
    const roomLabelCell = createElements('div', 'room-label', 'Room');
    headerRow.appendChild(roomLabelCell);
    appendDateCells(year, monthIndex, daysInMonth, headerRow);
    calendarContainer.appendChild(headerRow);

    // Process each room type and room number
    Object.entries(roomDetails).forEach(([roomType, roomNumbers]) => {
        const roomTypeContainer = createRoomTypeContainer(roomType, roomNumbers, year, monthIndex, daysInMonth);
        calendarContainer.appendChild(roomTypeContainer);
    });
}

// This function creates and returns a room type container with all its elements
const createRoomTypeContainer = (roomType, roomNumbers, year, monthIndex, daysInMonth) => {
    const roomTypeContainer = document.createElement('div');
    roomTypeContainer.className = 'room-type-container';

    const roomTypeRow = createElements('div', 'calendar-row room-type-row');
    const roomTypeCell = createElements('div', 'room-type', roomType);
    const chevronIcon = document.createElement('i');
    chevronIcon.className = 'fas fa-chevron-up';  // Using right chevron icon
    roomTypeCell.appendChild(chevronIcon);
    roomTypeRow.appendChild(roomTypeCell);
    appendRoomTypeCells(year, monthIndex, daysInMonth, roomType, roomTypeRow);
    roomTypeContainer.appendChild(roomTypeRow);

    roomTypeRow.addEventListener('click', () => {
        toggleRoomNumbers(roomTypeContainer);
        // Toggle chevron direction
        chevronIcon.classList.toggle('fa-chevron-down');
        chevronIcon.classList.toggle('fa-chevron-up');
    });

    roomNumbers.forEach(roomNumber => {
        const roomNumberRow = createRoomNumberRow(roomNumber, year, monthIndex, daysInMonth, roomType);
        roomNumberRow.classList.add('room-number-row', 'hidden');
        roomTypeContainer.appendChild(roomNumberRow);
    });

    return roomTypeContainer;
}

// Toggles the visibility of room numbers in a room type container
const toggleRoomNumbers = (container) => {
    const rows = container.getElementsByClassName('room-number-row');
    Array.from(rows).forEach(row => row.classList.toggle('hidden'));
}



// Function to add hover effects to calendar cells
const applyHoverEffects = () => {
    const calendarContainer = document.getElementById('calendar-container'); // Assuming this is the parent container of all rows

    calendarContainer.addEventListener('mouseenter', event => {
        const target = event.target;
        if (target.classList.contains('date-cell')) {
            const row = target.parentNode;
            for (const child of row.children) {
                child.classList.add('hover-effect');
            }

            const columnIndex = Array.from(row.children).indexOf(target);
            const allRows = calendarContainer.querySelectorAll('.calendar-row');
            for (const currentRow of allRows) {
                const cell = currentRow.children[columnIndex];
                if (cell) {
                    cell.classList.add('hover-effect');
                }
            }
        }
    }, true); // Use capture phase to handle the event as it propagates up

    calendarContainer.addEventListener('mouseleave', event => {
        const target = event.target;
        if (target.classList.contains('date-cell')) {
            const allHovered = calendarContainer.querySelectorAll('.hover-effect');
            for (const hovered of allHovered) {
                hovered.classList.remove('hover-effect');
            }
        }
    }, true); // Use capture phase to handle the event as it propagates up
};
document.addEventListener('DOMContentLoaded', () => {
    const zoomInButton = document.getElementById('zoom-image');
    zoomInButton.addEventListener('click', () => {
        zoomLevel += 0.1;
        document.body.style.zoom = zoomLevel;
    });
    populateSelect('reservation-type-select', reservationTypes, "Reservation Type");
    populateSelect('room-type-select', roomTypes, "Room Type");
    populateSelect('floor-select', floors, "Floor");
    setupControls();  // Setup year and month navigation controls
    populateYears(currentStartYear, totalYears);  // Populate the year buttons
    populateMonths(months);
    bookRoom('Single Room', 101, '2024-01-08', '2024-01-10');
    bookRoom('Single Room', 102, '2024-01-01', '2024-01-03');
    bookRoom('Single Room', 103, '2024-01-10', '2024-01-12');
    bookRoom('Double Room', 201, '2024-01-03', '2024-01-05');
    bookRoom('Family Room', 301, '2024-01-01', '2024-01-02');
    bookRoom('Single Room', 103, '2024-01-06', '2024-01-08');
    bookRoom('Single Room', 102, '2024-01-06', '2024-01-07');
    bookRoom('Single Room', 101, '2024-01-04', '2024-01-06');
    
    // Assume the current month to render is January 2024 to see the bookings
    renderCalendar(2024, 0);  // Rendering January 2024
    applyHoverEffects();  // Apply visual effects to the calendar
});
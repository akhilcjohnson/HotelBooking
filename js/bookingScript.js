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
const bookRoom = (roomType, roomNumber, startDate, endDate, occupant) => {
    // Parse dates assuming they are in local timezone
    const start = new Date(startDate + 'T00:00:00'); // Append time part to specify exact time
    const end = new Date(endDate + 'T00:00:00');

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0]; // Convert to ISO string then split to get date part
        if (!bookings[dateKey]) {
            bookings[dateKey] = {};
        }
        if (!bookings[dateKey][roomType]) {
            bookings[dateKey][roomType] = {};
        }
        bookings[dateKey][roomType][roomNumber] = occupant;
    }
};

// Function to get the number of available rooms for a specific type on a date
const getAvailableRooms = (roomType, date) => {
    const dateKey = date.toISOString().split('T')[0];
    const bookedRoomsOnDate = bookings[dateKey] && bookings[dateKey][roomType];
    const totalRoomsOfType = roomDetails[roomType] ? roomDetails[roomType].length : 0; // Ensure default to 0 if undefined
    return totalRoomsOfType - (bookedRoomsOnDate ? Object.keys(bookedRoomsOnDate).length : 0);
}

// Add the helper function to check bookings
const checkRoomStatus = (roomType, roomNumber, date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Normalize today's date to start of the day

    const dateKey = date.toISOString().split('T')[0];
    const bookingsOnDate = bookings[dateKey] && bookings[dateKey][roomType];
    if (bookingsOnDate && bookingsOnDate[roomNumber]) {
        const occupant = bookingsOnDate[roomNumber];
        const bookingDate = new Date(dateKey);
        bookingDate.setHours(0, 0, 0, 0);

        // Future booking
        if (bookingDate > today) {
            return `Booked by ${occupant}`;
        }

        // Current or past booking (up to and including today)
        const endDate = getBookingEndDate(roomType, roomNumber, bookingDate);
        if (endDate >= today) {
            return `Occupied by ${occupant}`;
        }

        // Past booking where end date has passed
        if (endDate < today) {
            return `out of order: ${occupant}`;
        }
    }
    return '';
};

// Helper function to find the end date of a current booking
const getBookingEndDate = (roomType, roomNumber, startDate) => {
    let currentDate = new Date(startDate);
    while (true) {
        let nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        let nextDayKey = nextDay.toISOString().split('T')[0];
        if (!bookings[nextDayKey] || !bookings[nextDayKey][roomType] || !bookings[nextDayKey][roomType][roomNumber]) {
            break;
        }
        currentDate = nextDay;
    }
    return currentDate;  // Return the last day of the booking
};



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


// Update the room number row to display booking status
// This function now checks for bookings and spans them across multiple cells.
const createRoomNumberRow = (roomNumber, year, monthIndex, daysInMonth, roomType) => {
    const roomNumberRow = createElements('div', 'calendar-row room-number-row');
    const roomNumberCell = createElements('div', 'room-number', roomNumber.toString());
    roomNumberRow.appendChild(roomNumberCell);

    let day = currentStartIndex + 1;
    while (day <= Math.min(currentStartIndex + visibleDays, daysInMonth)) {
        const date = new Date(year, monthIndex, day);
        const status = checkRoomStatus(roomType, roomNumber, date);
        if (status) {
            const statusEndDay = getStatusEndDay(roomType, roomNumber, date);
            const statusClass = getStatusClass(status);
            const spanLength = statusEndDay - day + 1;
            const numberDateCell = createElements('div', `date-cell ${statusClass}`, `<span>${status}</span>`);
            numberDateCell.style.gridColumnEnd = `span ${spanLength}`;
            roomNumberRow.appendChild(numberDateCell);
            day += spanLength; // Move the start day to the end of the current booking
        } else {
            const numberDateCell = createElements('div', 'date-cell', '');
            roomNumberRow.appendChild(numberDateCell);
            day++;
        }
    }
    return roomNumberRow;
};

// Calculate the end day of a current booking status
const getStatusEndDay = (roomType, roomNumber, startDate) => {
    const startKey = startDate.toISOString().split('T')[0];
    let currentDate = new Date(startDate);
    while (bookings[startKey] && bookings[startKey][roomType] && bookings[startKey][roomType][roomNumber]) {
        currentDate.setDate(currentDate.getDate() + 1);
        const currentKey = currentDate.toISOString().split('T')[0];
        if (!bookings[currentKey] || !bookings[currentKey][roomType] || !bookings[currentKey][roomType][roomNumber]) {
            break;
        }
    }
    return currentDate.getDate() - 1; // Return the last day of the booking
};


const getStatusClass = (status) => {
    if (status.includes('Occupied by')) return 'occupied';
    if (status.includes('Booked by')) return 'booked';
    if (status.includes('out of order')) return 'out-of-order'; // Notice the case sensitivity
    return '';
}



// Function to update availability visually in the day cell
const updateAvailability = (dayCell, date) => {
    let totalAvailableRooms = 0;
    const availabilityHtml = Object.entries(roomDetails).map(([type, numbers]) => {
        const availableCount = getAvailableRooms(type, date);
        totalAvailableRooms += availableCount;
        return `<div>${type}: ${availableCount} available of ${numbers.length}</div>`;
    });

    const totalRoomsClass = totalAvailableRooms > 0 ? 'total-rooms-available' : 'total-room-not-available';
    dayCell.innerHTML += `<div class="${totalRoomsClass}">${totalAvailableRooms}</div>`;
};

const renderCalendar = (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';
    calendarContainer.style.gridTemplateColumns = `150px repeat(${visibleDays}, 1fr)`;

    const headerRow = createElements('div', 'calendar-row');
    const roomLabelCell = createElements('div', 'room-label', 'Room');
    headerRow.appendChild(roomLabelCell);
    appendDateCells(year, monthIndex, daysInMonth, headerRow);
    calendarContainer.appendChild(headerRow);

    Object.entries(roomDetails).forEach(([roomType, roomNumbers]) => {
        const roomTypeContainer = createRoomTypeContainer(roomType, roomNumbers, year, monthIndex, daysInMonth);
        calendarContainer.appendChild(roomTypeContainer);
    });
};  

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
    bookRoom('Single Room', 101, '2024-05-08', '2024-05-09', 'Alice');
    bookRoom('Single Room', 103, '2024-05-04', '2024-05-05', 'Bob');
    bookRoom('Single Room', 102, '2024-05-03', '2024-05-04', 'Angel');
    bookRoom('Double Room', 202, '2024-01-01', '2024-01-03', 'Babu');
    bookRoom('Single Room', 101, '2024-05-04', '2024-05-05', 'Ancy');
    bookRoom('Family Room', 302, '2024-05-04', '2024-05-05', 'Biju');
    bookRoom('Double Room', 201, '2024-05-01', '2024-05-02', 'Anu');
    bookRoom('Single Room', 102, '2024-05-09', '2024-05-10', 'Baiju');
    // Assume the current month to render is January 2024 to see the bookings
    renderCalendar(2024, 0);  // Rendering January 2024
    applyHoverEffects();  // Apply visual effects to the calendar
    
});
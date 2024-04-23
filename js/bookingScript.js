// Data initialization
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
let currentStartYear = 2011;
let selectedYear = new Date().getFullYear();
let selectedMonthIndex = 0;
let currentStartIndex = 0;
let zoomLevel = 1;

const createElements = (tagName, className, textContent = '') => {
    const element = document.createElement(tagName);
    element.className = className;
    if (textContent) element.textContent = textContent;
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
    const monthNavigation = document.getElementById('month-navigation');
    monthNavigation.innerHTML = '';  // Clear to prevent duplication
    // Setup month buttons
    months.forEach((month, index) => {
        const button = createButton(monthNavigation, 'month-button', month, () => {
            // Remove active class from all buttons first
            document.querySelectorAll('.month-button').forEach(btn => btn.classList.remove('active'));
            // Set the active class on the clicked button
            button.classList.add('active');
            selectedMonthIndex = index;
            renderCalendar(selectedYear, selectedMonthIndex);
        });
        // Initially set the active class if it's the current month
        if (index === selectedMonthIndex) {
            button.classList.add('active');
        }
    });
    
    // Setup year and month navigation buttons
    const setupNavigationButton = (buttonId, adjustmentFunction) => {
        const button = document.getElementById(buttonId);
        button.addEventListener('click', adjustmentFunction);
    };
    setupNavigationButton('prev-button', () => adjustYear(-1));
    setupNavigationButton('next-button', () => adjustYear(1));
    setupNavigationButton('prev-month-button', () => adjustMonth(-visibleDays));
    setupNavigationButton('next-month-button', () => adjustMonth(visibleDays));
    
    return { monthNavigation };
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

// Populate the year buttons
const populateYears = (startYear, total) => {
    const yearGrid = document.getElementById('year-grid');
    yearGrid.innerHTML = '';  // Clear existing buttons

    for (let year = startYear; year < startYear + total; year++) {
        const yearButton = document.createElement('button');
        yearButton.textContent = year;
        yearButton.className = 'yearButton';
        yearButton.addEventListener('click', () => {
            // Remove active class from all year buttons
            document.querySelectorAll('.yearButton').forEach(btn => btn.classList.remove('active'));
            // Add active class to the clicked button
            yearButton.classList.add('active');
            selectedYear = year;
            renderCalendar(selectedYear, selectedMonthIndex);
        });
        // Set the active class if it's the currently selected year
        if (year === selectedYear) {
            yearButton.classList.add('active');
        }
        yearGrid.appendChild(yearButton);
    }
};

// Render the calendar based on selected year and month
const renderCalendar = (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';
    calendarContainer.style.gridTemplateColumns = `150px repeat(${visibleDays}, 1fr)`;

    // Header row for dates
    const headerRow = createElements('div', 'calendar-row');
    const roomLabelCell = createElements('div', 'room-label', 'Room');
    headerRow.appendChild(roomLabelCell);

    for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
        const date = new Date(year, monthIndex, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayCell = createElements('div', 'day-cell');
        dayCell.innerHTML = `<div>${dayName}</div><div>${day}</div>`;  // Use innerHTML here
        headerRow.appendChild(dayCell);
    }
    calendarContainer.appendChild(headerRow);

    // Rows for room types and room numbers
    Object.entries(roomDetails).forEach(([roomType, roomNumbers]) => {
        const roomTypeRow = createElements('div', 'calendar-row room-type-row');
        const roomTypeCell = createElements('div', 'room-type', roomType);
        roomTypeRow.appendChild(roomTypeCell);

        for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
            const typeDateCell = createElements('div', 'date-cell');
            typeDateCell.innerHTML = `<div><span class='total-box'>${roomNumbers.length}</span></div>`;  // Use innerHTML here
            roomTypeRow.appendChild(typeDateCell);
        }
        calendarContainer.appendChild(roomTypeRow);

        roomNumbers.forEach(roomNumber => {
            const roomNumberRow = createElements('div', 'calendar-row room-number-row');
            const roomNumberCell = createElements('div', 'room-number', roomNumber.toString());
            roomNumberRow.appendChild(roomNumberCell);
            for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
                const numberDateCell = createElements('div', 'date-cell');
                roomNumberRow.appendChild(numberDateCell);
            }
            calendarContainer.appendChild(roomNumberRow);
        });
    });
};
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

// Initialize everything once the DOM is fully loaded
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
    renderCalendar(selectedYear, selectedMonthIndex);  // Render the initial view of the calendar
    applyHoverEffects();  // Apply visual effects to the calendar
});

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

const createElement = (tagName, className, textContent = '') => {
    const element = document.createElement(tagName);
    element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
};
const createButton = (container, className, text, onClick) => {
    const button = createElement('button', className, text);
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
    const yearGrid = document.getElementById('year-grid');
    const monthNavigation = document.getElementById('month-navigation');
    monthNavigation.innerHTML = '';  // Clear to prevent duplication

    // Setup month buttons
    months.forEach((month, index) => {
        createButton(monthNavigation, 'monthButton', month, () => {
            selectedMonthIndex = index;
            renderCalendar(selectedYear, selectedMonthIndex);
        });
    });

    // Setup year and month navigation buttons
    const setupNavigationButton = (buttonId, adjustmentFunction) => {
        const button = document.getElementById(buttonId);
        createButton(button, buttonId, button.innerText, adjustmentFunction);
    };
    setupNavigationButton('prev-button', () => adjustYear(-1));
    setupNavigationButton('next-button', () => adjustYear(1));
    setupNavigationButton('prev-month-button', () => adjustMonth(-visibleDays));
    setupNavigationButton('next-month-button', () => adjustMonth(visibleDays));
        
    return { yearGrid, monthNavigation };
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
            selectedYear = year;
            renderCalendar(selectedYear, selectedMonthIndex);
        });
        yearGrid.appendChild(yearButton);
    }
};
// Render the calendar based on selected year and month
const renderCalendar = (year, monthIndex) => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const calendarContainer = document.getElementById('calendarContainer');
    calendarContainer.innerHTML = '';
    calendarContainer.style.gridTemplateColumns = `150px repeat(${visibleDays}, 1fr)`;

    // Header row for dates
    const headerRow = createElement('div', 'calendar-row');
    const roomLabelCell = createElement('div', 'room-label', 'Room');
    headerRow.appendChild(roomLabelCell);

    for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
        const date = new Date(year, monthIndex, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayCell = createElement('div', 'day-cell');
        dayCell.innerHTML = `<div>${dayName}</div><div>${day}</div>`;  // Use innerHTML here
        headerRow.appendChild(dayCell);
    }
    calendarContainer.appendChild(headerRow);

    // Rows for room types and room numbers
    Object.entries(roomDetails).forEach(([roomType, roomNumbers]) => {
        const roomTypeRow = createElement('div', 'calendar-row room-type-row');
        const roomTypeCell = createElement('div', 'room-type', roomType);
        roomTypeRow.appendChild(roomTypeCell);

        for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
            const typeDateCell = createElement('div', 'date-cell');
            typeDateCell.innerHTML = `<div><span class='total-box'>${roomNumbers.length}</span></div>`;  // Use innerHTML here
            roomTypeRow.appendChild(typeDateCell);
        }
        calendarContainer.appendChild(roomTypeRow);

        roomNumbers.forEach(roomNumber => {
            const roomNumberRow = createElement('div', 'calendar-row room-number-row');
            const roomNumberCell = createElement('div', 'room-number', roomNumber.toString());
            roomNumberRow.appendChild(roomNumberCell);
            for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
                const numberDateCell = createElement('div', 'date-cell');
                roomNumberRow.appendChild(numberDateCell);
            }
            calendarContainer.appendChild(roomNumberRow);
        });
    });
};
// Function to add hover effects to calendar cells
const applyHoverEffects = () => {
    const calendarContainer = document.getElementById('calendarContainer'); // Assuming this is the parent container of all rows

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
    populateSelect('reservation-typeselect', reservationTypes, "Reservation Type");
    populateSelect('room-typeselect', roomTypes, "Room Type");
    populateSelect('floorSelect', floors, "Floor");
    setupControls();  // Setup year and month navigation controls
    populateYears(currentStartYear, totalYears);  // Populate the year buttons
    renderCalendar(selectedYear, selectedMonthIndex);  // Render the initial view of the calendar
    applyHoverEffects();  // Apply visual effects to the calendar
});

document.addEventListener('DOMContentLoaded', () => {
    const totalYears = 15;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const visibleDays = 12; // Number of days to display at a time
    const floors = ["1st Floor", "2nd Floor", "3rd Floor"];
    const reservationTypes = ["Deluxe","Standard", "VIP", "Group"];
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
    let zoomLevel = 1

    const zoomInButton = document.getElementById('zoomImage')
    const controls = setupControls();
    
    
        function populateSelect(selectId, options, placeholder) {
            const selectElement = document.getElementById(selectId);
            const placeholderOption = document.createElement('option');  // Add placeholder option
            placeholderOption.textContent = placeholder; // Placeholder text
            placeholderOption.value = "";               // No value
            placeholderOption.disabled = true;          // Disable selection
            placeholderOption.selected = true;          // Set as default selected
            selectElement.appendChild(placeholderOption);
         
            options.forEach(optionText => {     // Append each option
                const option = document.createElement('option');
                option.value = optionText;
                option.textContent = optionText;
                selectElement.appendChild(option);
            });
        }
        // Populate selects on page load or appropriate event
            populateSelect('reservationTypeSelect', reservationTypes, "Reservation Type");
            populateSelect('roomTypeSelect', roomTypes, "Room Type");
            populateSelect('floorSelect', floors, "Floor");
        

    

    zoomInButton.addEventListener('click', () => {
        zoomLevel += 0.1;  // Increment zoom level by 10%
        document.body.style.zoom = zoomLevel;
    });
    function setupControls() {
        const yearGrid = document.getElementById('yearGrid');
        const monthNavigation = document.getElementById('monthNavigation');
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        const prevMonthButton = document.getElementById('prevMonthButton');
        const nextMonthButton = document.getElementById('nextMonthButton');

        months.forEach((month, index) => {
            const monthButton = document.createElement('span');
            monthButton.textContent = month;
            monthButton.className = 'monthButton';
            monthButton.addEventListener('click', () => {
                selectedMonthIndex = index;
                renderCalendar(selectedYear, selectedMonthIndex);
            });
            monthNavigation.appendChild(monthButton);
        });

        const adjustSelectedYear = (currentSelected, start, total) => (currentSelected < start || currentSelected >= start + total) ? start : currentSelected;
        prevButton.addEventListener('click', () => {
            currentStartYear -= totalYears;
            selectedYear = adjustSelectedYear(selectedYear, currentStartYear, totalYears);
            populateYears(currentStartYear, totalYears);
            renderCalendar(selectedYear, selectedMonthIndex);
        });

        nextButton.addEventListener('click', () => {
            currentStartYear += totalYears;
            selectedYear = adjustSelectedYear(selectedYear, currentStartYear, totalYears);
            populateYears(currentStartYear, totalYears);
            renderCalendar(selectedYear, selectedMonthIndex);
        });

        prevMonthButton.addEventListener('click', () => {
            currentStartIndex = Math.max(0, currentStartIndex - visibleDays);
            renderCalendar(selectedYear, selectedMonthIndex);
        });

        nextMonthButton.addEventListener('click', () => {
            const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
            currentStartIndex = Math.min(daysInMonth - visibleDays, currentStartIndex + visibleDays);
            renderCalendar(selectedYear, selectedMonthIndex);
        });

        return { yearGrid, monthNavigation };
    }

    function populateYears(startYear, total) {
        const { yearGrid } = controls;
        yearGrid.innerHTML = '';
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
    }
    
    function renderCalendar(year, monthIndex) {
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const calendarContainer = document.getElementById('calendarContainer');
        calendarContainer.innerHTML = '';
        calendarContainer.style.gridTemplateColumns = `150px repeat(${visibleDays}, 1fr)`;
    
        // Header row for dates
        const headerRow = document.createElement('div');
        headerRow.className = 'calendar-row';
        const roomLabelCell = document.createElement('div');
        roomLabelCell.className = 'room-label';
        roomLabelCell.textContent = 'Room';
        headerRow.appendChild(roomLabelCell);
    
        for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
            const date = new Date(year, monthIndex, day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.innerHTML = `<div>${dayName}</div><div>${day}</div>`;
            headerRow.appendChild(dayCell);
        }
        calendarContainer.appendChild(headerRow);
    
        // Rows for room types and room numbers
        Object.entries(roomDetails).forEach(([roomType, roomNumbers]) => {
            const roomTypeRow = document.createElement('div');
            roomTypeRow.className = 'calendar-row room-type-row';
            const roomTypeCell = document.createElement('div');
            roomTypeCell.className = 'room-type';
            roomTypeCell.textContent = roomType;
            roomTypeRow.appendChild(roomTypeCell);
    
            for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
                const typeDateCell = document.createElement('div');
                typeDateCell.className = 'date-cell';
                typeDateCell.innerHTML = `<div><span class='total-box'>${roomNumbers.length}</span></div>`;
                roomTypeRow.appendChild(typeDateCell);
            }
            calendarContainer.appendChild(roomTypeRow);
    
            roomNumbers.forEach(roomNumber => {
                const roomNumberRow = document.createElement('div');
                roomNumberRow.className = 'calendar-row room-number-row';
                const roomNumberCell = document.createElement('div');
                roomNumberCell.className = 'room-number';
                roomNumberCell.textContent = roomNumber;
                roomNumberRow.appendChild(roomNumberCell);
    
                for (let day = currentStartIndex + 1; day <= Math.min(currentStartIndex + visibleDays, daysInMonth); day++) {
                    const numberDateCell = document.createElement('div');
                    numberDateCell.className = 'date-cell';
                    roomNumberRow.appendChild(numberDateCell);
                }
                calendarContainer.appendChild(roomNumberRow);
            });
        });
    
        applyHoverEffects();
    }
    
    populateYears(currentStartYear, totalYears);
    renderCalendar(selectedYear, selectedMonthIndex);
    
    function applyHoverEffects() {
        const cells = document.querySelectorAll('.calendar-grid .date-cell, .calendar-grid .room-number');
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', () => {
                const row = cell.parentNode;
                Array.from(row.children).forEach(child => child.classList.add('hover-effect'));

                const columnIndex = Array.from(row.children).indexOf(cell);
                const allRows = document.querySelectorAll('.calendar-row');
                allRows.forEach(currentRow => {
                    if (currentRow.children[columnIndex]) {
                        currentRow.children[columnIndex].classList.add('hover-effect');
                    }
                });
            });

            cell.addEventListener('mouseleave', () => {
                document.querySelectorAll('.hover-effect').forEach(hovered => hovered.classList.remove('hover-effect'));
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const totalYears = 15;
    const minYear = 2001;
    const maxYear = 2027;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let currentStartYear = 2011;
    let selectedYear = new Date().getFullYear();
    let selectedMonthIndex = 0;
    let currentStartIndex = 0;
    const visibleDays = 12; // Number of days to display at a time
    const roomDetails = {
        'Single Room': [101, 102, 103],
        'Double Room': [201, 202, 203],
        'Family Room': [301, 302, 303]
    };

    const calendarContainer = document.createElement('div');
    calendarContainer.id = 'calendarContainer';
    calendarContainer.className = 'calendar-grid';
    document.body.appendChild(calendarContainer);

    const yearGrid = document.getElementById('yearGrid');
    const monthNavigation = document.getElementById('monthNavigation');
    const monthScrollContainer = document.getElementById('monthScrollContainer');
    const prevMonthButton = document.getElementById('prevMonthButton');
    const nextMonthButton = document.getElementById('nextMonthButton');

    const renderCalendar = (year, monthIndex) => {
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        calendarContainer.innerHTML = '';
        calendarContainer.style.gridTemplateColumns = `150px repeat(${visibleDays}, 1fr)`;
    
        // Header row for dates
        const headerRow = document.createElement('div');
        headerRow.className = 'calendar-row';
        const roomLabelCell = document.createElement('div');
        roomLabelCell.className = 'room-label';
        roomLabelCell.textContent = 'Room';
        headerRow.appendChild(roomLabelCell);
    
        const endIndex = Math.min(currentStartIndex + visibleDays, daysInMonth);
        for (let day = currentStartIndex + 1; day <= endIndex; day++) {
            const date = new Date(year, monthIndex, day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.innerHTML = `<div>${dayName}</div><div>${day}</div>`; // Use innerHTML to format day name and number on separate lines
            headerRow.appendChild(dayCell);
        }
        calendarContainer.appendChild(headerRow);
    
        // Rows for room types and numbers
        Object.entries(roomDetails).forEach(([roomType, roomNumbers]) => {
            const roomTypeRow = document.createElement('div');
            roomTypeRow.className = 'calendar-row room-type-row';
            const roomTypeCell = document.createElement('div');
            roomTypeCell.textContent = roomType;
            roomTypeCell.className = 'room-type';
            roomTypeRow.appendChild(roomTypeCell);
    
            for (let day = currentStartIndex + 1; day <= endIndex; day++) {
                const typeDateCell = document.createElement('div');
                typeDateCell.className = 'date-cell';
                roomTypeRow.appendChild(typeDateCell);
            }
            calendarContainer.appendChild(roomTypeRow);
    
            // Rows for each room number
            roomNumbers.forEach(roomNumber => {
                const roomNumberRow = document.createElement('div');
                roomNumberRow.className = 'calendar-row room-number-row';
                const roomNumberCell = document.createElement('div');
                roomNumberCell.textContent = roomNumber;
                roomNumberCell.className = 'room-number';
                roomNumberRow.appendChild(roomNumberCell);
    
                for (let day = currentStartIndex + 1; day <= endIndex; day++) {
                    const numberDateCell = document.createElement('div');
                    numberDateCell.className = 'date-cell';
                    roomNumberRow.appendChild(numberDateCell);
                }
                calendarContainer.appendChild(roomNumberRow);
            });
        });
    };
    
    const populateYears = () => {
        yearGrid.innerHTML = '';
        for (let year = currentStartYear; year < currentStartYear + totalYears; year++) {
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

    prevMonthButton.addEventListener('click', () => {
        currentStartIndex = Math.max(0, currentStartIndex - visibleDays);
        renderCalendar(selectedYear, selectedMonthIndex);
    });
    nextMonthButton.addEventListener('click', () => {
        currentStartIndex = Math.min(daysInMonth - visibleDays, currentStartIndex + visibleDays);
        renderCalendar(selectedYear, selectedMonthIndex);
    });

    populateYears(); // Initialize year buttons
    renderCalendar(selectedYear, selectedMonthIndex); // Initial calendar rendering
});


// script.js
document.addEventListener('DOMContentLoaded', function () {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const emailInput = document.getElementById('email');
    const filterButton = document.getElementById('filterButton');
    const dataTableBody = document.querySelector('#dataTable tbody');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    let csvData = [];
    let filteredData = [];
    let currentPage = 1;
    const rowsPerPage = 25;

    // Load CSV data
    fetch('database.csv')
        .then(response => response.text())
        .then(data => {
            csvData = parseCSV(data);
            populateFilters();
            filteredData = csvData; // Initialize filteredData with all data
            displayData(filteredData, currentPage); // Display first page
            updatePaginationControls();
        })
        .catch(error => {
            console.error("Error fetching CSV:", error);
        });

    // Parse CSV data
    function parseCSV(csv) {
        const rows = csv.split('\n').slice(1); // Skip the header row
        return rows
            .map(row => {
                // Remove extra quotes and split the row into columns
                const cleanedRow = row.replace(/"/g, '').trim();
                if (!cleanedRow) return null; // Skip empty rows

                const [year, month, email, model_id, pages, documents] = cleanedRow.split(',');
                return { year, month, email, model_id, pages, documents };
            })
            .filter(row => row !== null); // Remove null rows (empty rows)
    }

    // Populate filters
    function populateFilters() {
        // Populate year dropdown from 2024 to the current year
        const currentYear = new Date().getFullYear();
        for (let year = 2024; year <= currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }

        // Populate month dropdown with all 12 months
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        months.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }

    // Filter data
    filterButton.addEventListener('click', () => {
        const selectedYear = yearSelect.value;
        const selectedMonth = monthSelect.value;
        const emailFilter = emailInput.value.trim().toLowerCase();

        filteredData = csvData.filter(row => {
            return (!selectedYear || row.year === selectedYear) &&
                   (!selectedMonth || row.month === selectedMonth) &&
                   (!emailFilter || row.email.toLowerCase().includes(emailFilter));
        });

        currentPage = 1; // Reset to the first page after filtering
        displayData(filteredData, currentPage);
        updatePaginationControls();
    });

    // Display data in table
    function displayData(data, page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedData = data.slice(start, end);

        dataTableBody.innerHTML = ''; // Clear the table
        paginatedData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.year}</td>
                <td>${row.month}</td>
                <td>${row.email}</td>
                <td>${row.model_id}</td>
                <td>${formatNumber(row.pages)}</td>
                <td>${formatNumber(row.documents)}</td>
            `;
            dataTableBody.appendChild(tr);
        });

        updatePaginationControls();
    }

    // Format numbers with thousand separators
    function formatNumber(number) {
        return Number(number).toLocaleString('de-DE'); // Use 'de-DE' for dots as thousand separators
    }

    // Update pagination controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    // Pagination event listeners
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData(filteredData, currentPage);
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayData(filteredData, currentPage);
        }
    });
});
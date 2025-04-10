console.log("Content script loaded");

// Function to get attendance status color
function getStatusColor(percentage) {
    if (percentage >= 85) return '#2E7D32';  // Darker green for better contrast
    if (percentage >= 75) return '#F57C00';  // Darker amber
    return '#D32F2F';  // Darker red
}

// Function to get attendance status text
function getStatusText(percentage) {
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 75) return 'Satisfactory';
    return 'Needs Improvement';
}

// Function to add custom styles
function addCustomStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .summary-row {
            transition: all 0.3s ease;
            border-top: 2px solid #dee2e6 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .summary-row:hover {
            background-color: #f8f9fa !important;
        }
        .attendance-pill {
            padding: 6px 16px;
            border-radius: 20px;
            color: white;
            font-weight: 600;
            display: inline-block;
            min-width: 110px;
            text-align: center;
            font-size: 1.1em;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.9em;
            margin-left: 8px;
            color: white;
            font-weight: 500;
            letter-spacing: 0.3px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stats-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background-color: #ffffff;
            border-radius: 8px;
            margin: 8px 0;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .summary-title {
            font-size: 1.2em;
            font-weight: 600;
            color: #1a237e;
            margin-bottom: 8px;
            letter-spacing: -0.3px;
        }
        .summary-stats {
            font-size: 1.05em;
            color: #424242;
            font-weight: 500;
        }
        .stats-highlight {
            color: #1a237e;
            font-weight: 600;
        }
        .summary-section {
            flex: 1;
            margin-right: 20px;
        }
        .percentage-section {
            text-align: right;
            min-width: 160px;
        }
    `;
    document.head.appendChild(style);
}

// Function to initialize the attendance calculator
function initAttendanceCalculator() {
    console.log("Initializing attendance calculator");
    console.log("Current URL:", window.location.href);

    // Add custom styles
    addCustomStyles();

    // Get the current URL
    const currentUrl = window.location.href;

    if (currentUrl.includes('action=std_bio')) {
        console.log("On biometric attendance page");
        // Handle biometric attendance page
        const table = document.querySelector("table.table-striped");
        console.log("Found table:", table);

        if (!table) {
            console.log("Table not found");
            return;
        }

        const rows = table.querySelectorAll("tbody tr");
        console.log("Total rows found:", rows.length);
        
        let totalDays = rows.length - 1;
        let presentDays = 0;

        rows.forEach((row, index) => {
            const cells = row.querySelectorAll("td");
            console.log(`Row ${index} cells:`, cells.length);
            if (cells.length >= 7) {
                const status = cells[6].innerText.trim();
                console.log(`Row ${index} status:`, status);
                if (status === 'Present') {
                    presentDays++;
                }
            }
        });

        console.log(`Present days: ${presentDays}, Total days: ${totalDays}`);
        const attendancePercent = ((presentDays / totalDays) * 100).toFixed(2);
        const statusColor = getStatusColor(parseFloat(attendancePercent));
        const statusText = getStatusText(parseFloat(attendancePercent));
        
        // Remove existing summary row if any
        const existingSummary = table.querySelector("tr.summary-row");
        if (existingSummary) {
            existingSummary.remove();
        }

        const summaryRow = document.createElement("tr");
        summaryRow.className = "summary-row";

        // Create the summary content with enhanced styling
        summaryRow.innerHTML = `
            <td colspan="8">
                <div class="stats-container">
                    <div class="summary-section">
                        <div class="summary-title">Attendance Summary</div>
                        <div class="summary-stats">
                            <span class="stats-highlight">${presentDays}</span> days present out of 
                            <span class="stats-highlight">${totalDays}</span> total days
                        </div>
                    </div>
                    <div class="percentage-section">
                        <div class="attendance-pill" style="background-color: ${statusColor}">
                            ${attendancePercent}%
                        </div>
                        <div style="margin-top: 8px;">
                            <span class="status-badge" style="background-color: ${statusColor}">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        table.querySelector("tbody").appendChild(summaryRow);

    } else {
        console.log("On regular attendance page");
        // Handle regular attendance page
        const tables = document.querySelectorAll("table");
        const attendanceTable = tables[tables.length - 1];
        if (!attendanceTable) {
            console.log("Attendance table not found");
            return;
        }

        const rows = attendanceTable.querySelectorAll("tbody tr");
        let totalPercent = 0;
        let validCount = 0;
        let subjectData = [];

        rows.forEach((row, index) => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 8) {
                const percentText = cells[7].innerText.trim();
                const percent = parseFloat(percentText);
                if (!isNaN(percent) && percent > 0) {
                    totalPercent += percent;
                    validCount++;
                    subjectData.push({
                        subject: cells[1].innerText.trim(),
                        percent: percent
                    });
                }
            }
        });

        const average = validCount > 0 ? (totalPercent / validCount).toFixed(2) : 'N/A';
        const statusColor = getStatusColor(parseFloat(average));
        const statusText = getStatusText(parseFloat(average));

        // Remove existing average row if any
        const existingAverage = attendanceTable.querySelector("tr.summary-row");
        if (existingAverage) {
            existingAverage.remove();
        }

        const averageRow = document.createElement("tr");
        averageRow.className = "summary-row";

        // Create the summary content with enhanced styling
        averageRow.innerHTML = `
            <td colspan="9">
                <div class="stats-container">
                    <div class="summary-section">
                        <div class="summary-title">Overall Attendance Summary</div>
                        
                    </div>
                    <div class="percentage-section">
                        <div class="attendance-pill" style="background-color: ${statusColor}">
                            ${average}%
                        </div>
                        <div style="margin-top: 8px;">
                            <span class="status-badge" style="background-color: ${statusColor}">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        attendanceTable.querySelector("tbody").appendChild(averageRow);
    }
}

// Try both DOMContentLoaded and load events
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded event fired");
    initAttendanceCalculator();
});

window.addEventListener('load', function() {
    console.log("Window load event fired");
    initAttendanceCalculator();
});


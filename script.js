document.addEventListener('DOMContentLoaded', function() {
    initializeButtons();
    initializeTableCells();
    initializeSensorInputs();
    setupRealTimeUpdates();
});

// Button Functionality
function initializeButtons() {
    const saveBtn = document.querySelector('.save-btn');
    const loadBtn = document.querySelector('.load-btn');
    const connectBtn = document.querySelector('.connect-btn');

    saveBtn.addEventListener('click', handleSave);
    loadBtn.addEventListener('click', handleLoad);
    connectBtn.addEventListener('click', handleConnect);
}

// Save, Load, and Connect Functions
function handleSave() {
    const data = {
        parameters: collectParametersData(),
        speedMap: collectSpeedMapData(),
        sensorSettings: collectSensorData(),
        trimSettings: collectTrimData(),
        actuatorSettings: collectActuatorData()
    };

    // Convert to JSON and save
    const jsonData = JSON.stringify(data);
    localStorage.setItem('engineSettings', jsonData);
    alert('Settings saved successfully');
}

function handleLoad() {
    try {
        const savedData = localStorage.getItem('engineSettings');
        if (savedData) {
            const data = JSON.parse(savedData);
            loadParametersData(data.parameters);
            loadSpeedMapData(data.speedMap);
            loadSensorData(data.sensorSettings);
            loadTrimData(data.trimSettings);
            loadActuatorData(data.actuatorSettings);
            alert('Settings loaded successfully');
        } else {
            alert('No saved settings found');
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        alert('Error loading settings');
    }
}

let isConnected = false;
let updateInterval;

function handleConnect() {
    const connectBtn = document.querySelector('.connect-btn');
    const connectText = connectBtn.querySelector('span');
    const connectIcon = connectBtn.querySelector('i');
    
    isConnected = !isConnected;

    if (isConnected) {
        connectBtn.classList.add('active');
        connectText.textContent = 'Connected';
        connectIcon.classList.remove('fa-plug');
        connectIcon.classList.add('fa-plug-circle-check');
        startRealTimeUpdates();
    } else {
        connectBtn.classList.remove('active');
        connectText.textContent = 'Connect';
        connectIcon.classList.remove('fa-plug-circle-check');
        connectIcon.classList.add('fa-plug');
        stopRealTimeUpdates();
    }
}

// Table Cell Interaction
function initializeTableCells() {
    const editableCells = document.querySelectorAll('.speed-map-table td:not(:first-child):not(:first-child)');
    
    editableCells.forEach(cell => {
        cell.addEventListener('click', function() {
            if (!this.hasAttribute('contenteditable')) {
                this.setAttribute('contenteditable', 'true');
                this.focus();
            }
        });

        cell.addEventListener('blur', function() {
            this.removeAttribute('contenteditable');
            validateCellValue(this);
        });

        cell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    });
}

// Sensor Input Handling
function initializeSensorInputs() {
    const sensorInputs = document.querySelectorAll('.slope-offset input');
    
    sensorInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateSensorInput(this);
            updateSensorCalculations();
        });
    });
}

// Data Collection Functions
function collectParametersData() {
    const data = {};
    const paramRows = document.querySelectorAll('.params-table tr');
    paramRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
            data[cells[0].textContent] = cells[1].textContent;
        }
    });
    return data;
}

function collectSpeedMapData() {
    const data = [];
    const rows = document.querySelectorAll('.speed-map-table tr');
    rows.forEach(row => {
        const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent);
        data.push(rowData);
    });
    return data;
}

function collectSensorData() {
    const data = {};
    const sensorBoxes = document.querySelectorAll('.sensor-box');
    sensorBoxes.forEach(box => {
        const name = box.querySelector('h4').textContent;
        const inputs = box.querySelectorAll('input');
        data[name] = {
            slope: inputs[0].value,
            offset: inputs[1].value
        };
    });
    return data;
}

function collectTrimData() {
    const data = [];
    const rows = document.querySelectorAll('.trim-table tr');
    rows.forEach(row => {
        const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent);
        data.push(rowData);
    });
    return data;
}

function collectActuatorData() {
    const data = {};
    const actuatorTables = document.querySelectorAll('.actuator-table');
    actuatorTables.forEach(table => {
        const name = table.querySelector('th').textContent;
        const rows = table.querySelectorAll('tr');
        const tableData = Array.from(rows).map(row => 
            Array.from(row.querySelectorAll('td')).map(cell => cell.textContent)
        );
        data[name] = tableData;
    });
    return data;
}

// Validation Functions
function validateCellValue(cell) {
    let value = cell.textContent.trim();
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        cell.textContent = '0';
        cell.classList.add('error');
    } else {
        cell.textContent = numValue.toFixed(1);
        cell.classList.remove('error');
    }
    
    updateCalculations();
}

function validateSensorInput(input) {
    const value = parseFloat(input.value);
    if (isNaN(value)) {
        input.value = '0';
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}

// Real-time Updates
function startRealTimeUpdates() {
    updateInterval = setInterval(() => {
        if (isConnected) {
            updateRealTimeValues();
        }
    }, 1000);
}

function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}

function updateRealTimeValues() {
    // Update highlighted cells with simulated values
    const highlightedCells = document.querySelectorAll('.highlight');
    highlightedCells.forEach(cell => {
        const currentValue = parseFloat(cell.textContent);
        const newValue = currentValue + (Math.random() - 0.5) * 0.1;
        cell.textContent = newValue.toFixed(3);
    });
}

// Utility Functions
function updateCalculations() {
    updateFuellingIndicator();
    updateActualValues();
}

function updateFuellingIndicator() {
    const fuellingSpan = document.querySelector('.fuelling-indicator .highlight');
    if (fuellingSpan) {
        const currentValue = parseFloat(fuellingSpan.textContent);
        // Add your fuelling calculation logic here
        fuellingSpan.textContent = currentValue.toFixed(1);
    }
}

function updateActualValues() {
    const actualCells = document.querySelectorAll('.actuator-table tr:last-child td:last-child');
    actualCells.forEach(cell => {
        const currentValue = parseFloat(cell.textContent);
        // Add your actual value calculation logic here
        cell.textContent = currentValue.toFixed(4);
    });
}

// Error Handling
function handleError(error) {
    console.error('Error:', error);
    alert('An error occurred. Please check the console for details.');
}

// Add window resize handler for responsive adjustments
window.addEventListener('resize', function() {
    adjustTableLayout();
});

function adjustTableLayout() {
    const container = document.querySelector('.container');
    const width = window.innerWidth;
    
    if (width < 768) {
        container.classList.add('mobile');
    } else {
        container.classList.remove('mobile');
    }
}

// Enhanced functionality
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="loading-indicator"></span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add smooth transitions between data updates
function updateValue(element, newValue) {
    const currentValue = parseFloat(element.textContent);
    const steps = 20;
    const increment = (newValue - currentValue) / steps;
    let current = currentValue;
    
    const animate = () => {
        current += increment;
        element.textContent = current.toFixed(4);
        
        if (Math.abs(current - newValue) > Math.abs(increment)) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = newValue.toFixed(4);
        }
    };
    
    requestAnimationFrame(animate);
}

// Add connection status indicator
function updateConnectionStatus(status) {
    const indicator = document.createElement('div');
    indicator.className = `status-indicator ${status}`;
    // Add to navbar
}
/**
 * Main UI Logic for Pediatrics Clerkship Sheet
 * Handles Tabs, Autosave, and Table Management
 */

document.addEventListener('DOMContentLoaded', () => {
    // Load saved data on startup
    loadFormData();
    
    // Initialize Progress Bar
    updateProgress();

    // Setup Autosave: Save every 30 seconds
    setInterval(saveFormData, 30000);
});

// --- Tab System ---
function showTab(tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    // Find button and set active
    event.currentTarget.classList.add('active');
    
    // Scroll to top of tab
    window.scrollTo(0, 0);
}

// --- Form Data Management ---
function gatherFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.id) {
            if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) formData[input.name] = input.value;
            } else {
                formData[input.id] = input.value;
            }
        }
    });
    return formData;
}

function saveFormData() {
    const data = gatherFormData();
    localStorage.setItem('clerkshipData', JSON.stringify(data));
    
    // Show a quick indicator
    const indicator = document.getElementById('autosaveIndicator');
    if (indicator) {
        indicator.style.display = 'block';
        setTimeout(() => indicator.style.display = 'none', 2000);
    }
}

function loadFormData() {
    const saved = localStorage.getItem('clerkshipData');
    if (!saved) return;

    const data = JSON.parse(saved);
    Object.keys(data).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = data[key];
            } else {
                el.value = data[key];
            }
        }
    });
}

// --- Table Row Management ---
function addRow(tableId) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const newRow = tbody.rows[0].cloneNode(true);
    
    // Clear inputs in the cloned row
    newRow.querySelectorAll('input, select').forEach(input => {
        input.value = '';
    });
    
    tbody.appendChild(newRow);
}

function removeRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    if (tbody.rows.length > 1) {
        row.remove();
    } else {
        alert("Cannot remove the last remaining row.");
    }
}

// --- UI Indicators ---
function updateProgress() {
    const inputs = document.querySelectorAll('input[required], textarea[required]');
    let filled = 0;
    
    inputs.forEach(input => {
        if (input.value.trim() !== '') filled++;
    });
    
    const percent = inputs.length > 0 ? (filled / inputs.length) * 100 : 0;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = percent + '%';
}

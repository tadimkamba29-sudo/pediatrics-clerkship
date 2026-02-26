/**
 * Main UI Logic for Pediatrics Clerkship Sheet
 * Handles Tabs, Autosave, Table Management, Dynamic Fields, and Event Listeners
 */

document.addEventListener('DOMContentLoaded', () => {
    // Load saved data on startup
    loadFormData();
    
    // Restore last active tab
    restoreActiveTab();
    
    // Initialize Progress Bar
    updateProgress();

    // Setup Autosave: Save every 2 seconds on any input
    setupAutosave();
    
    // Attach all event listeners
    attachEventListeners();
    
    // Initialize calculations on load
    calculateAge();
    calculateGrowth();
    updateVitalIndicators();
    interpretLabs();
    classifyNewborn();
    updateHistorySummary();
    
    // Initialize Z-scores if growth.js is loaded
    if (typeof calculateAllZScores === 'function') {
        calculateAllZScores();
    }
    
    // Initialize developmental milestones if growth.js is loaded
    if (typeof updateDevelopmentalMilestones === 'function') {
        updateDevelopmentalMilestones();
    }
});

// ============================================================================
// TAB SYSTEM WITH MEMORY
// ============================================================================

function showTab(tabId, btn) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.nav-tab').forEach(b => {
        b.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Activate the clicked button (passed as argument for reliability)
    if (btn) {
        btn.classList.add('active');
    }
    
    // Save active tab to localStorage
    localStorage.setItem('activeTab', tabId);
    
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restoreActiveTab() {
    const savedTab = localStorage.getItem('activeTab') || 'patient-info';
    const tabToShow = document.getElementById(savedTab);
    const buttonToActivate = document.querySelector(`[onclick*="${savedTab}"]`);
    
    if (tabToShow) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        tabToShow.classList.add('active');
    }
    
    if (buttonToActivate) {
        document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
        buttonToActivate.classList.add('active');
    }
}

// ============================================================================
// AUTOSAVE SYSTEM (2-second interval + manual save)
// ============================================================================

let autosaveInterval;
let lastSaveTime = null;

function setupAutosave() {
    // Auto-save every 2 seconds
    autosaveInterval = setInterval(() => {
        saveFormData(true); // true = silent save
    }, 2000);
    
    // Also save on any input change
    document.addEventListener('input', () => {
        updateProgress(); // Update progress bar on any change
    });
}

function saveFormData(silent = false) {
    const data = gatherFormData();
    localStorage.setItem('clerkshipData', JSON.stringify(data));
    
    // Update last saved timestamp
    lastSaveTime = new Date();
    updateSaveTimestamp();
    
    if (!silent) {
        showToast('Data saved successfully!', 'success');
    }
    
    // Show autosave indicator briefly
    const indicator = document.getElementById('autosaveIndicator');
    if (indicator && !silent) {
        indicator.style.display = 'block';
        setTimeout(() => indicator.style.display = 'none', 2000);
    }
}

function updateSaveTimestamp() {
    const timestampEl = document.getElementById('lastSaved');
    if (timestampEl && lastSaveTime) {
        const timeString = lastSaveTime.toLocaleTimeString();
        timestampEl.textContent = `Last saved: ${timeString}`;
    }
}

function clearAllData() {
    if (confirm('⚠️ Are you sure you want to clear ALL data? This cannot be undone!')) {
        localStorage.removeItem('clerkshipData');
        localStorage.removeItem('activeTab');
        location.reload();
    }
}

// ============================================================================
// FORM DATA GATHERING & LOADING (Enhanced)
// ============================================================================

function gatherFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        const key = input.id || input.name;
        if (!key) return;
        
        if (input.type === 'checkbox') {
            // Group checkboxes by name into arrays
            const name = input.name || input.id;
            if (name) {
                if (!formData[name]) formData[name] = [];
                if (input.checked) formData[name].push(input.value);
            }
        } else if (input.type === 'radio') {
            if (input.checked) formData[input.name] = input.value;
        } else {
            formData[key] = input.value;
        }
    });
    
    // Save dynamic tables state
    formData._dynamicTables = gatherDynamicTables();
    
    // Save progress notes
    formData._progressNotes = gatherProgressNotes();
    
    return formData;
}

function loadFormData() {
    const saved = localStorage.getItem('clerkshipData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        
        // Restore regular form fields
        Object.keys(data).forEach(key => {
            if (key === '_dynamicTables' || key === '_progressNotes') return; // Handle separately
            
            // Handle grouped checkbox arrays
            if (Array.isArray(data[key])) {
                data[key].forEach(value => {
                    const cb = document.querySelector(`input[type="checkbox"][name="${key}"][value="${value}"]`);
                    if (cb) cb.checked = true;
                });
                return;
            }
            
            const el = document.getElementById(key);
            if (!el) {
                // Try to find radio button by name
                const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
                return;
            }
            
            if (el.type === 'checkbox') {
                el.checked = data[key];
            } else if (el.type === 'radio') {
                if (el.value === data[key]) el.checked = true;
            } else {
                el.value = data[key];
            }
        });
        
        // Restore dynamic tables
        if (data._dynamicTables) {
            restoreDynamicTables(data._dynamicTables);
        }
        
        // Restore progress notes
        if (data._progressNotes) {
            restoreProgressNotes(data._progressNotes);
        }
        
        // Recalculate all computed fields
        calculateAge();
        calculateGrowth();
        updateVitalIndicators();
        interpretLabs();
        classifyNewborn();
        toggleConditionalFields();
        updateHistorySummary();
        
        // Recalculate Z-scores if growth.js is loaded
        if (typeof calculateAllZScores === 'function') {
            calculateAllZScores();
        }
        
        // Update developmental milestones if growth.js is loaded
        if (typeof updateDevelopmentalMilestones === 'function') {
            updateDevelopmentalMilestones();
        }
        
        console.log('Data loaded successfully');
    } catch (e) {
        console.error('Error loading saved data:', e);
        showToast('Error loading saved data', 'danger');
    }
}

// ============================================================================
// DYNAMIC TABLE MANAGEMENT (Add/Remove Rows)
// ============================================================================

function addRow(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const templateRow = tbody.rows[0];
    
    if (!templateRow) return;
    
    const newRow = templateRow.cloneNode(true);
    
    // Clear all inputs in the cloned row
    newRow.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    tbody.appendChild(newRow);
    saveFormData(true); // Silent save
}

function removeRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;
    
    if (tbody.rows.length > 1) {
        row.remove();
        saveFormData(true);
    } else {
        alert("Cannot remove the last row.");
    }
}

// Save/restore dynamic table contents
function gatherDynamicTables() {
    const tables = {};
    const tableIds = [
        'priorTreatmentTable',
        'pastIllnessesTable',
        'currentMedicationsTable',
        'siblingsTable',
        'problemListTable',
        'managementMedsTable',
        'investigationPlanTable',
        'neonatalMedicationsTable'
    ];
    
    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const rows = [];
        const tbody = table.querySelector('tbody');
        
        tbody.querySelectorAll('tr').forEach(row => {
            const rowData = [];
            row.querySelectorAll('input, textarea, select').forEach(input => {
                rowData.push(input.value);
            });
            rows.push(rowData);
        });
        
        tables[tableId] = rows;
    });
    
    return tables;
}

function restoreDynamicTables(tablesData) {
    Object.keys(tablesData).forEach(tableId => {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rowsData = tablesData[tableId];
        
        // Keep first row as template
        const firstRow = tbody.rows[0];
        if (!firstRow) return;
        
        // Clear tbody
        tbody.innerHTML = '';
        
        // Recreate all rows
        rowsData.forEach(rowData => {
            const newRow = firstRow.cloneNode(true);
            const inputs = newRow.querySelectorAll('input, textarea, select');
            
            rowData.forEach((value, idx) => {
                if (inputs[idx]) inputs[idx].value = value;
            });
            
            tbody.appendChild(newRow);
        });
        
        // Ensure at least one row
        if (tbody.rows.length === 0) {
            tbody.appendChild(firstRow);
        }
    });
}

// ============================================================================
// PROGRESS NOTES MANAGEMENT (Dynamic SOAP Notes)
// ============================================================================

function addProgressNote() {
    const container = document.getElementById('progressNotesContainer');
    if (!container) return;
    
    const noteCount = container.querySelectorAll('.progress-note-card').length + 1;
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16);
    
    const noteCard = document.createElement('div');
    noteCard.className = 'progress-note-card';
    noteCard.innerHTML = `
        <div class="note-header">
            <h4>Progress Note #${noteCount}</h4>
            <button type="button" class="btn-remove" onclick="removeProgressNote(this)">×</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" value="${dateTimeString}" class="form-control">
            </div>
        </div>
        <div class="form-group">
            <label>Subjective (S)</label>
            <textarea class="form-control" rows="3" placeholder="Patient/parent report, symptoms, concerns..."></textarea>
        </div>
        <div class="form-group">
            <label>Objective (O)</label>
            <textarea class="form-control" rows="3" placeholder="Vitals, physical exam findings, lab results..."></textarea>
        </div>
        <div class="form-group">
            <label>Assessment (A)</label>
            <textarea class="form-control" rows="3" placeholder="Clinical impression, differential diagnosis..."></textarea>
        </div>
        <div class="form-group">
            <label>Plan (P)</label>
            <textarea class="form-control" rows="3" placeholder="Treatment plan, investigations, follow-up..."></textarea>
        </div>
    `;
    
    container.appendChild(noteCard);
    saveFormData(true);
}

function removeProgressNote(btn) {
    const noteCard = btn.closest('.progress-note-card');
    if (confirm('Remove this progress note?')) {
        noteCard.remove();
        saveFormData(true);
    }
}

function gatherProgressNotes() {
    const container = document.getElementById('progressNotesContainer');
    if (!container) return [];
    
    const notes = [];
    container.querySelectorAll('.progress-note-card').forEach(card => {
        const datetime = card.querySelector('input[type="datetime-local"]')?.value;
        const textareas = card.querySelectorAll('textarea');
        
        notes.push({
            datetime: datetime,
            subjective: textareas[0]?.value || '',
            objective: textareas[1]?.value || '',
            assessment: textareas[2]?.value || '',
            plan: textareas[3]?.value || ''
        });
    });
    
    return notes;
}

function restoreProgressNotes(notesData) {
    const container = document.getElementById('progressNotesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    notesData.forEach((note, idx) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'progress-note-card';
        noteCard.innerHTML = `
            <div class="note-header">
                <h4>Progress Note #${idx + 1}</h4>
                <button type="button" class="btn-remove" onclick="removeProgressNote(this)">×</button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date & Time</label>
                    <input type="datetime-local" value="${note.datetime || ''}" class="form-control">
                </div>
            </div>
            <div class="form-group">
                <label>Subjective (S)</label>
                <textarea class="form-control" rows="3" placeholder="Patient/parent report, symptoms, concerns...">${note.subjective}</textarea>
            </div>
            <div class="form-group">
                <label>Objective (O)</label>
                <textarea class="form-control" rows="3" placeholder="Vitals, physical exam findings, lab results...">${note.objective}</textarea>
            </div>
            <div class="form-group">
                <label>Assessment (A)</label>
                <textarea class="form-control" rows="3" placeholder="Clinical impression, differential diagnosis...">${note.assessment}</textarea>
            </div>
            <div class="form-group">
                <label>Plan (P)</label>
                <textarea class="form-control" rows="3" placeholder="Treatment plan, investigations, follow-up...">${note.plan}</textarea>
            </div>
        `;
        container.appendChild(noteCard);
    });
}

// ============================================================================
// DIFFERENTIAL DIAGNOSIS MANAGEMENT (Add more differentials)
// ============================================================================

function addDifferential(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const count = container.querySelectorAll('.differential-item').length + 1;
    
    const diffItem = document.createElement('div');
    diffItem.className = 'differential-item';
    diffItem.innerHTML = `
        <div class="diff-header">
            <h4>Differential #${count}</h4>
            <button type="button" class="btn-remove" onclick="removeDifferential(this)">×</button>
        </div>
        <div class="form-group">
            <label>Diagnosis</label>
            <input type="text" class="form-control" placeholder="e.g., Pneumonia">
        </div>
        <div class="form-group">
            <label>Features Supporting</label>
            <textarea class="form-control" rows="2" placeholder="Clinical features that support this diagnosis"></textarea>
        </div>
        <div class="form-group">
            <label>Features Against</label>
            <textarea class="form-control" rows="2" placeholder="Clinical features that argue against this diagnosis"></textarea>
        </div>
    `;
    
    container.appendChild(diffItem);
    saveFormData(true);
}

function removeDifferential(btn) {
    const item = btn.closest('.differential-item');
    if (confirm('Remove this differential?')) {
        item.remove();
        saveFormData(true);
    }
}

// ============================================================================
// AUTO-SUMMARY FOR DIFF DX (FINAL)
// ============================================================================

function updateHistorySummary() {
    const summaryList = document.getElementById('historySummary');
    if (!summaryList) return;
    
    summaryList.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const feature = document.getElementById(`key_feature_${i}`)?.value;
        if (feature && feature.trim()) {
            const li = document.createElement('li');
            li.textContent = feature;
            summaryList.appendChild(li);
        }
    }
    
    if (summaryList.children.length === 0) {
        summaryList.innerHTML = '<li><em>No key features recorded yet</em></li>';
    }
}

// ============================================================================
// CONDITIONAL FIELD TOGGLES (Show/hide based on selections)
// ============================================================================

function toggleConditionalFields() {
    // C-section indication
    const deliveryMode = document.querySelector('input[name="delivery_mode"]:checked')?.value;
    const csectionField = document.getElementById('csection_indication_group');
    if (csectionField) {
        csectionField.style.display = deliveryMode === 'C-section' ? 'block' : 'none';
    }
    
    // NICU admission reason
    const nicuAdmission = document.querySelector('input[name="nicu_admission"]:checked')?.value;
    const nicuReasonField = document.getElementById('nicu_reason_group');
    if (nicuReasonField) {
        nicuReasonField.style.display = nicuAdmission === 'Yes' ? 'block' : 'none';
    }
    
    // Rash details
    const rash = document.querySelector('input[name="rash"]:checked')?.value;
    const rashDetails = document.getElementById('rash_details_group');
    if (rashDetails) {
        rashDetails.style.display = rash === 'Yes' ? 'block' : 'none';
    }
    
    // Developmental regression
    const regression = document.querySelector('input[name="dev_regression"]:checked')?.value;
    const regressionDetails = document.getElementById('regression_details_group');
    if (regressionDetails) {
        regressionDetails.style.display = regression === 'Yes' ? 'block' : 'none';
    }
    
    // Consanguinity degree
    const consanguinity = document.querySelector('input[name="consanguinity"]:checked')?.value;
    const consangDegree = document.getElementById('consanguinity_degree_group');
    if (consangDegree) {
        consangDegree.style.display = consanguinity === 'Yes' ? 'block' : 'none';
    }
    
    // Oxygen support flow rate
    const o2Support = document.querySelector('input[name="oxygen_support"]:checked')?.value;
    const o2Flow = document.getElementById('oxygen_flow_group');
    if (o2Flow) {
        o2Flow.style.display = o2Support === 'Yes' ? 'block' : 'none';
    }
    
    // Neonatal delivery LSCS indication
    const neonatalDelivery = document.querySelector('input[name="neonatal_delivery_mode"]:checked')?.value;
    const lscsIndication = document.getElementById('neonatal_lscs_indication_group');
    if (lscsIndication) {
        lscsIndication.style.display = neonatalDelivery === 'LSCS' ? 'block' : 'none';
    }
    
    // HIV status details
    const hivStatus = document.querySelector('input[name="hiv_status"]:checked')?.value;
    const hivDetails = document.getElementById('hiv_details_group');
    if (hivDetails) {
        hivDetails.style.display = hivStatus === 'Positive' ? 'block' : 'none';
    }
}

// ============================================================================
// PROGRESS BAR UPDATE
// ============================================================================

function updateProgress() {
    const allInputs = document.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="file"]), textarea, select');
    let filled = 0;
    let total = 0;
    const countedRadioNames = new Set();
    
    allInputs.forEach(input => {
        // Skip hidden fields and buttons
        if (input.type === 'hidden' || input.offsetParent === null) return;
        
        // Skip inputs inside hidden conditional groups
        const parentGroup = input.closest('[id$="_group"]');
        if (parentGroup && parentGroup.style.display === 'none') return;
        
        if (input.type === 'radio') {
            // Count each radio group only once
            if (countedRadioNames.has(input.name)) return;
            countedRadioNames.add(input.name);
            total++;
            if (document.querySelector(`input[name="${input.name}"]:checked`)) {
                filled++;
            }
        } else if (input.type === 'checkbox') {
            // Count each checkbox group (by name) only once
            const groupName = input.name || input.id;
            if (groupName && countedRadioNames.has('cb_' + groupName)) return;
            if (groupName) countedRadioNames.add('cb_' + groupName);
            total++;
            if (document.querySelector(`input[name="${groupName}"]:checked`)) {
                filled++;
            }
        } else {
            total++;
            if (input.value.trim() !== '') {
                filled++;
            }
        }
    });
    
    const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = percent + '%';
        progressFill.textContent = percent + '%';
    }
}

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================

function attachEventListeners() {
    // DOB → Age calculation AND milestones AND Z-scores
    const dobField = document.getElementById('dob');
    if (dobField) {
        dobField.addEventListener('change', () => {
            calculateAge();
            if (typeof updateDevelopmentalMilestones === 'function') {
                updateDevelopmentalMilestones();
            }
            if (typeof calculateAllZScores === 'function') {
                calculateAllZScores();
            }
        });
    }
    
    // Sex select → Z-scores
    const sexSelect = document.getElementById('sex');
    if (sexSelect) {
        sexSelect.addEventListener('change', () => {
            if (typeof calculateAllZScores === 'function') {
                calculateAllZScores();
            }
        });
    }
    
    // Weight/Height/HC → BMI AND Z-scores
    const weightField = document.getElementById('weight');
    const heightField = document.getElementById('height');
    const headCircField = document.getElementById('head_circ');
    
    if (weightField) {
        weightField.addEventListener('input', () => {
            calculateGrowth();
            if (typeof calculateAllZScores === 'function') {
                calculateAllZScores();
            }
        });
    }
    
    if (heightField) {
        heightField.addEventListener('input', () => {
            calculateGrowth();
            if (typeof calculateAllZScores === 'function') {
                calculateAllZScores();
            }
        });
    }
    
    if (headCircField) {
        headCircField.addEventListener('input', () => {
            if (typeof calculateAllZScores === 'function') {
                calculateAllZScores();
            }
        });
    }
    
    // Vitals → Color indicators
    ['hr', 'rr', 'bp_systolic', 'temp'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.addEventListener('input', updateVitalIndicators);
    });
    
    // Dehydration score
    document.querySelectorAll('input[name^="dehy_"]').forEach(input => {
        input.addEventListener('change', calculateDehydration);
    });
    
    // Lab values → Interpretation
    ['wbc', 'hb', 'platelets', 'neutrophils', 'glucose', 'sodium', 'potassium', 'creatinine'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.addEventListener('input', interpretLabs);
    });
    
    // Neonatal classification
    const neonatalWeight = document.getElementById('neonatal_birth_weight');
    const neonatalGA = document.getElementById('neonatal_ga');
    if (neonatalWeight) neonatalWeight.addEventListener('input', classifyNewborn);
    if (neonatalGA) neonatalGA.addEventListener('input', classifyNewborn);
    
    // Neonatal admission age
    const neonatalDOB = document.getElementById('neonatal_dob');
    const neonatalAdmission = document.getElementById('neonatal_admission_datetime');
    if (neonatalDOB) neonatalDOB.addEventListener('change', calculateAdmissionAge);
    if (neonatalAdmission) neonatalAdmission.addEventListener('change', calculateAdmissionAge);
    
    // Conditional field toggles
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', toggleConditionalFields);
    });
    
    // Update history summary when key features change
    for (let i = 1; i <= 5; i++) {
        const field = document.getElementById(`key_feature_${i}`);
        if (field) {
            field.addEventListener('input', updateHistorySummary);
        }
    }
    
    // HIV status toggle (NEW)
    document.querySelectorAll('input[name="hiv_status"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const hivDetails = document.getElementById('hiv_details_group');
            if (hivDetails) {
                hivDetails.style.display = 
                    document.querySelector('input[name="hiv_status"]:checked')?.value === 'Positive'
                    ? 'block' : 'none';
            }
        });
    });
    
    // Initial toggle on load
    toggleConditionalFields();
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

// showToast is defined in export.js — no duplicate needed here
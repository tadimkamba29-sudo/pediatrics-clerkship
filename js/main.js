/**
 * Main UI Logic for Pediatrics Clerkship Sheet
 * Handles Tabs, Autosave, Table Management, Dynamic Fields, and Event Listeners
 *
 * v2 — Fixed: progress bar listens to 'change' events (radio/checkbox),
 *             null-safe DOM queries throughout, weight auto-populate trigger
 */

document.addEventListener('DOMContentLoaded', () => {
    loadFormData();
    restoreActiveTab();
    updateProgress();
    setupAutosave();
    attachEventListeners();

    // Initial calculations on load
    calculateAge();
    calculateGrowth();
    updateVitalIndicators();
    interpretLabs();
    classifyNewborn();
    updateHistorySummary();

    if (typeof calculateAllZScores === 'function') calculateAllZScores();
    if (typeof updateDevelopmentalMilestones === 'function') updateDevelopmentalMilestones();
});

// ============================================================================
// TAB SYSTEM WITH MEMORY
// ============================================================================

function showTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active');
    if (btn) btn.classList.add('active');

    localStorage.setItem('activeTab', tabId);
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
// AUTOSAVE SYSTEM
// ============================================================================

let autosaveInterval;
let lastSaveTime = null;

function setupAutosave() {
    autosaveInterval = setInterval(() => {
        saveFormData(true);
    }, 3000);

    // FIX: listen to both 'input' (text fields) AND 'change' (radio, checkbox, select)
    document.addEventListener('input', handleFormChange);
    document.addEventListener('change', handleFormChange);
}

function handleFormChange() {
    updateProgress();
}

function saveFormData(silent = false) {
    const data = gatherFormData();
    localStorage.setItem('clerkshipData', JSON.stringify(data));

    lastSaveTime = new Date();
    updateSaveTimestamp();

    if (!silent) {
        showToast('Data saved successfully!', 'success');
    }

    const indicator = document.getElementById('autosaveIndicator');
    if (indicator && silent) {
        indicator.style.opacity = '1';
        setTimeout(() => { indicator.style.opacity = '0'; }, 1500);
    }
}

function updateSaveTimestamp() {
    const timestampEl = document.getElementById('lastSaved');
    if (timestampEl && lastSaveTime) {
        timestampEl.textContent = `Last saved: ${lastSaveTime.toLocaleTimeString()}`;
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
// FORM DATA GATHERING & LOADING
// ============================================================================

function gatherFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, textarea, select');

    inputs.forEach(input => {
        const key = input.id || input.name;
        if (!key) return;

        if (input.type === 'checkbox') {
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

    formData._dynamicTables = gatherDynamicTables();
    formData._progressNotes = gatherProgressNotes();

    return formData;
}

function loadFormData() {
    const saved = localStorage.getItem('clerkshipData');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        Object.keys(data).forEach(key => {
            if (key === '_dynamicTables' || key === '_progressNotes') return;

            if (Array.isArray(data[key])) {
                data[key].forEach(value => {
                    const cb = document.querySelector(`input[type="checkbox"][name="${key}"][value="${value}"]`);
                    if (cb) cb.checked = true;
                });
                return;
            }

            const el = document.getElementById(key);
            if (!el) {
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

        if (data._dynamicTables) restoreDynamicTables(data._dynamicTables);
        if (data._progressNotes) restoreProgressNotes(data._progressNotes);

        // Recalculate everything after loading
        calculateAge();
        calculateGrowth();
        updateVitalIndicators();
        interpretLabs();
        classifyNewborn();
        toggleConditionalFields();
        updateHistorySummary();

        if (typeof calculateAllZScores === 'function') calculateAllZScores();
        if (typeof updateDevelopmentalMilestones === 'function') updateDevelopmentalMilestones();

        console.log('Data loaded successfully');
    } catch (e) {
        console.error('Error loading saved data:', e);
        showToast('Error loading saved data', 'danger');
    }
}

// ============================================================================
// DYNAMIC TABLE MANAGEMENT
// ============================================================================

function addRow(tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const templateRow = tbody.rows[0];
    if (!templateRow) return;

    const newRow = templateRow.cloneNode(true);
    newRow.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'checkbox') input.checked = false;
        else input.value = '';
    });

    tbody.appendChild(newRow);
    saveFormData(true);
}

function removeRow(btn) {
    const row = btn.closest('tr');
    const tbody = row.parentElement;

    if (tbody.rows.length > 1) {
        row.remove();
        saveFormData(true);
    } else {
        alert('Cannot remove the last row.');
    }
}

function gatherDynamicTables() {
    const tables = {};
    const tableIds = [
        'priorTreatmentTable', 'pastIllnessesTable', 'currentMedicationsTable',
        'siblingsTable', 'problemListTable', 'managementMedsTable',
        'investigationPlanTable', 'neonatalMedicationsTable'
    ];

    tableIds.forEach(tableId => {
        const table = document.getElementById(tableId);
        if (!table) return;

        const rows = [];
        table.querySelector('tbody').querySelectorAll('tr').forEach(row => {
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
        const firstRow = tbody.rows[0];
        if (!firstRow) return;

        tbody.innerHTML = '';

        tablesData[tableId].forEach(rowData => {
            const newRow = firstRow.cloneNode(true);
            const inputs = newRow.querySelectorAll('input, textarea, select');
            rowData.forEach((value, idx) => {
                if (inputs[idx]) inputs[idx].value = value;
            });
            tbody.appendChild(newRow);
        });

        if (tbody.rows.length === 0) tbody.appendChild(firstRow);
    });
}

// ============================================================================
// PROGRESS NOTES (SOAP)
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
                <textarea class="form-control" rows="3" placeholder="Patient/parent report...">${note.subjective}</textarea>
            </div>
            <div class="form-group">
                <label>Objective (O)</label>
                <textarea class="form-control" rows="3" placeholder="Vitals, exam findings...">${note.objective}</textarea>
            </div>
            <div class="form-group">
                <label>Assessment (A)</label>
                <textarea class="form-control" rows="3" placeholder="Clinical impression...">${note.assessment}</textarea>
            </div>
            <div class="form-group">
                <label>Plan (P)</label>
                <textarea class="form-control" rows="3" placeholder="Treatment plan...">${note.plan}</textarea>
            </div>
        `;
        container.appendChild(noteCard);
    });
}

// ============================================================================
// DIFFERENTIAL DIAGNOSIS
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
// CONDITIONAL FIELD TOGGLES
// ============================================================================

function toggleConditionalFields() {
    const toggleMap = [
        { radio: 'delivery_mode', value: 'C-section', target: 'csection_indication_group' },
        { radio: 'nicu_admission', value: 'Yes', target: 'nicu_reason_group' },
        { radio: 'rash', value: 'Yes', target: 'rash_details_group' },
        { radio: 'dev_regression', value: 'Yes', target: 'regression_details_group' },
        { radio: 'consanguinity', value: 'Yes', target: 'consanguinity_degree_group' },
        { radio: 'oxygen_support', value: 'Yes', target: 'oxygen_flow_group' },
        { radio: 'neonatal_delivery_mode', value: 'LSCS', target: 'neonatal_lscs_indication_group' },
        { radio: 'hiv_status', value: 'Positive', target: 'hiv_details_group' }
    ];

    toggleMap.forEach(({ radio, value, target }) => {
        const checked = document.querySelector(`input[name="${radio}"]:checked`)?.value;
        const el = document.getElementById(target);
        if (el) el.style.display = checked === value ? 'block' : 'none';
    });
}

// ============================================================================
// PROGRESS BAR UPDATE
// ============================================================================

function updateProgress() {
    const allInputs = document.querySelectorAll(
        'input:not([type="button"]):not([type="submit"]):not([type="file"]):not([type="hidden"]), textarea, select'
    );

    let filled = 0;
    let total = 0;
    const countedNames = new Set();

    allInputs.forEach(input => {
        // Skip visually hidden / inside hidden conditional groups
        if (input.offsetParent === null) return;
        const parentGroup = input.closest('[id$="_group"]');
        if (parentGroup && parentGroup.style.display === 'none') return;

        if (input.type === 'radio') {
            if (countedNames.has(input.name)) return;
            countedNames.add(input.name);
            total++;
            if (document.querySelector(`input[name="${input.name}"]:checked`)) filled++;
        } else if (input.type === 'checkbox') {
            const gn = input.name || input.id;
            if (gn && countedNames.has('cb_' + gn)) return;
            if (gn) countedNames.add('cb_' + gn);
            total++;
            if (document.querySelector(`input[name="${gn}"]:checked`)) filled++;
        } else {
            total++;
            if (input.value && input.value.trim() !== '') filled++;
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
// EVENT LISTENERS
// ============================================================================

function attachEventListeners() {
    // DOB → Age + Milestones + Z-scores
    const dobField = document.getElementById('dob');
    if (dobField) {
        dobField.addEventListener('change', () => {
            calculateAge();
            if (typeof updateDevelopmentalMilestones === 'function') updateDevelopmentalMilestones();
            if (typeof calculateAllZScores === 'function') calculateAllZScores();
        });
    }

    // Sex → Z-scores
    const sexSelect = document.getElementById('sex');
    if (sexSelect) {
        sexSelect.addEventListener('change', () => {
            if (typeof calculateAllZScores === 'function') calculateAllZScores();
        });
    }

    // Weight → BMI + Z-scores + auto-populate calculators
    const weightField = document.getElementById('weight');
    if (weightField) {
        weightField.addEventListener('input', () => {
            calculateGrowth(); // calculateGrowth now chains into calculateAllZScores
        });
    }

    // Height → BMI + Z-scores
    const heightField = document.getElementById('height');
    if (heightField) {
        heightField.addEventListener('input', () => {
            calculateGrowth();
        });
    }

    // Head circ → Z-score
    const headCircField = document.getElementById('head_circ');
    if (headCircField) {
        headCircField.addEventListener('input', () => {
            if (typeof calculateAllZScores === 'function') calculateAllZScores();
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
    ['neonatal_birth_weight', 'neonatal_ga'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.addEventListener('input', classifyNewborn);
    });

    // Neonatal admission age
    ['neonatal_dob', 'neonatal_admission_datetime'].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.addEventListener('change', calculateAdmissionAge);
    });

    // Conditional field toggles on all radio changes
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', toggleConditionalFields);
    });

    // History summary update on key features
    for (let i = 1; i <= 5; i++) {
        const field = document.getElementById(`key_feature_${i}`);
        if (field) field.addEventListener('input', updateHistorySummary);
    }

    // Fluid and dose weight fields: clear autofill flag if user manually edits
    ['fluidWeight', 'doseWeight'].forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            field.addEventListener('input', () => {
                field.dataset.autofilled = 'false';
            });
        }
    });

    // Fluid calculator auto-run when weight changed manually
    const fluidWeightEl = document.getElementById('fluidWeight');
    if (fluidWeightEl) {
        fluidWeightEl.addEventListener('input', calculateFluids);
    }

    // Dose calculator auto-run
    const doseMgEl = document.getElementById('doseMg');
    if (doseMgEl) doseMgEl.addEventListener('input', calculateDose);

    // Initial toggle on load
    toggleConditionalFields();
}

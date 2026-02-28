/**
 * Utility functions for Pediatrics Clerkship Sheet
 * Calculations for Age, Growth, Vitals, Fluids, Labs, and Clinical Scores
 * 
 * v2 — Fixed: null safety, weight auto-population, z-score chaining
 */

// ============================================================================
// AGE CALCULATION
// ============================================================================

function calculateAge() {
    const dobEl = document.getElementById('dob');
    if (!dobEl) return;
    const dobValue = dobEl.value;
    if (!dobValue) {
        const ageEl = document.getElementById('age');
        if (ageEl) ageEl.value = '';
        return;
    }

    const dob = new Date(dobValue);
    const now = new Date();

    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    let days = now.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    let ageString = '';
    if (years > 0) ageString += years + (years === 1 ? ' year ' : ' years ');
    if (months > 0) ageString += months + (months === 1 ? ' month ' : ' months ');
    if (years === 0 && months === 0 && days >= 0) ageString += days + (days === 1 ? ' day' : ' days');

    const ageEl = document.getElementById('age');
    if (ageEl) ageEl.value = ageString.trim() || '0 days';
}

// ============================================================================
// GROWTH & BMI CALCULATION
// ============================================================================

function calculateGrowth() {
    const weightEl = document.getElementById('weight');
    const heightEl = document.getElementById('height');
    const display = document.getElementById('growthDisplay');

    if (!weightEl || !heightEl) return;

    const weight = parseFloat(weightEl.value);
    const heightCm = parseFloat(heightEl.value);
    const heightM = heightCm / 100;

    if (weight && heightCm && heightM > 0) {
        const bmi = (weight / (heightM * heightM)).toFixed(1);
        const bmiEl = document.getElementById('bmiValue');
        if (bmiEl) bmiEl.textContent = bmi;
        if (display) display.style.display = 'flex';
    } else {
        if (display) display.style.display = 'none';
    }

    // Auto-populate the weight fields in calculators
    autoPopulateWeightFields(weight);

    // Chain into z-score calculation
    if (typeof calculateAllZScores === 'function') {
        calculateAllZScores();
    }
}

/**
 * Auto-fill weight into the fluid and dose calculators
 * so users don't have to re-enter it.
 */
function autoPopulateWeightFields(weight) {
    if (!weight || isNaN(weight)) return;

    const fluidWeightEl = document.getElementById('fluidWeight');
    const doseWeightEl = document.getElementById('doseWeight');

    // Only auto-fill if the field is empty or matches a previous auto-fill
    if (fluidWeightEl && (!fluidWeightEl.value || fluidWeightEl.dataset.autofilled === 'true')) {
        fluidWeightEl.value = weight;
        fluidWeightEl.dataset.autofilled = 'true';
        calculateFluids(); // Auto-run the calculation
    }

    if (doseWeightEl && (!doseWeightEl.value || doseWeightEl.dataset.autofilled === 'true')) {
        doseWeightEl.value = weight;
        doseWeightEl.dataset.autofilled = 'true';
    }
}

// ============================================================================
// HOLLIDAY-SEGAR MAINTENANCE FLUID CALCULATOR
// ============================================================================

function calculateFluids() {
    const fluidWeightEl = document.getElementById('fluidWeight');
    const resultDiv = document.getElementById('fluidResult');
    if (!fluidWeightEl || !resultDiv) return;

    const weight = parseFloat(fluidWeightEl.value);
    if (!weight || weight <= 0) {
        resultDiv.innerHTML = '';
        return;
    }

    let dailyVolume = 0;

    if (weight <= 10) {
        dailyVolume = weight * 100;
    } else if (weight <= 20) {
        dailyVolume = 1000 + (weight - 10) * 50;
    } else {
        dailyVolume = 1500 + (weight - 20) * 20;
    }

    const hourlyRate = (dailyVolume / 24).toFixed(1);

    resultDiv.innerHTML = `
        <strong>Daily:</strong> ${dailyVolume} mL/day&nbsp;&nbsp;
        <strong>Hourly:</strong> ${hourlyRate} mL/hr
    `;
}

// ============================================================================
// MEDICATION DOSE CALCULATOR
// ============================================================================

function calculateDose() {
    const weightEl = document.getElementById('doseWeight');
    const doseEl = document.getElementById('doseMg');
    const resultDiv = document.getElementById('doseResult');
    if (!weightEl || !doseEl || !resultDiv) return;

    const weight = parseFloat(weightEl.value);
    const dose = parseFloat(doseEl.value);

    if (!weight || !dose || weight <= 0 || dose <= 0) {
        resultDiv.innerHTML = '';
        return;
    }

    const totalDose = (weight * dose).toFixed(1);
    const maxDose = document.getElementById('doseMgMax') ? parseFloat(document.getElementById('doseMgMax').value) : null;

    let html = `<strong>Total Dose:</strong> ${totalDose} mg`;
    if (maxDose && totalDose > maxDose) {
        html += ` <span class="badge badge-warning">⚠ Exceeds max ${maxDose} mg</span>`;
    }

    resultDiv.innerHTML = html;
}

// ============================================================================
// VITAL SIGNS COLOR INDICATORS (Age-Adjusted)
// ============================================================================

function updateVitalIndicators() {
    updateHRIndicator();
    updateRRIndicator();
    updateBPIndicator();
    updateTempIndicator();
}

function updateHRIndicator() {
    const hrEl = document.getElementById('hr');
    const indicator = document.getElementById('hrIndicator');
    if (!hrEl || !indicator) return;

    const hr = parseFloat(hrEl.value);
    const ageYears = getAgeInYears();

    if (!hr || ageYears === null) {
        indicator.textContent = '';
        indicator.title = '';
        return;
    }

    let normal = false;

    if (ageYears < 1) normal = hr >= 100 && hr <= 160;
    else if (ageYears < 3) normal = hr >= 90 && hr <= 150;
    else if (ageYears < 6) normal = hr >= 80 && hr <= 140;
    else if (ageYears < 12) normal = hr >= 70 && hr <= 120;
    else normal = hr >= 60 && hr <= 100;

    const mid = getNormalHR(ageYears);
    if (normal) {
        indicator.textContent = '🟢'; indicator.title = 'Normal';
    } else if (Math.abs(hr - mid) < 20) {
        indicator.textContent = '🟡'; indicator.title = 'Borderline';
    } else {
        indicator.textContent = '🔴'; indicator.title = hr < mid ? 'Bradycardia' : 'Tachycardia';
    }
}

function updateRRIndicator() {
    const rrEl = document.getElementById('rr');
    const indicator = document.getElementById('rrIndicator');
    if (!rrEl || !indicator) return;

    const rr = parseFloat(rrEl.value);
    const ageYears = getAgeInYears();

    if (!rr || ageYears === null) {
        indicator.textContent = '';
        indicator.title = '';
        return;
    }

    let normal = false;

    if (ageYears < 1) normal = rr >= 30 && rr <= 60;
    else if (ageYears < 3) normal = rr >= 24 && rr <= 40;
    else if (ageYears < 6) normal = rr >= 22 && rr <= 34;
    else if (ageYears < 12) normal = rr >= 18 && rr <= 30;
    else normal = rr >= 12 && rr <= 20;

    const mid = getNormalRR(ageYears);
    if (normal) {
        indicator.textContent = '🟢'; indicator.title = 'Normal';
    } else if (Math.abs(rr - mid) < 10) {
        indicator.textContent = '🟡'; indicator.title = 'Borderline';
    } else {
        indicator.textContent = '🔴'; indicator.title = rr < mid ? 'Bradypnoea' : 'Tachypnoea';
    }
}

function updateBPIndicator() {
    const sbpEl = document.getElementById('bp_systolic');
    const indicator = document.getElementById('bpIndicator');
    if (!sbpEl || !indicator) return;

    const sbp = parseFloat(sbpEl.value);
    const ageYears = getAgeInYears();

    if (!sbp || ageYears === null) {
        indicator.textContent = '';
        indicator.title = '';
        return;
    }

    let normal = false;

    if (ageYears < 1) normal = sbp >= 70 && sbp <= 100;
    else if (ageYears < 6) normal = sbp >= 80 && sbp <= 110;
    else if (ageYears < 12) normal = sbp >= 90 && sbp <= 120;
    else normal = sbp >= 100 && sbp <= 130;

    const mid = getNormalSBP(ageYears);
    if (normal) {
        indicator.textContent = '🟢'; indicator.title = 'Normal';
    } else if (Math.abs(sbp - mid) < 15) {
        indicator.textContent = '🟡'; indicator.title = 'Borderline';
    } else {
        indicator.textContent = '🔴'; indicator.title = sbp < mid ? 'Hypotension' : 'Hypertension';
    }
}

function updateTempIndicator() {
    const tempEl = document.getElementById('temp');
    const indicator = document.getElementById('tempIndicator');
    if (!tempEl || !indicator) return;

    const temp = parseFloat(tempEl.value);

    if (!temp) {
        indicator.textContent = '';
        indicator.title = '';
        return;
    }

    if (temp >= 36.5 && temp <= 37.5) {
        indicator.textContent = '🟢'; indicator.title = 'Normal';
    } else if (temp >= 37.6 && temp <= 38.0) {
        indicator.textContent = '🟡'; indicator.title = 'Low-grade fever';
    } else if (temp > 38.0) {
        indicator.textContent = '🔴'; indicator.title = 'Fever';
    } else {
        indicator.textContent = '🔴'; indicator.title = 'Hypothermia';
    }
}

// Helper functions for normal vital ranges
function getNormalHR(ageYears) {
    if (ageYears < 1) return 130;
    if (ageYears < 3) return 120;
    if (ageYears < 6) return 110;
    if (ageYears < 12) return 95;
    return 80;
}

function getNormalRR(ageYears) {
    if (ageYears < 1) return 40;
    if (ageYears < 3) return 30;
    if (ageYears < 6) return 25;
    if (ageYears < 12) return 22;
    return 16;
}

function getNormalSBP(ageYears) {
    if (ageYears < 1) return 85;
    if (ageYears < 6) return 95;
    if (ageYears < 12) return 105;
    return 115;
}

/**
 * Returns age in decimal years from the dob field, or null if not set.
 */
function getAgeInYears() {
    const dobEl = document.getElementById('dob');
    if (!dobEl || !dobEl.value) return null;

    const dob = new Date(dobEl.value);
    const now = new Date();
    return (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
}

// ============================================================================
// DEHYDRATION SCORE & WHO CLASSIFICATION
// ============================================================================

function calculateDehydration() {
    const scores = {
        appearance: parseInt(document.querySelector('input[name="dehy_appearance"]:checked')?.value || 0),
        eyes: parseInt(document.querySelector('input[name="dehy_eyes"]:checked')?.value || 0),
        mucosa: parseInt(document.querySelector('input[name="dehy_mucosa"]:checked')?.value || 0),
        tears: parseInt(document.querySelector('input[name="dehy_tears"]:checked')?.value || 0)
    };

    const total = scores.appearance + scores.eyes + scores.mucosa + scores.tears;
    const resultDiv = document.getElementById('dehydrationResult');
    if (!resultDiv) return;

    let classification = '';
    let className = '';

    if (total === 0) {
        classification = 'No Dehydration';
        className = 'badge-success';
    } else if (total <= 4) {
        classification = 'Some Dehydration (Mild–Moderate)';
        className = 'badge-primary';
    } else {
        classification = 'Severe Dehydration';
        className = 'badge-danger';
    }

    resultDiv.innerHTML = `
        <strong>Score:</strong> ${total}/8 &nbsp;
        <span class="badge ${className}">${classification}</span>
    `;
}

// ============================================================================
// LAB RESULT INTERPRETATION
// ============================================================================

function interpretLabs() {
    interpretCBC();
    interpretMetabolic();
}

function interpretCBC() {
    const wbc = parseFloat(document.getElementById('wbc')?.value);
    const hb = parseFloat(document.getElementById('hb')?.value);
    const platelets = parseFloat(document.getElementById('platelets')?.value);
    const neutrophils = parseFloat(document.getElementById('neutrophils')?.value);

    const resultDiv = document.getElementById('cbcInterpretation');
    if (!resultDiv) return;

    const interpretation = [];

    if (wbc) {
        if (wbc < 4) interpretation.push('⚠️ Leukopenia (WBC < 4)');
        else if (wbc > 15) interpretation.push('⚠️ Leukocytosis (WBC > 15)');
        else interpretation.push('✓ WBC normal');
    }

    if (hb) {
        if (hb < 7) interpretation.push('⚠️ Severe Anaemia (Hb < 7)');
        else if (hb < 11) interpretation.push('⚠️ Anaemia (Hb < 11)');
        else if (hb > 17) interpretation.push('⚠️ Polycythaemia (Hb > 17)');
        else interpretation.push('✓ Haemoglobin normal');
    }

    if (platelets) {
        if (platelets < 50) interpretation.push('⚠️ Severe Thrombocytopenia (< 50)');
        else if (platelets < 150) interpretation.push('⚠️ Thrombocytopenia (< 150)');
        else if (platelets > 450) interpretation.push('⚠️ Thrombocytosis (> 450)');
        else interpretation.push('✓ Platelets normal');
    }

    if (neutrophils) {
        if (neutrophils < 40) interpretation.push('⚠️ Neutropenia (< 40%)');
        else if (neutrophils > 80) interpretation.push('⚠️ Neutrophilia (> 80%)');
        else interpretation.push('✓ Neutrophils normal');
    }

    resultDiv.innerHTML = interpretation.length > 0
        ? interpretation.join('<br>')
        : '<em>Enter lab values for interpretation</em>';
}

function interpretMetabolic() {
    const glucose = parseFloat(document.getElementById('glucose')?.value);
    const sodium = parseFloat(document.getElementById('sodium')?.value);
    const potassium = parseFloat(document.getElementById('potassium')?.value);
    const creatinine = parseFloat(document.getElementById('creatinine')?.value);

    const resultDiv = document.getElementById('metabolicInterpretation');
    if (!resultDiv) return;

    const interpretation = [];

    if (glucose) {
        if (glucose < 2.5) interpretation.push('⚠️ Severe Hypoglycaemia (< 2.5)');
        else if (glucose < 3.3) interpretation.push('⚠️ Hypoglycaemia (< 3.3)');
        else if (glucose > 7.8) interpretation.push('⚠️ Hyperglycaemia (> 7.8)');
        else interpretation.push('✓ Glucose normal');
    }

    if (sodium) {
        if (sodium < 125) interpretation.push('⚠️ Severe Hyponatraemia (< 125)');
        else if (sodium < 135) interpretation.push('⚠️ Hyponatraemia (< 135)');
        else if (sodium > 150) interpretation.push('⚠️ Severe Hypernatraemia (> 150)');
        else if (sodium > 145) interpretation.push('⚠️ Hypernatraemia (> 145)');
        else interpretation.push('✓ Sodium normal');
    }

    if (potassium) {
        if (potassium < 3.0) interpretation.push('⚠️ Severe Hypokalaemia (< 3.0)');
        else if (potassium < 3.5) interpretation.push('⚠️ Hypokalaemia (< 3.5)');
        else if (potassium > 6.0) interpretation.push('⚠️ Severe Hyperkalaemia (> 6.0)');
        else if (potassium > 5.5) interpretation.push('⚠️ Hyperkalaemia (> 5.5)');
        else interpretation.push('✓ Potassium normal');
    }

    if (creatinine) {
        if (creatinine > 90) interpretation.push('⚠️ Elevated creatinine (> 90 μmol/L)');
        else interpretation.push('✓ Creatinine normal');
    }

    resultDiv.innerHTML = interpretation.length > 0
        ? interpretation.join('<br>')
        : '<em>Enter lab values for interpretation</em>';
}

// ============================================================================
// NEONATAL CLASSIFICATION
// ============================================================================

function classifyNewborn() {
    const birthWeight = parseFloat(document.getElementById('neonatal_birth_weight')?.value);
    const ga = parseFloat(document.getElementById('neonatal_ga')?.value);

    const resultDiv = document.getElementById('neonatalClassification');
    if (!resultDiv) return;

    const classifications = [];

    if (birthWeight) {
        if (birthWeight < 1) {
            classifications.push('<span class="badge badge-danger">ELBW (< 1 kg)</span>');
        } else if (birthWeight < 1.5) {
            classifications.push('<span class="badge badge-danger">VLBW (< 1.5 kg)</span>');
        } else if (birthWeight < 2.5) {
            classifications.push('<span class="badge badge-primary">LBW (< 2.5 kg)</span>');
        } else if (birthWeight <= 4) {
            classifications.push('<span class="badge badge-success">Normal Birth Weight</span>');
        } else {
            classifications.push('<span class="badge badge-primary">Macrosomia (> 4 kg)</span>');
        }
    }

    if (ga) {
        if (ga < 28) {
            classifications.push('<span class="badge badge-danger">Extremely Preterm (< 28 wks)</span>');
        } else if (ga < 32) {
            classifications.push('<span class="badge badge-danger">Very Preterm (28–31 wks)</span>');
        } else if (ga < 37) {
            classifications.push('<span class="badge badge-primary">Preterm (32–36 wks)</span>');
        } else if (ga <= 42) {
            classifications.push('<span class="badge badge-success">Term (37–42 wks)</span>');
        } else {
            classifications.push('<span class="badge badge-primary">Post-term (> 42 wks)</span>');
        }
    }

    resultDiv.innerHTML = classifications.length > 0
        ? classifications.join(' ')
        : '<em>Enter birth weight and GA for classification</em>';
}

// ============================================================================
// NEONATAL ADMISSION AGE CALCULATOR
// ============================================================================

function calculateAdmissionAge() {
    const dobValue = document.getElementById('neonatal_dob')?.value;
    const admissionValue = document.getElementById('neonatal_admission_datetime')?.value;

    if (!dobValue || !admissionValue) return;

    const dob = new Date(dobValue);
    const admission = new Date(admissionValue);

    if (isNaN(dob) || isNaN(admission)) return;

    const diffMs = admission - dob;
    if (diffMs < 0) {
        const el = document.getElementById('neonatal_age_at_admission');
        if (el) el.value = 'Admission before birth — check dates';
        return;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const el = document.getElementById('neonatal_age_at_admission');
    if (el) el.value = `${diffDays} day${diffDays !== 1 ? 's' : ''}, ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
}

// ============================================================================
// EXPORT UTILITIES (helper functions for export.js)
// ============================================================================

function getAllFormData() {
    const formData = {};
    document.querySelectorAll('input, textarea, select').forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) formData[input.name] = input.value;
        } else if (input.type === 'checkbox') {
            if (!formData[input.name]) formData[input.name] = [];
            if (input.checked) formData[input.name].push(input.value);
        } else {
            formData[input.id || input.name] = input.value;
        }
    });
    return formData;
}

function setAllFormData(data) {
    Object.keys(data).forEach(key => {
        if (key.startsWith('_')) return;

        if (Array.isArray(data[key])) {
            data[key].forEach(value => {
                const cb = document.querySelector(`input[type="checkbox"][name="${key}"][value="${value}"]`);
                if (cb) cb.checked = true;
            });
            return;
        }

        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = !!data[key];
            } else {
                element.value = data[key];
            }
        } else {
            const radio = document.querySelector(`input[type="radio"][name="${key}"][value="${data[key]}"]`);
            if (radio) radio.checked = true;
        }
    });
}

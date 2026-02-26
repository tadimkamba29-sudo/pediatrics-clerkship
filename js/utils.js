/**
 * Utility functions for Pediatrics Clerkship Sheet
 * Calculations for Age, Growth, Vitals, Fluids, Labs, and Clinical Scores
 */

// ============================================================================
// AGE CALCULATION
// ============================================================================

function calculateAge() {
    const dobValue = document.getElementById('dob').value;
    if (!dobValue) return;

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

    let ageString = "";
    if (years > 0) ageString += years + (years === 1 ? " year " : " years ");
    if (months > 0) ageString += months + (months === 1 ? " month " : " months ");
    if (years === 0 && days > 0) ageString += days + (days === 1 ? " day" : " days");

    document.getElementById('age').value = ageString.trim() || "0 days";
}

// ============================================================================
// GROWTH & BMI CALCULATION
// ============================================================================

function calculateGrowth() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100; // cm to m
    const display = document.getElementById('growthDisplay');

    if (weight && height) {
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmiValue').textContent = bmi;
        display.style.display = 'flex';
        
        // Note: Percentile fields are manual entry only
        // Z-scores (WAZ/HAZ/WHZ) are also manual entry in the form
    } else {
        display.style.display = 'none';
    }
}

// ============================================================================
// HOLLIDAY-SEGAR MAINTENANCE FLUID CALCULATOR
// ============================================================================

function calculateFluids() {
    const weight = parseFloat(document.getElementById('fluidWeight').value);
    if (!weight || weight <= 0) {
        document.getElementById('fluidResult').innerHTML = '';
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

    document.getElementById('fluidResult').innerHTML = `
        <strong>Daily:</strong> ${dailyVolume} mL/day<br>
        <strong>Hourly:</strong> ${hourlyRate} mL/hr
    `;
}

// ============================================================================
// MEDICATION DOSE CALCULATOR
// ============================================================================

function calculateDose() {
    const weight = parseFloat(document.getElementById('doseWeight').value);
    const dose = parseFloat(document.getElementById('doseMg').value);
    
    if (!weight || !dose || weight <= 0 || dose <= 0) {
        document.getElementById('doseResult').innerHTML = '';
        return;
    }

    const totalDose = (weight * dose).toFixed(1);
    document.getElementById('doseResult').innerHTML = `
        <strong>Total Dose:</strong> ${totalDose} mg
    `;
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
    const hr = parseFloat(document.getElementById('hr').value);
    const ageYears = getAgeInYears();
    const indicator = document.getElementById('hrIndicator');
    
    if (!hr || ageYears === null) {
        indicator.textContent = '';
        return;
    }

    let normal = false;
    
    if (ageYears < 1) normal = hr >= 100 && hr <= 160;
    else if (ageYears < 3) normal = hr >= 90 && hr <= 150;
    else if (ageYears < 6) normal = hr >= 80 && hr <= 140;
    else if (ageYears < 12) normal = hr >= 70 && hr <= 120;
    else normal = hr >= 60 && hr <= 100;

    if (normal) {
        indicator.textContent = '🟢';
        indicator.title = 'Normal';
    } else if (Math.abs(hr - getNormalHR(ageYears)) < 20) {
        indicator.textContent = '🟡';
        indicator.title = 'Borderline';
    } else {
        indicator.textContent = '🔴';
        indicator.title = 'Abnormal';
    }
}

function updateRRIndicator() {
    const rr = parseFloat(document.getElementById('rr').value);
    const ageYears = getAgeInYears();
    const indicator = document.getElementById('rrIndicator');
    
    if (!rr || ageYears === null) {
        indicator.textContent = '';
        return;
    }

    let normal = false;
    
    if (ageYears < 1) normal = rr >= 30 && rr <= 60;
    else if (ageYears < 3) normal = rr >= 24 && rr <= 40;
    else if (ageYears < 6) normal = rr >= 22 && rr <= 34;
    else if (ageYears < 12) normal = rr >= 18 && rr <= 30;
    else normal = rr >= 12 && rr <= 20;

    if (normal) {
        indicator.textContent = '🟢';
        indicator.title = 'Normal';
    } else if (Math.abs(rr - getNormalRR(ageYears)) < 10) {
        indicator.textContent = '🟡';
        indicator.title = 'Borderline';
    } else {
        indicator.textContent = '🔴';
        indicator.title = 'Abnormal';
    }
}

function updateBPIndicator() {
    const sbp = parseFloat(document.getElementById('bp_systolic').value);
    const ageYears = getAgeInYears();
    const indicator = document.getElementById('bpIndicator');
    
    if (!sbp || ageYears === null) {
        indicator.textContent = '';
        return;
    }

    let normal = false;
    
    if (ageYears < 1) normal = sbp >= 70 && sbp <= 100;
    else if (ageYears < 6) normal = sbp >= 80 && sbp <= 110;
    else if (ageYears < 12) normal = sbp >= 90 && sbp <= 120;
    else normal = sbp >= 100 && sbp <= 130;

    if (normal) {
        indicator.textContent = '🟢';
        indicator.title = 'Normal';
    } else if (Math.abs(sbp - getNormalSBP(ageYears)) < 15) {
        indicator.textContent = '🟡';
        indicator.title = 'Borderline';
    } else {
        indicator.textContent = '🔴';
        indicator.title = 'Abnormal';
    }
}

function updateTempIndicator() {
    const temp = parseFloat(document.getElementById('temp').value);
    const indicator = document.getElementById('tempIndicator');
    
    if (!temp) {
        indicator.textContent = '';
        return;
    }

    if (temp >= 36.5 && temp <= 37.5) {
        indicator.textContent = '🟢';
        indicator.title = 'Normal';
    } else if (temp >= 37.6 && temp <= 38.0) {
        indicator.textContent = '🟡';
        indicator.title = 'Low-grade fever';
    } else {
        indicator.textContent = '🔴';
        indicator.title = temp < 36.5 ? 'Hypothermia' : 'Fever';
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

function getAgeInYears() {
    const dobValue = document.getElementById('dob').value;
    if (!dobValue) return null;
    
    const dob = new Date(dobValue);
    const now = new Date();
    const ageInYears = (now - dob) / (1000 * 60 * 60 * 24 * 365.25);
    return ageInYears;
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
    } else if (total >= 1 && total <= 4) {
        classification = 'Some Dehydration (Mild-Moderate)';
        className = 'badge-primary';
    } else if (total >= 5) {
        classification = 'Severe Dehydration';
        className = 'badge-danger';
    }

    resultDiv.innerHTML = `
        <strong>Total Score:</strong> ${total}/8<br>
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
    const wbc = parseFloat(document.getElementById('wbc').value);
    const hb = parseFloat(document.getElementById('hb').value);
    const platelets = parseFloat(document.getElementById('platelets').value);
    const neutrophils = parseFloat(document.getElementById('neutrophils').value);
    
    const resultDiv = document.getElementById('cbcInterpretation');
    if (!resultDiv) return;

    let interpretation = [];

    // WBC interpretation
    if (wbc) {
        if (wbc < 4) interpretation.push('⚠️ Leukopenia');
        else if (wbc > 15) interpretation.push('⚠️ Leukocytosis');
        else interpretation.push('✓ WBC normal');
    }

    // Hemoglobin interpretation (age-adjusted would be better, but simplified here)
    if (hb) {
        if (hb < 11) interpretation.push('⚠️ Anemia');
        else if (hb > 17) interpretation.push('⚠️ Polycythemia');
        else interpretation.push('✓ Hb normal');
    }

    // Platelets
    if (platelets) {
        if (platelets < 150) interpretation.push('⚠️ Thrombocytopenia');
        else if (platelets > 450) interpretation.push('⚠️ Thrombocytosis');
        else interpretation.push('✓ Platelets normal');
    }

    // Neutrophils
    if (neutrophils) {
        if (neutrophils < 40) interpretation.push('⚠️ Neutropenia');
        else if (neutrophils > 80) interpretation.push('⚠️ Neutrophilia');
        else interpretation.push('✓ Neutrophils normal');
    }

    resultDiv.innerHTML = interpretation.length > 0 
        ? interpretation.join('<br>') 
        : '<em>Enter lab values for interpretation</em>';
}

function interpretMetabolic() {
    const glucose = parseFloat(document.getElementById('glucose').value);
    const sodium = parseFloat(document.getElementById('sodium').value);
    const potassium = parseFloat(document.getElementById('potassium').value);
    const creatinine = parseFloat(document.getElementById('creatinine').value);
    
    const resultDiv = document.getElementById('metabolicInterpretation');
    if (!resultDiv) return;

    let interpretation = [];

    // Glucose
    if (glucose) {
        if (glucose < 3.3) interpretation.push('⚠️ Hypoglycemia');
        else if (glucose > 7.8) interpretation.push('⚠️ Hyperglycemia');
        else interpretation.push('✓ Glucose normal');
    }

    // Sodium
    if (sodium) {
        if (sodium < 135) interpretation.push('⚠️ Hyponatremia');
        else if (sodium > 145) interpretation.push('⚠️ Hypernatremia');
        else interpretation.push('✓ Sodium normal');
    }

    // Potassium
    if (potassium) {
        if (potassium < 3.5) interpretation.push('⚠️ Hypokalemia');
        else if (potassium > 5.5) interpretation.push('⚠️ Hyperkalemia');
        else interpretation.push('✓ Potassium normal');
    }

    // Creatinine (pediatric range in μmol/L)
    if (creatinine) {
        if (creatinine > 90) interpretation.push('⚠️ Elevated creatinine');
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
    const birthWeight = parseFloat(document.getElementById('neonatal_birth_weight').value);
    const ga = parseFloat(document.getElementById('neonatal_ga').value);
    
    const resultDiv = document.getElementById('neonatalClassification');
    if (!resultDiv) return;

    let classifications = [];

    // Weight-based classification
    if (birthWeight) {
        if (birthWeight < 1) {
            classifications.push('<span class="badge badge-danger">ELBW (Extremely Low Birth Weight)</span>');
        } else if (birthWeight < 1.5) {
            classifications.push('<span class="badge badge-danger">VLBW (Very Low Birth Weight)</span>');
        } else if (birthWeight < 2.5) {
            classifications.push('<span class="badge badge-primary">LBW (Low Birth Weight)</span>');
        } else if (birthWeight >= 2.5 && birthWeight <= 4) {
            classifications.push('<span class="badge badge-success">Normal Birth Weight</span>');
        } else {
            classifications.push('<span class="badge badge-primary">Macrosomia</span>');
        }
    }

    // GA-based classification
    if (ga) {
        if (ga < 28) {
            classifications.push('<span class="badge badge-danger">Extremely Preterm</span>');
        } else if (ga < 32) {
            classifications.push('<span class="badge badge-danger">Very Preterm</span>');
        } else if (ga < 37) {
            classifications.push('<span class="badge badge-primary">Preterm</span>');
        } else if (ga >= 37 && ga <= 42) {
            classifications.push('<span class="badge badge-success">Term</span>');
        } else {
            classifications.push('<span class="badge badge-primary">Post-term</span>');
        }
    }

    // SGA/AGA/LGA would require growth charts - placeholder for manual assessment
    // You could add manual radio buttons for this in the neonatal tab

    resultDiv.innerHTML = classifications.length > 0 
        ? classifications.join(' ') 
        : '<em>Enter birth weight and GA for classification</em>';
}

// ============================================================================
// NEONATAL ADMISSION AGE CALCULATOR
// ============================================================================

function calculateAdmissionAge() {
    const dobValue = document.getElementById('neonatal_dob').value;
    const admissionValue = document.getElementById('neonatal_admission_datetime').value;
    
    if (!dobValue || !admissionValue) return;

    const dob = new Date(dobValue);
    const admission = new Date(admissionValue);
    
    const diffMs = admission - dob;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const ageAtAdmission = document.getElementById('neonatal_age_at_admission');
    if (ageAtAdmission) {
        ageAtAdmission.value = `${diffDays} days, ${diffHours} hours`;
    }
}

// ============================================================================
// EXPORT UTILITIES (helper functions for export.js)
// ============================================================================

// Helper to get all form data as object
function getAllFormData() {
    const formData = {};
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
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

// Helper to set all form data from object (used by importJSON in export.js)
function setAllFormData(data) {
    Object.keys(data).forEach(key => {
        if (key.startsWith('_')) return; // skip meta keys

        // Handle grouped checkbox arrays
        if (Array.isArray(data[key])) {
            data[key].forEach(value => {
                const cb = document.querySelector(`input[type="checkbox"][name="${key}"][value="${value}"]`);
                if (cb) cb.checked = true;
            });
            return;
        }

        // Try by id first, then by radio name
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = !!data[key];
            } else {
                element.value = data[key];
            }
        } else {
            // Attempt radio match by name + value
            const radio = document.querySelector(`input[type="radio"][name="${key}"][value="${data[key]}"]`);
            if (radio) radio.checked = true;
        }
    });
}
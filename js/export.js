/**
 * Export and Print logic
 * Handles TXT download, JSON backup/restore, and printing
 */

// ============================================================================
// PRINT FUNCTIONALITY
// ============================================================================

function printForm() {
    // Browser print dialog (CSS handles print styling)
    window.print();
}

// ============================================================================
// DOWNLOAD AS TXT (Human-Readable Summary)
// ============================================================================

function downloadTXT() {
    const content = generateTXTContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const patientName = document.getElementById('patient_name')?.value || 'Patient';
    const fileName = `${patientName.replace(/\s+/g, '_')}_Clerkship.txt`;
    
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('TXT file downloaded!', 'success');
}

function generateTXTContent() {
    let txt = '';
    
    txt += '═══════════════════════════════════════════════════════════\n';
    txt += '           PEDIATRICS CLERKSHIP SUMMARY\n';
    txt += '═══════════════════════════════════════════════════════════\n\n';
    
    // === PATIENT INFORMATION ===
    txt += '━━━ PATIENT INFORMATION ━━━\n';
    txt += `Name: ${getValue('patient_name')}\n`;
    txt += `MRN: ${getValue('mrn')}\n`;
    txt += `Date of Birth: ${getValue('dob')}\n`;
    txt += `Age: ${getValue('age')}\n`;
    txt += `Sex: ${getRadioValue('sex')}\n`;
    txt += `Weight: ${getValue('weight')} kg\n`;
    txt += `Height: ${getValue('height')} cm\n`;
    txt += `Head Circumference: ${getValue('head_circ')} cm\n`;
    txt += `MUAC: ${getValue('muac')} cm\n`;
    
    const bmi = document.getElementById('bmiValue')?.textContent;
    if (bmi) txt += `BMI: ${bmi}\n`;
    
    txt += `Exam Date: ${getValue('exam_date')}\n`;
    txt += `Hospital/Facility: ${getValue('hospital')}\n`;
    txt += `Admission Date: ${getValue('admission_date')}\n`;
    txt += `Informant: ${getValue('informant')}\n`;
    txt += `Informant Reliability: ${getValue('informant_reliability')}\n`;
    txt += `Attending Physician: ${getValue('attending')}\n`;
    txt += '\n';
    
    // === CHIEF COMPLAINT ===
    txt += '━━━ CHIEF COMPLAINT ━━━\n';
    for (let i = 1; i <= 3; i++) {
        const complaint = getValue(`complaint_${i}`);
        const duration = getValue(`duration_${i}`);
        if (complaint) {
            txt += `${i}. ${complaint}${duration ? ' - ' + duration : ''}\n`;
        }
    }
    txt += `\nHistory of Present Illness:\n${getValue('hpi')}\n`;
    txt += '\n';
    
    // === SYMPTOM CHARACTERIZATION ===
    txt += '━━━ SYMPTOM DETAILS ━━━\n';
    txt += `Onset: ${getValue('onset')}\n`;
    txt += `Location: ${getValue('location')}\n`;
    txt += `Character: ${getValue('character')}\n`;
    txt += `Aggravating Factors: ${getValue('aggravating')}\n`;
    txt += `Relieving Factors: ${getValue('relieving')}\n`;
    txt += `Timing: ${getValue('timing')}\n`;
    txt += `Severity: ${getValue('severity')}\n`;
    txt += `Progression: ${getValue('progression')}\n`;
    txt += `Associated Symptoms: ${getValue('associated_symptoms')}\n`;
    txt += `Effect on Feeding: ${getValue('effect_feeding')}\n`;
    txt += `Effect on Sleep: ${getValue('effect_sleep')}\n`;
    txt += `Effect on Activity: ${getValue('effect_activity')}\n`;
    txt += '\n';
    
    // === PRIOR TREATMENT ===
    txt += '━━━ PRIOR TREATMENT ━━━\n';
    txt += getTableContent('priorTreatmentTable', ['Medication/Treatment', 'Dose/Frequency', 'Response']);
    txt += '\n';
    
    // === REVIEW OF SYSTEMS ===
    txt += '━━━ REVIEW OF SYSTEMS ━━━\n';
    txt += getCheckedBoxes('General', 'ros_general');
    txt += getCheckedBoxes('Respiratory', 'ros_respiratory');
    txt += getCheckedBoxes('Cardiovascular', 'ros_cvs');
    txt += getCheckedBoxes('GI', 'ros_gi');
    txt += getCheckedBoxes('GU', 'ros_gu');
    txt += getCheckedBoxes('Neurological', 'ros_neuro');
    txt += getCheckedBoxes('MSK', 'ros_msk');
    txt += getCheckedBoxes('Skin', 'ros_skin');
    txt += getCheckedBoxes('HEENT', 'ros_heent');
    txt += getCheckedBoxes('Endocrine', 'ros_endocrine');
    txt += getCheckedBoxes('Hematologic', 'ros_hematologic');
    txt += getCheckedBoxes('Psychiatric', 'ros_psychiatric');
    txt += `Details: ${getValue('ros_details')}\n`;
    txt += '\n';
    
    // === PAST MEDICAL HISTORY ===
    txt += '━━━ PAST MEDICAL HISTORY ━━━\n';
    txt += '\nAntenatal History:\n';
    txt += `Gravida: ${getValue('gravida')}, Para: ${getValue('para')}\n`;
    txt += `ANC Visits: ${getValue('anc_visits')}\n`;
    txt += `Maternal Illnesses: ${getValue('maternal_illnesses')}\n`;
    txt += `Medications/Supplements: ${getValue('maternal_medications')}\n`;
    txt += `Substances: ${getValue('substances')}\n`;
    txt += `Complications: ${getValue('antenatal_complications')}\n`;
    
    txt += '\nNatal History:\n';
    txt += `Place of Delivery: ${getValue('place_of_delivery')}\n`;
    txt += `Mode of Delivery: ${getRadioValue('delivery_mode')}\n`;
    if (getRadioValue('delivery_mode') === 'C-section') {
        txt += `C-section Indication: ${getValue('csection_indication')}\n`;
    }
    txt += `Gestational Age: ${getValue('gestational_age')} weeks\n`;
    txt += `Birth Weight: ${getValue('birth_weight')} kg\n`;
    txt += `Birth Length: ${getValue('birth_length')} cm\n`;
    txt += `Birth Head Circumference: ${getValue('birth_hc')} cm\n`;
    txt += `APGAR Scores: 1min=${getValue('apgar_1')}, 5min=${getValue('apgar_5')}\n`;
    txt += `Resuscitation: ${getRadioValue('resuscitation')}\n`;
    txt += `Cried Immediately: ${getRadioValue('cried_immediately')}\n`;
    txt += `NICU Admission: ${getRadioValue('nicu_admission')}\n`;
    if (getRadioValue('nicu_admission') === 'Yes') {
        txt += `NICU Reason: ${getValue('nicu_reason')}\n`;
        txt += `NICU Duration: ${getValue('nicu_duration')}\n`;
    }
    
    txt += '\nFeeding History:\n';
    txt += `Breastfeeding: ${getRadioValue('breastfeeding')}\n`;
    txt += `Formula Feeding: ${getRadioValue('formula_feeding')}\n`;
    txt += `Complementary Feeding Started: ${getValue('complementary_feeding')}\n`;
    txt += `Current Diet: ${getValue('current_diet')}\n`;
    txt += `24-Hour Diet Recall: ${getValue('diet_recall')}\n`;
    txt += `Feeding Difficulties: ${getValue('feeding_difficulties')}\n`;
    txt += `Supplements: ${getValue('supplements')}\n`;
    txt += `Allergies: ${getValue('allergies')}\n`;
    
    txt += '\nDevelopmental Milestones:\n';
    txt += `Sitting: ${getValue('milestone_sitting')}\n`;
    txt += `Standing: ${getValue('milestone_standing')}\n`;
    txt += `Walking: ${getValue('milestone_walking')}\n`;
    txt += `First Words: ${getValue('milestone_first_words')}\n`;
    txt += `Sentences: ${getValue('milestone_sentences')}\n`;
    txt += `Regression: ${getRadioValue('dev_regression')}\n`;
    if (getRadioValue('dev_regression') === 'Yes') {
        txt += `Regression Details: ${getValue('regression_details')}\n`;
    }
    txt += `School Performance: ${getValue('school_performance')}\n`;
    
    txt += '\nImmunization History:\n';
    txt += `BCG: ${getValue('bcg_date')}\n`;
    txt += `Hepatitis B: ${getValue('hepb_date')}\n`;
    txt += `DPT: ${getValue('dpt_date')}\n`;
    txt += `Polio: ${getValue('polio_date')}\n`;
    txt += `MMR: ${getValue('mmr_date')}\n`;
    txt += `Overall Status: ${getRadioValue('immunization_status')}\n`;
    
    txt += '\nPast Illnesses:\n';
    txt += getTableContent('pastIllnessesTable', ['Illness', 'Date', 'Treatment']);
    
    txt += '\nChronic Diseases:\n';
    txt += getCheckedBoxes('', 'chronic_disease');
    
    txt += '\nCurrent Medications:\n';
    txt += getTableContent('currentMedicationsTable', ['Medication', 'Dose', 'Frequency']);
    txt += '\n';
    
    // === FAMILY & SOCIAL HISTORY ===
    txt += '━━━ FAMILY & SOCIAL HISTORY ━━━\n';
    txt += `Mother's Age: ${getValue('mother_age')}, Occupation: ${getValue('mother_occupation')}\n`;
    txt += `Father's Age: ${getValue('father_age')}, Occupation: ${getValue('father_occupation')}\n`;
    txt += `Consanguinity: ${getRadioValue('consanguinity')}\n`;
    if (getRadioValue('consanguinity') === 'Yes') {
        txt += `Degree: ${getValue('consanguinity_degree')}\n`;
    }
    
    txt += '\nSiblings:\n';
    txt += getTableContent('siblingsTable', ['Name', 'Age', 'Health Status']);
    
    txt += '\nFamily History:\n';
    txt += getCheckedBoxes('', 'family_history');
    txt += `Details: ${getValue('family_history_details')}\n`;
    
    txt += '\nSocial History:\n';
    txt += `Socioeconomic Status: ${getValue('ses')}\n`;
    txt += `Housing: ${getValue('housing')}\n`;
    txt += `Household Size: ${getValue('household_size')}\n`;
    txt += `Water Source: ${getValue('water_source')}\n`;
    txt += `Sanitation: ${getValue('sanitation')}\n`;
    txt += `Electricity: ${getRadioValue('electricity')}\n`;
    txt += `Smoke Exposure: ${getRadioValue('smoke_exposure')}\n`;
    txt += `Pets: ${getValue('pets')}\n`;
    txt += `TB Contact: ${getRadioValue('tb_contact')}\n`;
    txt += `Recent Travel: ${getValue('recent_travel')}\n`;
    txt += `Sick Contacts: ${getValue('sick_contacts')}\n`;
    txt += '\n';
    
    // === DIFFERENTIAL DIAGNOSIS (HISTORY) ===
    txt += '━━━ DIFFERENTIAL DIAGNOSIS (After History) ━━━\n';
    txt += 'Key Features:\n';
    for (let i = 1; i <= 5; i++) {
        const feature = getValue(`key_feature_${i}`);
        if (feature) txt += `  ${i}. ${feature}\n`;
    }
    txt += '\nProvisional Differentials:\n';
    txt += getDifferentials('diffDxHistoryContainer');
    txt += `\nRed Flags:\n`;
    for (let i = 1; i <= 3; i++) {
        const flag = getValue(`red_flag_${i}`);
        if (flag) txt += `  ⚠️ ${flag}\n`;
    }
    txt += `\nClinical Reasoning: ${getValue('clinical_reasoning_history')}\n`;
    txt += '\n';
    
    // === PHYSICAL EXAMINATION ===
    txt += '━━━ PHYSICAL EXAMINATION ━━━\n';
    txt += `General Appearance: ${getValue('general_appearance')}\n`;
    txt += `AVPU: ${getRadioValue('avpu')}\n`;
    txt += `Nutritional Status: ${getRadioValue('nutritional_status')}\n`;
    txt += `Hydration: ${getRadioValue('hydration_status')}\n`;
    txt += `Activity Level: ${getRadioValue('activity_level')}\n`;
    txt += `Distress: ${getRadioValue('distress')}\n`;
    
    txt += '\nVital Signs:\n';
    txt += `Temperature: ${getValue('temp')}°C\n`;
    txt += `Heart Rate: ${getValue('hr')} bpm\n`;
    txt += `Respiratory Rate: ${getValue('rr')} /min\n`;
    txt += `Blood Pressure: ${getValue('bp_systolic')}/${getValue('bp_diastolic')} mmHg\n`;
    txt += `SpO2: ${getValue('spo2')}%\n`;
    txt += `Oxygen Support: ${getRadioValue('oxygen_support')}\n`;
    if (getRadioValue('oxygen_support') === 'Yes') {
        txt += `O2 Flow Rate: ${getValue('oxygen_flow')}\n`;
    }
    
    txt += '\nDehydration Assessment:\n';
    const dehydrationResult = document.getElementById('dehydrationResult')?.textContent;
    if (dehydrationResult) txt += dehydrationResult + '\n';
    
    txt += '\nSkin, Hair & Nails:\n';
    txt += `Findings: ${getValue('skin_findings')}\n`;
    txt += `Rash: ${getRadioValue('rash')}\n`;
    if (getRadioValue('rash') === 'Yes') {
        txt += `Rash Details: ${getCheckedBoxes('', 'rash_type')}\n`;
    }
    txt += `Jaundice: ${getRadioValue('jaundice')}\n`;
    txt += `Cyanosis: ${getRadioValue('cyanosis')}\n`;
    txt += `Pallor: ${getRadioValue('pallor')}\n`;
    txt += `Edema: ${getRadioValue('edema')}\n`;
    
    txt += '\nHead & Fontanelles:\n';
    txt += getValue('head_findings') + '\n';
    
    txt += '\nEyes:\n';
    txt += getValue('eyes_findings') + '\n';
    
    txt += '\nENT:\n';
    txt += getValue('ent_findings') + '\n';
    
    txt += '\nNeck:\n';
    txt += `Lymph Nodes: ${getRadioValue('lymph_nodes')}\n`;
    txt += `Neck Stiffness: ${getRadioValue('neck_stiffness')}\n`;
    txt += getValue('neck_findings') + '\n';
    
    txt += '\nRespiratory:\n';
    txt += `Respiratory Effort: ${getValue('resp_effort')}\n`;
    txt += `Air Entry: ${getValue('air_entry')}\n`;
    txt += `Breath Sounds: ${getValue('breath_sounds')}\n`;
    txt += `Added Sounds: ${getValue('added_sounds')}\n`;
    txt += getValue('resp_findings') + '\n';
    
    txt += '\nCardiovascular:\n';
    txt += `Heart Sounds: ${getValue('heart_sounds')}\n`;
    txt += `Murmur: ${getRadioValue('murmur')}\n`;
    txt += `Pulses: ${getValue('pulses')}\n`;
    txt += `Capillary Refill: ${getValue('cap_refill')}\n`;
    txt += getValue('cvs_findings') + '\n';
    
    txt += '\nAbdomen:\n';
    txt += `Shape: ${getValue('abdomen_shape')}\n`;
    txt += `Tenderness: ${getRadioValue('tenderness')}\n`;
    txt += `Hepatomegaly: ${getRadioValue('hepatomegaly')}\n`;
    txt += `Splenomegaly: ${getRadioValue('splenomegaly')}\n`;
    txt += `Masses: ${getRadioValue('masses')}\n`;
    txt += getValue('abdomen_findings') + '\n';
    
    txt += '\nGenitourinary:\n';
    txt += getValue('gu_findings') + '\n';
    
    txt += '\nMusculoskeletal & Neurological:\n';
    txt += `Tone: ${getValue('tone')}\n`;
    txt += `Gait: ${getValue('gait')}\n`;
    txt += `Reflexes: ${getValue('reflexes')}\n`;
    txt += `Meningeal Signs: ${getRadioValue('meningeal_signs')}\n`;
    txt += getValue('neuro_findings') + '\n';
    txt += '\n';
    
    // === DIFFERENTIAL DIAGNOSIS (FINAL) ===
    txt += '━━━ DIFFERENTIAL DIAGNOSIS (Final) ━━━\n';
    txt += getDifferentials('diffDxFinalContainer');
    txt += `\nWorking Diagnosis: ${getValue('working_diagnosis')}\n`;
    txt += `Basis for Diagnosis: ${getValue('diagnosis_basis')}\n`;
    txt += `Clinical Reasoning: ${getValue('clinical_reasoning_final')}\n`;
    txt += '\n';
    
    // === INVESTIGATIONS ===
    txt += '━━━ INVESTIGATIONS ━━━\n';
    txt += 'Investigation Plan:\n';
    txt += getTableContent('investigationPlanTable', ['Investigation', 'Rationale', 'Results']);
    
    txt += '\nComplete Blood Count:\n';
    txt += `WBC: ${getValue('wbc')} × 10⁹/L\n`;
    txt += `Hemoglobin: ${getValue('hb')} g/dL\n`;
    txt += `Platelets: ${getValue('platelets')} × 10⁹/L\n`;
    txt += `Neutrophils: ${getValue('neutrophils')}%\n`;
    txt += `Lymphocytes: ${getValue('lymphocytes')}%\n`;
    const cbcInterp = document.getElementById('cbcInterpretation')?.textContent;
    if (cbcInterp) txt += `Interpretation: ${cbcInterp}\n`;
    
    txt += '\nMetabolic Panel:\n';
    txt += `Glucose: ${getValue('glucose')} mmol/L\n`;
    txt += `Sodium: ${getValue('sodium')} mmol/L\n`;
    txt += `Potassium: ${getValue('potassium')} mmol/L\n`;
    txt += `Creatinine: ${getValue('creatinine')} μmol/L\n`;
    txt += `Urea: ${getValue('urea')} mmol/L\n`;
    const metaInterp = document.getElementById('metabolicInterpretation')?.textContent;
    if (metaInterp) txt += `Interpretation: ${metaInterp}\n`;
    
    txt += `\nImaging Results: ${getValue('imaging_results')}\n`;
    txt += `Other Results: ${getValue('other_results')}\n`;
    txt += `Investigation Summary: ${getValue('investigation_summary')}\n`;
    txt += '\n';
    
    // === MANAGEMENT ===
    txt += '━━━ MANAGEMENT PLAN ━━━\n';
    txt += `Admission Decision: ${getRadioValue('admission_decision')}\n`;
    txt += `Ward: ${getValue('ward')}\n`;
    
    txt += '\nProblem List:\n';
    txt += getTableContent('problemListTable', ['Problem', 'Status']);
    
    txt += '\nFluid Management:\n';
    const fluidResult = document.getElementById('fluidResult')?.textContent;
    if (fluidResult) txt += fluidResult + '\n';
    txt += getValue('fluid_plan') + '\n';
    
    txt += '\nMedications:\n';
    txt += getTableContent('managementMedsTable', ['Medication', 'Dose', 'Route', 'Frequency']);
    
    txt += `\nNutritional Management: ${getValue('nutrition_plan')}\n`;
    txt += `Monitoring: ${getValue('monitoring_plan')}\n`;
    txt += `Nursing Orders: ${getValue('nursing_orders')}\n`;
    txt += `Problem-Based Plans: ${getValue('problem_plans')}\n`;
    
    txt += '\nDischarge Planning:\n';
    txt += `Diagnosis: ${getValue('discharge_diagnosis')}\n`;
    txt += `Condition: ${getValue('discharge_condition')}\n`;
    txt += `Medications: ${getValue('discharge_medications')}\n`;
    txt += `Follow-up: ${getValue('discharge_followup')}\n`;
    txt += `Instructions: ${getValue('discharge_instructions')}\n`;
    txt += '\n';
    
    // === PROGRESS NOTES ===
    txt += '━━━ PROGRESS NOTES ━━━\n';
    txt += getProgressNotes();
    txt += '\n';
    
    // === NEONATAL TAB ===
    txt += '━━━ NEONATAL ASSESSMENT ━━━\n';
    txt += `Baby Identification: ${getValue('neonatal_baby_id')}\n`;
    txt += `Mother's Name: ${getValue('neonatal_mother_name')}\n`;
    txt += `Date of Birth: ${getValue('neonatal_dob')}\n`;
    txt += `Admission Date/Time: ${getValue('neonatal_admission_datetime')}\n`;
    txt += `Age at Admission: ${getValue('neonatal_age_at_admission')}\n`;
    
    txt += '\nMaternal/Obstetric History:\n';
    txt += getValue('neonatal_maternal_history') + '\n';
    
    txt += '\nDelivery Details:\n';
    txt += `Mode: ${getRadioValue('neonatal_delivery_mode')}\n`;
    txt += `Birth Weight: ${getValue('neonatal_birth_weight')} kg\n`;
    txt += `Gestational Age: ${getValue('neonatal_ga')} weeks\n`;
    const neonatalClass = document.getElementById('neonatalClassification')?.innerHTML;
    if (neonatalClass) txt += `Classification: ${neonatalClass}\n`;
    
    txt += `\nNeonatal Exam Findings: ${getValue('neonatal_exam_findings')}\n`;
    txt += `Primitive Reflexes: ${getValue('neonatal_reflexes')}\n`;
    
    txt += '\nNeonatal Medications:\n';
    txt += getTableContent('neonatalMedicationsTable', ['Medication', 'Dose', 'Route']);
    
    txt += `\nDiagnosis & Plan: ${getValue('neonatal_diagnosis_plan')}\n`;
    txt += `Family Counselling: ${getValue('neonatal_counselling')}\n`;
    txt += '\n';
    
    txt += '═══════════════════════════════════════════════════════════\n';
    txt += `Generated: ${new Date().toLocaleString()}\n`;
    txt += '═══════════════════════════════════════════════════════════\n';
    
    return txt;
}

// Helper functions for TXT generation
function getValue(id) {
    return document.getElementById(id)?.value || '';
}

function getRadioValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function getCheckedBoxes(label, name) {
    const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(cb => cb.value);
    if (checked.length === 0) return '';
    return (label ? label + ': ' : '') + checked.join(', ') + '\n';
}

function getTableContent(tableId, headers) {
    const table = document.getElementById(tableId);
    if (!table) return 'N/A\n';
    
    let content = '';
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach((row, idx) => {
        const inputs = row.querySelectorAll('input, textarea, select');
        const values = Array.from(inputs)
            .slice(0, headers.length)
            .map(input => input.value.trim())
            .filter(v => v);
        
        if (values.length > 0) {
            content += `  ${idx + 1}. ${values.join(' | ')}\n`;
        }
    });
    
    return content || '  None recorded\n';
}

function getDifferentials(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return 'N/A\n';
    
    let content = '';
    const items = container.querySelectorAll('.differential-item');
    
    items.forEach((item, idx) => {
        const diagnosis = item.querySelector('input[type="text"]')?.value;
        const supporting = item.querySelectorAll('textarea')[0]?.value;
        const against = item.querySelectorAll('textarea')[1]?.value;
        
        if (diagnosis) {
            content += `  ${idx + 1}. ${diagnosis}\n`;
            if (supporting) content += `     Supporting: ${supporting}\n`;
            if (against) content += `     Against: ${against}\n`;
        }
    });
    
    return content || '  None recorded\n';
}

function getProgressNotes() {
    const container = document.getElementById('progressNotesContainer');
    if (!container) return 'None recorded\n';
    
    let content = '';
    const notes = container.querySelectorAll('.progress-note-card');
    
    notes.forEach((note, idx) => {
        const datetime = note.querySelector('input[type="datetime-local"]')?.value;
        const textareas = note.querySelectorAll('textarea');
        const subjective = textareas[0]?.value;
        const objective = textareas[1]?.value;
        const assessment = textareas[2]?.value;
        const plan = textareas[3]?.value;
        
        content += `\nProgress Note #${idx + 1} - ${datetime || 'No date'}\n`;
        if (subjective) content += `S: ${subjective}\n`;
        if (objective) content += `O: ${objective}\n`;
        if (assessment) content += `A: ${assessment}\n`;
        if (plan) content += `P: ${plan}\n`;
    });
    
    return content || 'None recorded\n';
}

// ============================================================================
// DOWNLOAD AS JSON (Full Backup)
// ============================================================================

function downloadJSON() {
    const data = gatherFormData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const patientName = document.getElementById('patient_name')?.value || 'Patient';
    const fileName = `${patientName.replace(/\s+/g, '_')}_Backup.json`;
    
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('JSON backup downloaded!', 'success');
}

// ============================================================================
// IMPORT JSON BACKUP
// ============================================================================

function importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                // Restore data
                Object.keys(data).forEach(key => {
                    if (key === '_dynamicTables') return; // Handle separately
                    
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
                
                // Restore dynamic tables
                if (data._dynamicTables) {
                    restoreDynamicTables(data._dynamicTables);
                }
                
                // Save to localStorage
                localStorage.setItem('clerkshipData', JSON.stringify(data));
                
                // Recalculate everything
                calculateAge();
                calculateGrowth();
                updateVitalIndicators();
                interpretLabs();
                classifyNewborn();
                toggleConditionalFields();
                updateProgress();
                
                showToast('Data imported successfully!', 'success');
                
            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing file. Please check the file format.', 'danger');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast') || createToastElement();
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function createToastElement() {
    const t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
    return t;
}
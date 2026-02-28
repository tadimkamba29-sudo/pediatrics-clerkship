/**
 * Export and Print logic
 * Handles TXT download, JSON backup/restore, printing, and Neonatal-only exports
 *
 * v2 — Fixed: importJSON now calls calculateAllZScores, minor improvements
 */

// ============================================================================
// PRINT
// ============================================================================

function printForm() {
    window.print();
}

// ============================================================================
// DOWNLOAD AS TXT
// ============================================================================

function downloadTXT() {
    const content = generateTXTContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const patientName = document.getElementById('patient_name')?.value || 'Patient';
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${patientName.replace(/\s+/g, '_')}_Clerkship_${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('TXT file downloaded!', 'success');
}

function generateTXTContent() {
    let txt = '';

    txt += '═══════════════════════════════════════════════════════════\n';
    txt += '           PEDIATRICS CLERKSHIP SUMMARY\n';
    txt += '═══════════════════════════════════════════════════════════\n\n';

    // PATIENT INFORMATION
    txt += '━━━ PATIENT INFORMATION ━━━\n';
    txt += `Name: ${getValue('patient_name')}\n`;
    txt += `MRN: ${getValue('mrn')}\n`;
    txt += `Date of Birth: ${getValue('dob')}\n`;
    txt += `Age: ${getValue('age')}\n`;
    txt += `Sex: ${getValue('sex')}\n`;
    txt += `Religion: ${getValue('religion')}\n`;
    txt += `Place of Birth: ${getValue('place_of_birth')}\n`;
    txt += `Place of Residence: ${getValue('place_of_residence')}\n`;
    txt += `Exam Date: ${getValue('exam_date')}\n`;
    txt += `Hospital/Facility: ${getValue('hospital')}\n`;
    txt += `Ward: ${getValue('ward')}\n`;
    txt += `Admission Date: ${getValue('admission_date')}\n`;
    txt += `Attending: ${getValue('attending')}\n`;
    txt += `Informant: ${getValue('informant')} (${getValue('informant_reliability')})\n`;
    txt += '\n';

    // HIV/RVD
    txt += '━━━ HIV/RVD STATUS ━━━\n';
    txt += `HIV Status: ${getRadioValue('hiv_status')}\n`;
    if (getRadioValue('hiv_status') === 'Positive') {
        txt += `Details: ${getValue('hiv_details')}\n`;
    }
    txt += `Last Test Date: ${getValue('hiv_test_date')}\n\n`;

    // CHIEF COMPLAINT
    txt += '━━━ CHIEF COMPLAINT ━━━\n';
    for (let i = 1; i <= 3; i++) {
        const complaint = getValue(`complaint_${i}`);
        const duration = getValue(`duration_${i}`);
        if (complaint) txt += `${i}. ${complaint}${duration ? ' — ' + duration : ''}\n`;
    }
    txt += `\nHistory of Present Illness:\n${getValue('hpi')}\n\n`;

    // SYMPTOM CHARACTERIZATION
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
    txt += `Effect on Activity: ${getValue('effect_activity')}\n\n`;

    // PRIOR TREATMENT
    txt += '━━━ PRIOR TREATMENT ━━━\n';
    txt += getTableContent('priorTreatmentTable', ['Medication/Treatment', 'Dose/Frequency', 'Response']);
    txt += '\n';

    // REVIEW OF SYSTEMS
    txt += '━━━ REVIEW OF SYSTEMS ━━━\n';
    txt += getROSFindings();
    txt += `Details: ${getValue('ros_details')}\n\n`;

    // PAST MEDICAL HISTORY
    txt += '━━━ PAST MEDICAL HISTORY ━━━\n';
    txt += '\nAntenatal History:\n';
    txt += `G${getValue('gravida')} P${getValue('para')}, ANC Visits: ${getValue('anc_visits')}\n`;
    txt += `Maternal Illnesses: ${getValue('maternal_illnesses')}\n`;
    txt += `Medications/Supplements: ${getValue('maternal_medications')}\n`;
    txt += `Substances: ${getValue('substances')}\n`;
    txt += `Complications: ${getValue('antenatal_complications')}\n`;

    txt += '\nNatal History:\n';
    txt += `Place of Delivery: ${getValue('place_of_delivery')}\n`;
    txt += `Mode of Delivery: ${getRadioValue('delivery_mode')}`;
    if (getRadioValue('delivery_mode') === 'C-section') {
        txt += ` (${getValue('csection_indication')})`;
    }
    txt += '\n';
    txt += `GA: ${getValue('gestational_age')} wks, Birth Weight: ${getValue('birth_weight')} kg, Birth Length: ${getValue('birth_length')} cm, Birth HC: ${getValue('birth_hc')} cm\n`;
    txt += `APGAR: 1min=${getValue('apgar_1')}, 5min=${getValue('apgar_5')}\n`;
    txt += `Resuscitation: ${getRadioValue('resuscitation')}, Cried immediately: ${getRadioValue('cried_immediately')}\n`;
    txt += `NICU: ${getRadioValue('nicu_admission')}`;
    if (getRadioValue('nicu_admission') === 'Yes') {
        txt += ` — ${getValue('nicu_reason')} (${getValue('nicu_duration')})`;
    }
    txt += '\n';

    txt += '\nFeeding History:\n';
    txt += `Breastfeeding: ${getRadioValue('breastfeeding')}, Formula: ${getRadioValue('formula_feeding')}\n`;
    txt += `Complementary Feeding Started: ${getValue('complementary_feeding')}\n`;
    txt += `Current Diet: ${getValue('current_diet')}\n`;
    txt += `24-Hour Recall: ${getValue('diet_recall')}\n`;
    txt += `Feeding Difficulties: ${getValue('feeding_difficulties')}\n`;
    txt += `Supplements: ${getValue('supplements')}, Allergies: ${getValue('allergies')}\n`;

    txt += '\nDevelopmental Milestones:\n';
    txt += `Sitting: ${getValue('milestone_sitting')}, Standing: ${getValue('milestone_standing')}, Walking: ${getValue('milestone_walking')}\n`;
    txt += `First Words: ${getValue('milestone_first_words')}, Sentences: ${getValue('milestone_sentences')}\n`;
    txt += `Regression: ${getRadioValue('dev_regression')}`;
    if (getRadioValue('dev_regression') === 'Yes') txt += ` — ${getValue('regression_details')}`;
    txt += '\n';
    txt += `School Performance: ${getValue('school_performance')}\n`;

    txt += '\nImmunization History:\n';
    txt += `BCG: ${getValue('bcg_date')}, HepB: ${getValue('hepb_date')}, DPT: ${getValue('dpt_date')}, Polio: ${getValue('polio_date')}, MMR: ${getValue('mmr_date')}\n`;
    txt += `Overall Status: ${getRadioValue('immunization_status')}\n`;

    txt += '\nPast Illnesses:\n';
    txt += getTableContent('pastIllnessesTable', ['Illness', 'Date', 'Treatment']);

    txt += '\nChronic Diseases:\n';
    txt += getCheckedBoxes('', 'chronic_disease');

    txt += '\nCurrent Medications:\n';
    txt += getTableContent('currentMedicationsTable', ['Medication', 'Dose', 'Frequency']);
    txt += '\n';

    // FAMILY & SOCIAL HISTORY
    txt += '━━━ FAMILY & SOCIAL HISTORY ━━━\n';
    txt += `Mother: Age ${getValue('mother_age')}, ${getValue('mother_occupation')}\n`;
    txt += `Father: Age ${getValue('father_age')}, ${getValue('father_occupation')}\n`;
    txt += `Consanguinity: ${getRadioValue('consanguinity')}`;
    if (getRadioValue('consanguinity') === 'Yes') txt += ` (${getValue('consanguinity_degree')})`;
    txt += '\n';

    txt += '\nSiblings:\n';
    txt += getTableContent('siblingsTable', ['Name/Age', 'Sex', 'Health Status']);

    txt += '\nFamily History:\n';
    txt += getCheckedBoxes('', 'family_history');
    txt += `Details: ${getValue('family_history_details')}\n`;

    txt += '\nSocial History:\n';
    txt += `SES: ${getValue('ses')}, Housing: ${getValue('housing')}, Household: ${getValue('household_size')}\n`;
    txt += `Water: ${getValue('water_source')}, Sanitation: ${getValue('sanitation')}, Electricity: ${getRadioValue('electricity')}\n`;
    txt += `Smoke Exposure: ${getRadioValue('smoke_exposure')}, Pets: ${getValue('pets')}, TB Contact: ${getRadioValue('tb_contact')}\n`;
    txt += `Recent Travel: ${getValue('recent_travel')}, Sick Contacts: ${getValue('sick_contacts')}\n\n`;

    // DIFFERENTIAL DIAGNOSIS (HISTORY)
    txt += '━━━ DIFFERENTIAL DIAGNOSIS (After History) ━━━\n';
    txt += 'Key Clinical Features:\n';
    for (let i = 1; i <= 5; i++) {
        const feature = getValue(`key_feature_${i}`);
        if (feature) txt += `  ${i}. ${feature}\n`;
    }
    txt += '\nProvisional Differentials:\n';
    txt += getDifferentials('diffDxHistoryContainer');
    txt += '\nRed Flags:\n';
    for (let i = 1; i <= 3; i++) {
        const flag = getValue(`red_flag_${i}`);
        if (flag) txt += `  ⚠️ ${flag}\n`;
    }
    txt += `\nClinical Reasoning:\n${getValue('clinical_reasoning_history')}\n\n`;

    // PHYSICAL EXAMINATION
    txt += '━━━ PHYSICAL EXAMINATION ━━━\n';
    txt += `\nAnthropometry:\n`;
    txt += `Weight: ${getValue('weight')} kg, Height: ${getValue('height')} cm, HC: ${getValue('head_circ')} cm, MUAC: ${getValue('muac')} cm\n`;
    const bmi = document.getElementById('bmiValue')?.textContent;
    if (bmi && bmi !== '--') txt += `BMI: ${bmi} kg/m²\n`;
    txt += `WAZ: ${getValue('waz')}, HAZ: ${getValue('haz')}, WHZ: ${getValue('whz')}, HCZ: ${getValue('hcz')}\n`;
    txt += `Weight Percentile: ${getValue('weight_percentile')}, Height Percentile: ${getValue('height_percentile')}\n`;

    txt += `\nGeneral Inspection:\n${getValue('general_inspection')}\n`;
    txt += `General Appearance: ${getValue('general_appearance')}\n`;
    txt += `AVPU: ${getRadioValue('avpu')}, Nutritional: ${getRadioValue('nutritional_status')}, Hydration: ${getRadioValue('hydration_status')}\n`;
    txt += `Activity: ${getRadioValue('activity_level')}, Distress: ${getRadioValue('distress')}\n`;

    txt += '\nVital Signs:\n';
    txt += `Temp: ${getValue('temp')}°C, HR: ${getValue('hr')} bpm, RR: ${getValue('rr')} /min\n`;
    txt += `BP: ${getValue('bp_systolic')}/${getValue('bp_diastolic')} mmHg, SpO₂: ${getValue('spo2')}%\n`;
    txt += `O₂ Support: ${getRadioValue('oxygen_support')}`;
    if (getRadioValue('oxygen_support') === 'Yes') txt += ` @ ${getValue('oxygen_flow')} L/min`;
    txt += '\n';

    txt += '\nDehydration Assessment:\n';
    const dehydrationResult = document.getElementById('dehydrationResult')?.textContent;
    if (dehydrationResult) txt += dehydrationResult.trim() + '\n';

    txt += `\nSkin: ${getValue('skin_findings')}, Rash: ${getRadioValue('rash')}`;
    if (getRadioValue('rash') === 'Yes') txt += ` (${getCheckedBoxes('', 'rash_type').trim()})`;
    txt += `\nJaundice: ${getRadioValue('jaundice')}, Cyanosis: ${getRadioValue('cyanosis')}, Pallor: ${getRadioValue('pallor')}, Oedema: ${getRadioValue('edema')}\n`;

    txt += `\nHead & Fontanelles:\n${getValue('head_findings')}\n`;
    txt += `\nEyes:\n${getValue('eyes_findings')}\n`;
    txt += `\nENT:\n${getValue('ent_findings')}\n`;
    txt += `\nNeck:\nLymph Nodes: ${getRadioValue('lymph_nodes')}, Neck Stiffness: ${getRadioValue('neck_stiffness')}\n${getValue('neck_findings')}\n`;

    txt += `\nRespiratory:\n`;
    txt += `Effort: ${getValue('resp_effort')}, Air Entry: ${getValue('air_entry')}, Breath Sounds: ${getValue('breath_sounds')}, Added: ${getValue('added_sounds')}\n`;
    txt += getValue('resp_findings') + '\n';

    txt += `\nCardiovascular:\n`;
    txt += `Heart Sounds: ${getValue('heart_sounds')}, Murmur: ${getRadioValue('murmur')}, Pulses: ${getValue('pulses')}, CRT: ${getValue('cap_refill')}\n`;
    txt += getValue('cvs_findings') + '\n';

    txt += `\nAbdomen:\n`;
    txt += `Shape: ${getValue('abdomen_shape')}, Tenderness: ${getRadioValue('tenderness')}, Hepatomegaly: ${getRadioValue('hepatomegaly')}, Splenomegaly: ${getRadioValue('splenomegaly')}, Masses: ${getRadioValue('masses')}\n`;
    txt += getValue('abdomen_findings') + '\n';

    txt += `\nGenitourinary:\n${getValue('gu_findings')}\n`;

    txt += `\nMusculoskeletal & Neurological:\n`;
    txt += `Tone: ${getValue('tone')}, Gait: ${getValue('gait')}, Reflexes: ${getValue('reflexes')}, Meningeal Signs: ${getRadioValue('meningeal_signs')}\n`;
    txt += getValue('neuro_findings') + '\n\n';

    // FINAL DIFFERENTIAL DIAGNOSIS
    txt += '━━━ DIFFERENTIAL DIAGNOSIS (Final) ━━━\n';
    txt += getDifferentials('diffDxFinalContainer');
    txt += `\nWorking Diagnosis: ${getValue('working_diagnosis')}\n`;
    txt += `Basis: ${getValue('diagnosis_basis')}\n`;
    txt += `Clinical Reasoning:\n${getValue('clinical_reasoning_final')}\n\n`;

    // INVESTIGATIONS
    txt += '━━━ INVESTIGATIONS ━━━\n';
    txt += 'Investigation Plan:\n';
    txt += getTableContent('investigationPlanTable', ['Investigation', 'Rationale', 'Expected Findings']);

    txt += '\nComplete Blood Count:\n';
    txt += `WBC: ${getValue('wbc')} ×10⁹/L, Hb: ${getValue('hb')} g/dL, Plt: ${getValue('platelets')} ×10⁹/L\n`;
    txt += `Neutrophils: ${getValue('neutrophils')}%, Lymphocytes: ${getValue('lymphocytes')}%\n`;
    const cbcInterp = document.getElementById('cbcInterpretation')?.textContent;
    if (cbcInterp && cbcInterp.trim()) txt += `Interpretation: ${cbcInterp.trim()}\n`;

    txt += '\nMetabolic Panel:\n';
    txt += `Glucose: ${getValue('glucose')} mmol/L, Na: ${getValue('sodium')} mmol/L, K: ${getValue('potassium')} mmol/L\n`;
    txt += `Creatinine: ${getValue('creatinine')} μmol/L, Urea: ${getValue('urea')} mmol/L\n`;
    const metaInterp = document.getElementById('metabolicInterpretation')?.textContent;
    if (metaInterp && metaInterp.trim()) txt += `Interpretation: ${metaInterp.trim()}\n`;

    txt += `\nImaging: ${getValue('imaging_results')}\n`;
    txt += `Other Results: ${getValue('other_results')}\n`;
    txt += `Summary: ${getValue('investigation_summary')}\n\n`;

    // MANAGEMENT
    txt += '━━━ MANAGEMENT PLAN ━━━\n';
    txt += `Disposition: ${getRadioValue('admission_decision')}, Ward: ${getValue('ward_management')}\n`;

    txt += '\nProblem List:\n';
    txt += getTableContent('problemListTable', ['Problem', 'Status']);

    txt += '\nFluid Management:\n';
    const fluidResult = document.getElementById('fluidResult')?.textContent;
    if (fluidResult && fluidResult.trim()) txt += fluidResult.trim() + '\n';
    txt += getValue('fluid_plan') + '\n';

    txt += '\nMedications:\n';
    txt += getTableContent('managementMedsTable', ['Medication', 'Dose', 'Route', 'Frequency']);

    txt += `\nNutrition: ${getValue('nutrition_plan')}\n`;
    txt += `Monitoring: ${getValue('monitoring_plan')}\n`;
    txt += `Nursing Orders: ${getValue('nursing_orders')}\n`;
    txt += `Problem Plans:\n${getValue('problem_plans')}\n`;

    txt += '\nDischarge:\n';
    txt += `Diagnosis: ${getValue('discharge_diagnosis')}, Condition: ${getValue('discharge_condition')}\n`;
    txt += `Medications: ${getValue('discharge_medications')}\n`;
    txt += `Follow-up: ${getValue('discharge_followup')}\n`;
    txt += `Instructions: ${getValue('discharge_instructions')}\n\n`;

    // PROGRESS NOTES
    txt += '━━━ PROGRESS NOTES ━━━\n';
    txt += getProgressNotes();
    txt += '\n';

    // NEONATAL
    txt += '━━━ NEONATAL ASSESSMENT ━━━\n';
    txt += `Baby: ${getValue('neonatal_baby_id')}, Mother: ${getValue('neonatal_mother_name')}\n`;
    txt += `DOB: ${getValue('neonatal_dob')}, Admission: ${getValue('neonatal_admission_datetime')}, Age at Admission: ${getValue('neonatal_age_at_admission')}\n`;
    txt += `\nMaternal History:\n${getValue('neonatal_maternal_history')}\n`;
    txt += `\nDelivery: ${getRadioValue('neonatal_delivery_mode')}`;
    if (getRadioValue('neonatal_delivery_mode') === 'LSCS') txt += ` (${getValue('neonatal_lscs_indication')})`;
    txt += '\n';
    txt += `BW: ${getValue('neonatal_birth_weight')} kg, BL: ${getValue('neonatal_birth_length')} cm, BHC: ${getValue('neonatal_birth_hc')} cm, GA: ${getValue('neonatal_ga')} wks\n`;
    const neonatalClass = document.getElementById('neonatalClassification')?.textContent;
    if (neonatalClass && neonatalClass.trim()) txt += `Classification: ${neonatalClass.trim()}\n`;
    txt += `\nExam:\n${getValue('neonatal_exam_findings')}\n`;
    txt += `Primitive Reflexes: ${getValue('neonatal_reflexes')}\n`;
    txt += '\nMedications:\n';
    txt += getTableContent('neonatalMedicationsTable', ['Medication', 'Dose', 'Route']);
    txt += `\nDiagnosis & Plan:\n${getValue('neonatal_diagnosis_plan')}\n`;
    txt += `Family Counselling:\n${getValue('neonatal_counselling')}\n\n`;

    txt += '═══════════════════════════════════════════════════════════\n';
    txt += `Generated: ${new Date().toLocaleString()}\n`;
    txt += '═══════════════════════════════════════════════════════════\n';

    return txt;
}

// ============================================================================
// NEONATAL-ONLY EXPORT — TXT
// ============================================================================

function downloadNeonatalTXT() {
    const content = generateNeonatalTXTContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const babyId = document.getElementById('neonatal_baby_id')?.value || 'Neonate';
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${babyId.replace(/\s+/g, '_')}_Neonatal_${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Neonatal TXT downloaded!', 'success');
}

function generateNeonatalTXTContent() {
    let txt = '';
    txt += '═══════════════════════════════════════════════════════════\n';
    txt += '           NEONATAL CLERKSHIP SUMMARY\n';
    txt += '═══════════════════════════════════════════════════════════\n\n';

    txt += `Baby: ${getValue('neonatal_baby_id')}\n`;
    txt += `Mother: ${getValue('neonatal_mother_name')}\n`;
    txt += `DOB: ${getValue('neonatal_dob')}\n`;
    txt += `Admission: ${getValue('neonatal_admission_datetime')}\n`;
    txt += `Age at Admission: ${getValue('neonatal_age_at_admission')}\n\n`;

    txt += '━━━ MATERNAL/OBSTETRIC HISTORY ━━━\n';
    txt += getValue('neonatal_maternal_history') + '\n\n';

    txt += '━━━ DELIVERY ━━━\n';
    txt += `Mode: ${getRadioValue('neonatal_delivery_mode')}`;
    if (getRadioValue('neonatal_delivery_mode') === 'LSCS') txt += ` (${getValue('neonatal_lscs_indication')})`;
    txt += '\n\n';

    txt += '━━━ BIRTH MEASUREMENTS ━━━\n';
    txt += `Weight: ${getValue('neonatal_birth_weight')} kg, Length: ${getValue('neonatal_birth_length')} cm, HC: ${getValue('neonatal_birth_hc')} cm\n`;
    txt += `GA: ${getValue('neonatal_ga')} wks\n`;
    const classification = document.getElementById('neonatalClassification')?.textContent;
    if (classification && classification.trim()) txt += `Classification: ${classification.trim()}\n`;
    txt += '\n';

    txt += '━━━ PHYSICAL EXAMINATION ━━━\n';
    txt += getValue('neonatal_exam_findings') + '\n\n';

    txt += '━━━ PRIMITIVE REFLEXES ━━━\n';
    txt += getValue('neonatal_reflexes') + '\n\n';

    txt += '━━━ MEDICATIONS ━━━\n';
    txt += getTableContent('neonatalMedicationsTable', ['Medication', 'Dose', 'Route']);
    txt += '\n';

    txt += '━━━ DIAGNOSIS & PLAN ━━━\n';
    txt += getValue('neonatal_diagnosis_plan') + '\n\n';

    txt += '━━━ FAMILY COUNSELLING ━━━\n';
    txt += getValue('neonatal_counselling') + '\n\n';

    txt += '═══════════════════════════════════════════════════════════\n';
    txt += `Generated: ${new Date().toLocaleString()}\n`;
    txt += '═══════════════════════════════════════════════════════════\n';

    return txt;
}

// ============================================================================
// NEONATAL-ONLY EXPORT — JSON
// ============================================================================

function downloadNeonatalJSON() {
    const neonatalFields = [
        'neonatal_baby_id', 'neonatal_mother_name', 'neonatal_dob',
        'neonatal_admission_datetime', 'neonatal_age_at_admission',
        'neonatal_maternal_history', 'neonatal_lscs_indication',
        'neonatal_birth_weight', 'neonatal_birth_length', 'neonatal_birth_hc',
        'neonatal_ga', 'neonatal_exam_findings', 'neonatal_reflexes',
        'neonatal_diagnosis_plan', 'neonatal_counselling'
    ];

    const data = {};
    neonatalFields.forEach(field => {
        const el = document.getElementById(field);
        if (el) data[field] = el.value;
    });

    data.neonatal_delivery_mode = getRadioValue('neonatal_delivery_mode');

    data._neonatalMedications = [];
    const table = document.getElementById('neonatalMedicationsTable');
    if (table) {
        table.querySelectorAll('tbody tr').forEach(row => {
            const inputs = row.querySelectorAll('input');
            data._neonatalMedications.push([
                inputs[0]?.value || '',
                inputs[1]?.value || '',
                inputs[2]?.value || ''
            ]);
        });
    }

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const babyId = document.getElementById('neonatal_baby_id')?.value || 'Neonate';
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${babyId.replace(/\s+/g, '_')}_Neonatal_Backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Neonatal JSON backup downloaded!', 'success');
}

// ============================================================================
// ROS FINDINGS
// ============================================================================

function getROSFindings() {
    const rosItems = [
        { name: 'ros_fever', label: 'Fever' },
        { name: 'ros_weight_loss', label: 'Weight Loss' },
        { name: 'ros_fatigue', label: 'Fatigue' },
        { name: 'ros_night_sweats', label: 'Night Sweats' },
        { name: 'ros_poor_appetite', label: 'Poor Appetite' },
        { name: 'ros_cough', label: 'Cough' },
        { name: 'ros_dyspnea', label: 'Difficulty Breathing' },
        { name: 'ros_wheeze', label: 'Wheezing' },
        { name: 'ros_chest_pain', label: 'Chest Pain' },
        { name: 'ros_palpitations', label: 'Palpitations' },
        { name: 'ros_syncope', label: 'Syncope' },
        { name: 'ros_edema', label: 'Oedema' },
        { name: 'ros_cyanosis', label: 'Cyanosis' },
        { name: 'ros_nausea', label: 'Nausea' },
        { name: 'ros_vomiting', label: 'Vomiting' },
        { name: 'ros_diarrhea', label: 'Diarrhoea' },
        { name: 'ros_constipation', label: 'Constipation' },
        { name: 'ros_abdo_pain', label: 'Abdominal Pain' },
        { name: 'ros_blood_stool', label: 'Blood in Stool' },
        { name: 'ros_dysuria', label: 'Dysuria' },
        { name: 'ros_frequency', label: 'Urinary Frequency' },
        { name: 'ros_hematuria', label: 'Haematuria' },
        { name: 'ros_bedwetting', label: 'Bedwetting' },
        { name: 'ros_headache', label: 'Headache' },
        { name: 'ros_seizures', label: 'Seizures' },
        { name: 'ros_weakness', label: 'Weakness' },
        { name: 'ros_altered_consc', label: 'Altered Consciousness' },
        { name: 'ros_joint_pain', label: 'Joint Pain' },
        { name: 'ros_joint_swelling', label: 'Joint Swelling' },
        { name: 'ros_limping', label: 'Limping' },
        { name: 'ros_rash', label: 'Rash' },
        { name: 'ros_itching', label: 'Itching' },
        { name: 'ros_bruising', label: 'Bruising' },
        { name: 'ros_vision', label: 'Vision Changes' },
        { name: 'ros_ear_pain', label: 'Ear Pain' },
        { name: 'ros_sore_throat', label: 'Sore Throat' },
        { name: 'ros_runny_nose', label: 'Runny Nose' }
    ];

    const positives = [];
    const negatives = [];

    rosItems.forEach(item => {
        const value = getRadioValue(item.name);
        if (value === 'yes') positives.push(item.label);
        else if (value === 'no') negatives.push(item.label);
    });

    let result = '';
    if (positives.length > 0) result += `Positive: ${positives.join(', ')}\n`;
    if (negatives.length > 0) result += `Negative: ${negatives.join(', ')}\n`;
    return result || 'Not assessed\n';
}

// ============================================================================
// HELPER FUNCTIONS FOR TXT GENERATION
// ============================================================================

function getValue(id) {
    return document.getElementById(id)?.value || '';
}

function getRadioValue(name) {
    return document.querySelector(`input[name="${name}"]:checked`)?.value || '';
}

function getCheckedBoxes(label, name) {
    const checked = Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
    if (checked.length === 0) return '';
    return (label ? label + ': ' : '') + checked.join(', ') + '\n';
}

function getTableContent(tableId, headers) {
    const table = document.getElementById(tableId);
    if (!table) return 'N/A\n';

    let content = '';
    table.querySelectorAll('tbody tr').forEach((row, idx) => {
        const inputs = row.querySelectorAll('input, textarea, select');
        const values = Array.from(inputs)
            .slice(0, headers.length)
            .map(i => i.value.trim())
            .filter(v => v);
        if (values.length > 0) content += `  ${idx + 1}. ${values.join(' | ')}\n`;
    });

    return content || '  None recorded\n';
}

function getDifferentials(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return 'N/A\n';

    let content = '';
    container.querySelectorAll('.differential-item').forEach((item, idx) => {
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
    container.querySelectorAll('.progress-note-card').forEach((note, idx) => {
        const datetime = note.querySelector('input[type="datetime-local"]')?.value;
        const textareas = note.querySelectorAll('textarea');

        content += `\nProgress Note #${idx + 1} — ${datetime || 'No date'}\n`;
        const s = textareas[0]?.value;
        const o = textareas[1]?.value;
        const a = textareas[2]?.value;
        const p = textareas[3]?.value;
        if (s) content += `S: ${s}\n`;
        if (o) content += `O: ${o}\n`;
        if (a) content += `A: ${a}\n`;
        if (p) content += `P: ${p}\n`;
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
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${patientName.replace(/\s+/g, '_')}_Backup_${date}.json`;
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

                Object.keys(data).forEach(key => {
                    if (key.startsWith('_')) return;

                    // Handle checkbox arrays
                    if (Array.isArray(data[key])) {
                        data[key].forEach(value => {
                            const cb = document.querySelector(`input[type="checkbox"][name="${key}"][value="${value}"]`);
                            if (cb) cb.checked = true;
                        });
                        return;
                    }

                    const el = document.getElementById(key);
                    if (el) {
                        if (el.type === 'checkbox') el.checked = data[key];
                        else el.value = data[key];
                    } else {
                        const radio = document.querySelector(`input[name="${key}"][value="${data[key]}"]`);
                        if (radio) radio.checked = true;
                    }
                });

                if (data._dynamicTables) restoreDynamicTables(data._dynamicTables);
                if (data._progressNotes) restoreProgressNotes(data._progressNotes);

                localStorage.setItem('clerkshipData', JSON.stringify(data));

                // FIX: Recalculate ALL computed fields after import
                calculateAge();
                calculateGrowth(); // chains into calculateAllZScores
                updateVitalIndicators();
                interpretLabs();
                classifyNewborn();
                calculateAdmissionAge();
                toggleConditionalFields();
                updateProgress();
                updateHistorySummary();

                if (typeof updateDevelopmentalMilestones === 'function') updateDevelopmentalMilestones();

                showToast('Data imported successfully!', 'success');

            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing file — please check the file format.', 'danger');
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
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => toast.classList.remove('show'), 3000);
}

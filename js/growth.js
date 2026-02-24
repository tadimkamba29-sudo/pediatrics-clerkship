/**
 * Growth Standards and Z-Score Calculations
 * Based on WHO Child Growth Standards
 */

// ============================================================================
// WHO LMS PARAMETERS (Simplified lookup tables)
// ============================================================================

// Weight-for-Age (0-60 months) - Boys
const WFA_BOYS = {
    0: { L: 0.3487, M: 3.3464, S: 0.14602 },
    1: { L: 0.2297, M: 4.4709, S: 0.13395 },
    2: { L: 0.197, M: 5.5675, S: 0.12385 },
    3: { L: 0.1738, M: 6.3762, S: 0.11727 },
    6: { L: 0.1395, M: 7.934, S: 0.10995 },
    9: { L: 0.1227, M: 9.0246, S: 0.10654 },
    12: { L: 0.1086, M: 9.6479, S: 0.10469 },
    18: { L: 0.0807, M: 10.9, S: 0.10274 },
    24: { L: 0.0589, M: 12.1515, S: 0.10131 },
    36: { L: 0.0208, M: 14.3441, S: 0.09875 },
    48: { L: -0.0101, M: 16.3489, S: 0.09754 },
    60: { L: -0.0376, M: 18.3515, S: 0.09711 }
};

// Weight-for-Age (0-60 months) - Girls
const WFA_GIRLS = {
    0: { L: 0.3809, M: 3.2322, S: 0.14171 },
    1: { L: 0.2297, M: 4.1873, S: 0.13118 },
    2: { L: 0.197, M: 5.1282, S: 0.12181 },
    3: { L: 0.1738, M: 5.8458, S: 0.11575 },
    6: { L: 0.1395, M: 7.297, S: 0.10864 },
    9: { L: 0.1227, M: 8.2981, S: 0.10523 },
    12: { L: 0.1086, M: 8.9478, S: 0.10337 },
    18: { L: 0.0807, M: 10.2, S: 0.10158 },
    24: { L: 0.0589, M: 11.5017, S: 0.10044 },
    36: { L: 0.0208, M: 13.9244, S: 0.09837 },
    48: { L: -0.0101, M: 16.0649, S: 0.09758 },
    60: { L: -0.0376, M: 18.2, S: 0.09756 }
};

// Height/Length-for-Age (0-60 months) - Boys
const HFA_BOYS = {
    0: { L: 1, M: 49.8842, S: 0.03795 },
    1: { L: 1, M: 54.7244, S: 0.03557 },
    2: { L: 1, M: 58.4249, S: 0.03424 },
    3: { L: 1, M: 61.4292, S: 0.03328 },
    6: { L: 1, M: 67.6236, S: 0.03169 },
    9: { L: 1, M: 72.0888, S: 0.03072 },
    12: { L: 1, M: 75.7488, S: 0.03003 },
    18: { L: 1, M: 82.2991, S: 0.02899 },
    24: { L: 1, M: 87.1161, S: 0.02838 },
    36: { L: 1, M: 96.1034, S: 0.02763 },
    48: { L: 1, M: 103.6966, S: 0.02716 },
    60: { L: 1, M: 110.4143, S: 0.02686 }
};

// Height/Length-for-Age (0-60 months) - Girls
const HFA_GIRLS = {
    0: { L: 1, M: 49.1477, S: 0.0379 },
    1: { L: 1, M: 53.6872, S: 0.0364 },
    2: { L: 1, M: 57.0673, S: 0.03568 },
    3: { L: 1, M: 59.8029, S: 0.0352 },
    6: { L: 1, M: 65.7311, S: 0.03444 },
    9: { L: 1, M: 70.1435, S: 0.03395 },
    12: { L: 1, M: 73.9966, S: 0.03358 },
    18: { L: 1, M: 80.7195, S: 0.03305 },
    24: { L: 1, M: 86.3986, S: 0.0327 },
    36: { L: 1, M: 95.0515, S: 0.0322 },
    48: { L: 1, M: 102.6817, S: 0.03188 },
    60: { L: 1, M: 109.4349, S: 0.03169 }
};

// BMI-for-Age (0-60 months) - Boys
const BMI_BOYS = {
    0: { L: -0.0631, M: 13.4069, S: 0.09295 },
    1: { L: 0.1326, M: 14.9441, S: 0.08808 },
    2: { L: 0.2423, M: 16.3025, S: 0.08436 },
    3: { L: 0.2708, M: 16.8961, S: 0.08241 },
    6: { L: 0.1965, M: 17.3441, S: 0.07964 },
    9: { L: 0.0624, M: 17.3324, S: 0.07822 },
    12: { L: -0.0523, M: 17.0042, S: 0.07751 },
    18: { L: -0.2237, M: 16.2891, S: 0.07732 },
    24: { L: -0.3435, M: 15.8143, S: 0.07778 },
    36: { L: -0.4941, M: 15.3034, S: 0.07953 },
    48: { L: -0.5775, M: 15.1477, S: 0.08174 },
    60: { L: -0.6261, M: 15.1568, S: 0.08407 }
};

// BMI-for-Age (0-60 months) - Girls
const BMI_GIRLS = {
    0: { L: 0.2264, M: 13.3363, S: 0.09274 },
    1: { L: 0.3573, M: 14.5679, S: 0.08863 },
    2: { L: 0.3926, M: 15.7144, S: 0.0853 },
    3: { L: 0.3553, M: 16.3525, S: 0.08323 },
    6: { L: 0.1905, M: 16.8011, S: 0.0801 },
    9: { L: 0.0227, M: 16.8163, S: 0.0784 },
    12: { L: -0.103, M: 16.5321, S: 0.07762 },
    18: { L: -0.2764, M: 15.9161, S: 0.07717 },
    24: { L: -0.3932, M: 15.5058, S: 0.07743 },
    36: { L: -0.5366, M: 15.0686, S: 0.07893 },
    48: { L: -0.6154, M: 14.9451, S: 0.08098 },
    60: { L: -0.6586, M: 14.9949, S: 0.08323 }
};

// Head Circumference-for-Age (0-60 months) - Boys
const HC_BOYS = {
    0: { L: 1, M: 34.4618, S: 0.03686 },
    1: { L: 1, M: 37.2759, S: 0.03133 },
    2: { L: 1, M: 39.1285, S: 0.02997 },
    3: { L: 1, M: 40.5135, S: 0.02918 },
    6: { L: 1, M: 43.3306, S: 0.02789 },
    9: { L: 1, M: 45.1944, S: 0.02713 },
    12: { L: 1, M: 46.4855, S: 0.02661 },
    18: { L: 1, M: 47.9053, S: 0.02593 },
    24: { L: 1, M: 48.9057, S: 0.02545 },
    36: { L: 1, M: 50.2237, S: 0.02483 },
    48: { L: 1, M: 51.0914, S: 0.02443 },
    60: { L: 1, M: 51.6779, S: 0.02413 }
};

// Head Circumference-for-Age (0-60 months) - Girls
const HC_GIRLS = {
    0: { L: 1, M: 33.8787, S: 0.03496 },
    1: { L: 1, M: 36.5463, S: 0.03115 },
    2: { L: 1, M: 38.2521, S: 0.03003 },
    3: { L: 1, M: 39.5328, S: 0.02941 },
    6: { L: 1, M: 42.1819, S: 0.02838 },
    9: { L: 1, M: 43.973, S: 0.02777 },
    12: { L: 1, M: 45.2199, S: 0.02734 },
    18: { L: 1, M: 46.7266, S: 0.02675 },
    24: { L: 1, M: 47.7845, S: 0.02634 },
    36: { L: 1, M: 49.1319, S: 0.02579 },
    48: { L: 1, M: 50.0536, S: 0.02542 },
    60: { L: 1, M: 50.7217, S: 0.02513 }
};

// ============================================================================
// Z-SCORE CALCULATION FUNCTIONS
// ============================================================================

function calculateZScore(value, L, M, S) {
    if (!value || !M || !S) return null;
    
    if (L === 0) {
        return Math.log(value / M) / S;
    } else {
        return (Math.pow(value / M, L) - 1) / (L * S);
    }
}

function getClosestAge(ageMonths, lmsTable) {
    const ages = Object.keys(lmsTable).map(Number).sort((a, b) => a - b);
    let closest = ages[0];
    
    for (const age of ages) {
        if (Math.abs(age - ageMonths) < Math.abs(closest - ageMonths)) {
            closest = age;
        }
    }
    
    return closest;
}

function calculateAllZScores() {
    const dobValue = document.getElementById('dob')?.value;
    const sex = document.getElementById('sex')?.value;
    const weight = parseFloat(document.getElementById('weight')?.value);
    const height = parseFloat(document.getElementById('height')?.value);
    const headCirc = parseFloat(document.getElementById('head_circ')?.value);
    
    if (!dobValue || !sex) return;
    
    // Calculate age in months
    const dob = new Date(dobValue);
    const now = new Date();
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    
    // Only calculate for children under 5 years (60 months)
    if (ageMonths > 60) {
        document.getElementById('waz').value = 'N/A (>5 years)';
        document.getElementById('haz').value = 'N/A (>5 years)';
        document.getElementById('whz').value = 'N/A (>5 years)';
        return;
    }
    
    const isMale = sex === 'Male';
    const closestAge = getClosestAge(ageMonths, isMale ? WFA_BOYS : WFA_GIRLS);
    
    // Weight-for-Age Z-score
    if (weight) {
        const wfaTable = isMale ? WFA_BOYS : WFA_GIRLS;
        const wfaParams = wfaTable[closestAge];
        const waz = calculateZScore(weight, wfaParams.L, wfaParams.M, wfaParams.S);
        document.getElementById('waz').value = waz ? waz.toFixed(2) : '';
        interpretWAZ(waz);
    }
    
    // Height-for-Age Z-score
    if (height) {
        const hfaTable = isMale ? HFA_BOYS : HFA_GIRLS;
        const hfaParams = hfaTable[closestAge];
        const haz = calculateZScore(height, hfaParams.L, hfaParams.M, hfaParams.S);
        document.getElementById('haz').value = haz ? haz.toFixed(2) : '';
        interpretHAZ(haz);
    }
    
    // BMI-for-Age Z-score (WHZ proxy)
    if (weight && height) {
        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        const bmiTable = isMale ? BMI_BOYS : BMI_GIRLS;
        const bmiParams = bmiTable[closestAge];
        const whz = calculateZScore(bmi, bmiParams.L, bmiParams.M, bmiParams.S);
        document.getElementById('whz').value = whz ? whz.toFixed(2) : '';
        interpretWHZ(whz);
    }
    
    // Head Circumference Z-score (if field exists)
    if (headCirc) {
        const hcTable = isMale ? HC_BOYS : HC_GIRLS;
        const hcParams = hcTable[closestAge];
        const hcz = calculateZScore(headCirc, hcParams.L, hcParams.M, hcParams.S);
        const hczField = document.getElementById('hcz');
        if (hczField) {
            hczField.value = hcz ? hcz.toFixed(2) : '';
        }
    }
    
    // Update percentiles
    updatePercentiles();
}

// ============================================================================
// Z-SCORE INTERPRETATION
// ============================================================================

function interpretWAZ(waz) {
    const display = document.getElementById('wazInterpretation');
    if (!display || waz === null) return;
    
    let interpretation = '';
    let className = '';
    
    if (waz < -3) {
        interpretation = 'Severely Underweight';
        className = 'badge-danger';
    } else if (waz < -2) {
        interpretation = 'Underweight';
        className = 'badge-warning';
    } else if (waz <= 2) {
        interpretation = 'Normal Weight';
        className = 'badge-success';
    } else {
        interpretation = 'Overweight';
        className = 'badge-warning';
    }
    
    display.innerHTML = `<span class="badge ${className}">${interpretation}</span>`;
}

function interpretHAZ(haz) {
    const display = document.getElementById('hazInterpretation');
    if (!display || haz === null) return;
    
    let interpretation = '';
    let className = '';
    
    if (haz < -3) {
        interpretation = 'Severely Stunted';
        className = 'badge-danger';
    } else if (haz < -2) {
        interpretation = 'Stunted';
        className = 'badge-warning';
    } else if (haz <= 2) {
        interpretation = 'Normal Height';
        className = 'badge-success';
    } else {
        interpretation = 'Tall';
        className = 'badge-primary';
    }
    
    display.innerHTML = `<span class="badge ${className}">${interpretation}</span>`;
}

function interpretWHZ(whz) {
    const display = document.getElementById('whzInterpretation');
    if (!display || whz === null) return;
    
    let interpretation = '';
    let className = '';
    
    if (whz < -3) {
        interpretation = 'Severe Acute Malnutrition (SAM)';
        className = 'badge-danger';
    } else if (whz < -2) {
        interpretation = 'Moderate Acute Malnutrition (MAM)';
        className = 'badge-warning';
    } else if (whz <= 1) {
        interpretation = 'Normal';
        className = 'badge-success';
    } else if (whz <= 2) {
        interpretation = 'Possible Risk of Overweight';
        className = 'badge-primary';
    } else if (whz <= 3) {
        interpretation = 'Overweight';
        className = 'badge-warning';
    } else {
        interpretation = 'Obese';
        className = 'badge-danger';
    }
    
    display.innerHTML = `<span class="badge ${className}">${interpretation}</span>`;
}

// ============================================================================
// PERCENTILE CALCULATION
// ============================================================================

function zScoreToPercentile(z) {
    // Approximation of the cumulative normal distribution
    if (z === null || isNaN(z)) return null;
    
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = z < 0 ? -1 : 1;
    z = Math.abs(z) / Math.sqrt(2);
    
    const t = 1.0 / (1.0 + p * z);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    
    const percentile = (0.5 * (1.0 + sign * y)) * 100;
    return Math.round(percentile);
}

function updatePercentiles() {
    const waz = parseFloat(document.getElementById('waz')?.value);
    const haz = parseFloat(document.getElementById('haz')?.value);
    const whz = parseFloat(document.getElementById('whz')?.value);
    
    const weightPercentile = document.getElementById('weight_percentile');
    const heightPercentile = document.getElementById('height_percentile');
    
    if (weightPercentile && !isNaN(waz)) {
        weightPercentile.value = zScoreToPercentile(waz) + 'th percentile';
    }
    
    if (heightPercentile && !isNaN(haz)) {
        heightPercentile.value = zScoreToPercentile(haz) + 'th percentile';
    }
}

// ============================================================================
// AGE-ADJUSTED DEVELOPMENTAL MILESTONES
// ============================================================================

function updateDevelopmentalMilestones() {
    const dobValue = document.getElementById('dob')?.value;
    if (!dobValue) return;
    
    const dob = new Date(dobValue);
    const now = new Date();
    const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
    
    const container = document.getElementById('milestonesContainer');
    if (!container) return;
    
    let milestonesHTML = '';
    
    if (ageMonths <= 3) {
        // 0-3 months
        milestonesHTML = `
            <h4>Expected Milestones (0-3 months)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="social_smile"> Social smile (6-8 weeks)</label>
                <label><input type="checkbox" name="milestone" value="head_control_prone"> Head control in prone (4-6 weeks)</label>
                <label><input type="checkbox" name="milestone" value="follows_face"> Follows face (4-6 weeks)</label>
                <label><input type="checkbox" name="milestone" value="coos"> Cooing sounds (6-8 weeks)</label>
                <label><input type="checkbox" name="milestone" value="hands_open"> Hands open most of time (3 months)</label>
            </div>
        `;
    } else if (ageMonths <= 6) {
        // 4-6 months
        milestonesHTML = `
            <h4>Expected Milestones (4-6 months)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="head_control_sitting"> Good head control when sitting</label>
                <label><input type="checkbox" name="milestone" value="reaches_objects"> Reaches for objects</label>
                <label><input type="checkbox" name="milestone" value="rolls_over"> Rolls over (4-5 months)</label>
                <label><input type="checkbox" name="milestone" value="laughs"> Laughs aloud</label>
                <label><input type="checkbox" name="milestone" value="transfers_hand"> Transfers objects hand to hand (5-6 months)</label>
                <label><input type="checkbox" name="milestone" value="babbles"> Babbles (5-6 months)</label>
            </div>
        `;
    } else if (ageMonths <= 9) {
        // 7-9 months
        milestonesHTML = `
            <h4>Expected Milestones (7-9 months)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="sits_unsupported"> Sits without support (6-8 months)</label>
                <label><input type="checkbox" name="milestone" value="crawls"> Crawls (8-9 months)</label>
                <label><input type="checkbox" name="milestone" value="pincer_grasp"> Pincer grasp developing (8-9 months)</label>
                <label><input type="checkbox" name="milestone" value="stranger_anxiety"> Stranger anxiety (7-9 months)</label>
                <label><input type="checkbox" name="milestone" value="says_dada"> Says "mama/dada" non-specifically (8-9 months)</label>
                <label><input type="checkbox" name="milestone" value="waves_bye"> Waves bye-bye (9 months)</label>
            </div>
        `;
    } else if (ageMonths <= 12) {
        // 10-12 months
        milestonesHTML = `
            <h4>Expected Milestones (10-12 months)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="pulls_stand"> Pulls to stand (9-10 months)</label>
                <label><input type="checkbox" name="milestone" value="cruises"> Cruises furniture (10-11 months)</label>
                <label><input type="checkbox" name="milestone" value="stands_alone"> Stands alone briefly (11-12 months)</label>
                <label><input type="checkbox" name="milestone" value="first_words"> First words with meaning (12 months)</label>
                <label><input type="checkbox" name="milestone" value="understands_no"> Understands "no"</label>
                <label><input type="checkbox" name="milestone" value="points"> Points to objects</label>
            </div>
        `;
    } else if (ageMonths <= 18) {
        // 13-18 months
        milestonesHTML = `
            <h4>Expected Milestones (13-18 months)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="walks_alone"> Walks alone (12-15 months)</label>
                <label><input type="checkbox" name="milestone" value="runs_stiffly"> Runs stiffly (15-18 months)</label>
                <label><input type="checkbox" name="milestone" value="builds_tower_2"> Builds tower of 2 cubes (15 months)</label>
                <label><input type="checkbox" name="milestone" value="10_words"> Uses 10+ words (18 months)</label>
                <label><input type="checkbox" name="milestone" value="points_body"> Points to body parts (18 months)</label>
                <label><input type="checkbox" name="milestone" value="feeds_self"> Feeds self with spoon (15-18 months)</label>
            </div>
        `;
    } else if (ageMonths <= 24) {
        // 19-24 months
        milestonesHTML = `
            <h4>Expected Milestones (19-24 months)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="runs_well"> Runs well</label>
                <label><input type="checkbox" name="milestone" value="kicks_ball"> Kicks ball (18-24 months)</label>
                <label><input type="checkbox" name="milestone" value="tower_6"> Builds tower of 6 cubes (24 months)</label>
                <label><input type="checkbox" name="milestone" value="2_word_phrases"> Uses 2-word phrases (24 months)</label>
                <label><input type="checkbox" name="milestone" value="50_words"> 50+ word vocabulary (24 months)</label>
                <label><input type="checkbox" name="milestone" value="parallel_play"> Parallel play</label>
            </div>
        `;
    } else if (ageMonths <= 36) {
        // 25-36 months
        milestonesHTML = `
            <h4>Expected Milestones (2-3 years)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="climbs_stairs_alt"> Climbs stairs alternating feet (3 years)</label>
                <label><input type="checkbox" name="milestone" value="jumps_both_feet"> Jumps with both feet (2-3 years)</label>
                <label><input type="checkbox" name="milestone" value="copies_circle"> Copies circle (3 years)</label>
                <label><input type="checkbox" name="milestone" value="3_word_sentences"> 3-word sentences (2-3 years)</label>
                <label><input type="checkbox" name="milestone" value="knows_name"> Knows full name (3 years)</label>
                <label><input type="checkbox" name="milestone" value="toilet_trained_day"> Toilet trained (day) (2-3 years)</label>
            </div>
        `;
    } else if (ageMonths <= 48) {
        // 37-48 months
        milestonesHTML = `
            <h4>Expected Milestones (3-4 years)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="hops_one_foot"> Hops on one foot (4 years)</label>
                <label><input type="checkbox" name="milestone" value="catches_ball"> Catches ball (4 years)</label>
                <label><input type="checkbox" name="milestone" value="draws_person_3"> Draws person (3 parts)</label>
                <label><input type="checkbox" name="milestone" value="tells_stories"> Tells stories</label>
                <label><input type="checkbox" name="milestone" value="counts_to_10"> Counts to 10</label>
                <label><input type="checkbox" name="milestone" value="dresses_self"> Dresses self (4 years)</label>
            </div>
        `;
    } else if (ageMonths <= 60) {
        // 49-60 months
        milestonesHTML = `
            <h4>Expected Milestones (4-5 years)</h4>
            <div class="milestone-checklist">
                <label><input type="checkbox" name="milestone" value="skips"> Skips (5 years)</label>
                <label><input type="checkbox" name="milestone" value="copies_square"> Copies square (5 years)</label>
                <label><input type="checkbox" name="milestone" value="draws_person_6"> Draws person (6 parts)</label>
                <label><input type="checkbox" name="milestone" value="knows_address"> Knows address</label>
                <label><input type="checkbox" name="milestone" value="understands_rules"> Understands rules of games</label>
                <label><input type="checkbox" name="milestone" value="ties_shoes"> Ties shoelaces (5-6 years)</label>
            </div>
        `;
    } else {
        // Older children
        milestonesHTML = `
            <h4>School-Age Development</h4>
            <div class="form-group">
                <label for="school_grade">Current Grade/Class</label>
                <input type="text" id="school_grade" class="form-control" placeholder="e.g., Grade 3">
            </div>
            <div class="form-group">
                <label for="academic_performance">Academic Performance</label>
                <select id="academic_performance" class="form-control">
                    <option value="">Select...</option>
                    <option value="Above average">Above average</option>
                    <option value="Average">Average</option>
                    <option value="Below average">Below average</option>
                    <option value="Learning difficulties">Learning difficulties</option>
                </select>
            </div>
            <div class="form-group">
                <label for="social_development">Social Development</label>
                <textarea id="social_development" class="form-control" rows="2" placeholder="Friendships, behavior at school..."></textarea>
            </div>
        `;
    }
    
    // Add developmental concerns section
    milestonesHTML += `
        <div class="form-group" style="margin-top: 15px;">
            <label>Developmental Regression?</label>
            <div class="radio-group">
                <label><input type="radio" name="dev_regression" value="No"> No</label>
                <label><input type="radio" name="dev_regression" value="Yes"> Yes</label>
            </div>
        </div>
        <div class="form-group" id="regression_details_group" style="display:none;">
            <label for="regression_details">Details of Regression</label>
            <textarea id="regression_details" class="form-control" rows="2" placeholder="Which skills were lost and when?"></textarea>
        </div>
        <div class="form-group">
            <label for="developmental_concerns">Developmental Concerns</label>
            <textarea id="developmental_concerns" class="form-control" rows="2" placeholder="Any concerns about development?"></textarea>
        </div>
    `;
    
    container.innerHTML = milestonesHTML;
}

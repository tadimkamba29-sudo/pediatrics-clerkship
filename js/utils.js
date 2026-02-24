/**
 * Utility functions for Pediatrics Clerkship Sheet
 * Calculations for Age and Growth Percentiles
 */

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

function calculateGrowth() {
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value) / 100; // cm to m
    const display = document.getElementById('growthDisplay');

    if (weight && height) {
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmiValue').textContent = bmi;
        display.style.display = 'flex';
        
        // Note: In a full version, you would add Z-score lookup logic here
        // For now, we display the calculated BMI
    } else {
        display.style.display = 'none';
    }
}

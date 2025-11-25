document.addEventListener('DOMContentLoaded', () => {
    const distanceRange = document.getElementById('distanceRange');
    const distanceValue = document.getElementById('distanceValue');
    const ageMin = document.getElementById('ageMin');
    const ageMax = document.getElementById('ageMax');
    const ageMinVal = document.getElementById('ageMinVal');
    const ageMaxVal = document.getElementById('ageMaxVal');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- Instellingen laden bij opstarten ---
    function loadSettings() {
        // Afstand
        const savedDistance = localStorage.getItem('setting_distance') || 50;
        distanceRange.value = savedDistance;
        distanceValue.textContent = savedDistance;

        // Leeftijd
        const savedAgeMin = localStorage.getItem('setting_ageMin') || 18;
        const savedAgeMax = localStorage.getItem('setting_ageMax') || 35;
        
        ageMin.value = savedAgeMin;
        ageMax.value = savedAgeMax;
        ageMinVal.textContent = savedAgeMin;
        ageMaxVal.textContent = savedAgeMax;

        // Profiel tonen (Toggle)
        const savedShowMe = localStorage.getItem('setting_showMe') === 'true';
        document.getElementById('showMe').checked = savedShowMe;
    }

    // --- Event Listeners ---

    // 1. Max Afstand Slider
    distanceRange.addEventListener('input', () => {
        distanceValue.textContent = distanceRange.value;
        localStorage.setItem('setting_distance', distanceRange.value);
    });

    // 2. Minimum Leeftijd Slider
    ageMin.addEventListener('input', () => {
        let minVal = parseInt(ageMin.value);
        let maxVal = parseInt(ageMax.value);

        // Zorg ervoor dat min nooit groter is dan max
        if (minVal >= maxVal) {
            minVal = maxVal - 1;
            ageMin.value = minVal;
        }

        ageMinVal.textContent = minVal;
        localStorage.setItem('setting_ageMin', minVal);
    });

    // 3. Maximum Leeftijd Slider
    ageMax.addEventListener('input', () => {
        let minVal = parseInt(ageMin.value);
        let maxVal = parseInt(ageMax.value);

        // Zorg ervoor dat max nooit kleiner is dan min
        if (maxVal <= minVal) {
            maxVal = minVal + 1;
            ageMax.value = maxVal;
        }

        ageMaxVal.textContent = maxVal;
        localStorage.setItem('setting_ageMax', maxVal);
    });

    // 4. Profiel Tonen Toggle
    document.getElementById('showMe').addEventListener('change', (e) => {
        localStorage.setItem('setting_showMe', e.target.checked);
    });

    // 5. Uitloggen Functionaliteit
    logoutBtn.addEventListener('click', () => {
        // Verwijder de inloggegevens uit localStorage
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('rememberMe');
        
        // Navigeer terug naar de loginpagina
        window.location.href = 'login.html';
    });

    // Start de instellingen
    loadSettings();
});
document.addEventListener('DOMContentLoaded', () => {
    // === BESTAANDE ELEMENTEN ===
    const distanceRange = document.getElementById('distanceRange');
    const distanceValue = document.getElementById('distanceValue');
    const ageMin = document.getElementById('ageMin');
    const ageMax = document.getElementById('ageMax');
    const ageMinVal = document.getElementById('ageMinVal');
    const ageMaxVal = document.getElementById('ageMaxVal');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // === NIEUWE DARK MODE ELEMENTEN ===
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const darkModeKey = 'darkModeEnabled'; // Sleutel voor localStorage

    // --- DARK MODE FUNCTIES ---

    /**
     * Past de 'dark-mode' class toe op de <body> en stelt de schakelaar in.
     * @param {boolean} isEnabled - True om dark mode in te schakelen.
     */
    function applyDarkMode(isEnabled) {
        if (isEnabled) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        
        // Update de schakelaar op de settings pagina
        if (darkModeToggle) {
            darkModeToggle.checked = isEnabled;
        }
    }

    /**
     * Laadt de Dark Mode voorkeur uit localStorage en past deze toe.
     * Deze functie is essentieel om de modus op ALLE pagina's te behouden.
     */
    function loadDarkModePreference() {
        const preference = localStorage.getItem(darkModeKey);
        
        // Alleen toepassen als de voorkeur 'true' is
        if (preference === 'true') {
            applyDarkMode(true);
        } else {
            applyDarkMode(false);
        }
    }

    // --- Instellingen laden bij opstarten ---
    function loadSettings() {
        // ... (Bestaande logica) ...

        // Afstand
        const savedDistance = localStorage.getItem('setting_distance') || 50;
        if (distanceRange) { // Voeg een check toe voor het geval elementen niet bestaan
            distanceRange.value = savedDistance;
            distanceValue.textContent = savedDistance;
        }

        // Leeftijd
        const savedAgeMin = localStorage.getItem('setting_ageMin') || 18;
        const savedAgeMax = localStorage.getItem('setting_ageMax') || 35;
        
        if (ageMin && ageMax) {
            ageMin.value = savedAgeMin;
            ageMax.value = savedAgeMax;
            ageMinVal.textContent = savedAgeMin;
            ageMaxVal.textContent = savedAgeMax;
        }

        // Profiel tonen (Toggle)
        const savedShowMe = localStorage.getItem('setting_showMe') === 'true';
        const showMeToggle = document.getElementById('showMe');
        if (showMeToggle) {
            showMeToggle.checked = savedShowMe;
        }
        
        // === LAAD DARK MODE VOORKEUR HIER ===
        loadDarkModePreference();
    }

    // --- Event Listeners ---

    // 0. Dark Mode Schakelaar (NIEUWE LOGICA)
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            const isEnabled = this.checked;
            
            // Modus toepassen op de body
            applyDarkMode(isEnabled);

            // Voorkeur opslaan in localStorage
            localStorage.setItem(darkModeKey, isEnabled.toString());
        });
    }


    // 1. Max Afstand Slider
    if (distanceRange) {
        distanceRange.addEventListener('input', () => {
            distanceValue.textContent = distanceRange.value;
            localStorage.setItem('setting_distance', distanceRange.value);
        });
    }

    // 2. Minimum Leeftijd Slider
    if (ageMin && ageMax) {
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
    }

    // 3. Maximum Leeftijd Slider
    if (ageMin && ageMax) {
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
    }

    // 4. Profiel Tonen Toggle
    const showMeToggle = document.getElementById('showMe');
    if (showMeToggle) {
        showMeToggle.addEventListener('change', (e) => {
            localStorage.setItem('setting_showMe', e.target.checked);
        });
    }

    // 5. Uitloggen Functionaliteit
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Verwijder de inloggegevens uit localStorage
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('rememberMe');
            
            // Navigeer terug naar de loginpagina
            window.location.href = 'login.html';
        });
    }


    // Start de instellingen
    loadSettings();

});

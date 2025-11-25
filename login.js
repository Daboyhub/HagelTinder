document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('user');
    const passwordInput = document.getElementById('pass');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginButton = document.getElementById('loginButton');
    const buttonText = document.getElementById('buttonText');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('togglePassword');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Voorkomt traditionele form submission

        const user = usernameInput.value;
        const pass = passwordInput.value;
        // Wachtwoord wordt opgehaald uit de gebruikersnaam-key in localStorage (simulatie)
        const savedPass = localStorage.getItem(user); 

        // Show loading state
        buttonText.style.display = 'none';
        loader.style.display = 'block';
        loginButton.disabled = true;
        errorMessage.textContent = ''; // Clear previous errors

        // Simuleer netwerkverzoek voor betere UX (1 seconde vertraging)
        setTimeout(() => {
            if (savedPass === null) {
                showError("Gebruiker bestaat niet!");
            } else if (savedPass === pass) {
                // Login succesvol
                localStorage.setItem('loggedInUser', user);
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                window.location.href = "home.html";
            } else {
                showError("Fout wachtwoord!");
            }
            
            // Reset button state
            buttonText.style.display = 'inline';
            loader.style.display = 'none';
            loginButton.disabled = false;
        }, 1000); 
    });

    function showError(message) {
        errorMessage.textContent = message;
    }

    // Pre-fill username if "Remember me" was checked
    const rememberedUser = localStorage.getItem('loggedInUser');
    if (rememberedUser && localStorage.getItem('rememberMe') === 'true') {
        usernameInput.value = rememberedUser;
        rememberMeCheckbox.checked = true;
        passwordInput.focus();
    } else {
        usernameInput.focus();
    }
});
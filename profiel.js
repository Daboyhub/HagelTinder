/**
 * Controleert of de gebruiker ingelogd is op basis van localStorage.
 */
function checkAuthentication() {
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = 'login.html';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Start met de authenticatiecontrole
    checkAuthentication(); 

    // --- DOM Elementen ---
    const editButtons = document.querySelectorAll('.edit-btn');
    const profileImgContainer = document.querySelector('.profile-image-container');
    const profileImg = document.querySelector('.profile-image');

    // --- Core Helper Functions ---

    // Maakt de Save/Cancel knoppen en beheert de cleanup
    function createActionButtons(editButtonToHide) {
        const container = document.createElement('div');
        container.className = 'action-buttons-container';
        container.style.cssText = `
            display: flex;
            gap: 10px;
            margin-top: 15px;
        `;

        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Opslaan';
        saveBtn.style.cssText = `flex: 1; padding: 10px; background: linear-gradient(to right, #fd267a, #ff6036); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;`;

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-btn';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Annuleren';
        cancelBtn.style.cssText = `flex: 1; padding: 10px; background: #999; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s;`;

        container.appendChild(saveBtn);
        container.appendChild(cancelBtn);

        // Voeg toe aan de body (of een vaste positie)
        document.body.appendChild(container); 
        
        editButtonToHide.style.display = 'none';
        
        return { container, saveBtn, cancelBtn };
    }

    // --- Profiel Data Opslag/Laden ---

    function saveProfileData(data) {
        for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
        }
        alert("Profielgegevens opgeslagen!");
        loadProfileData(); // Herlaad om de UI bij te werken
    }
    
    function loadProfileData() {
        // Load Header (Name, Age, Location)
        const savedName = localStorage.getItem('profileName') || 'Uw Naam';
        const savedAge = localStorage.getItem('profileAge') || '??';
        const savedLocation = localStorage.getItem('profileLocation') || 'Onbekende Locatie';
        const savedBio = localStorage.getItem('profileBio') || 'Schrijf hier iets over uzelf...';

        const nameAgeWrapper = document.querySelector('.name-age-wrapper');
        const locationElement = document.querySelector('.profile-location');
        const bioElement = document.querySelector('.bio-text');
        
        if (nameAgeWrapper) {
             nameAgeWrapper.innerHTML = `<span class="profile-name">${savedName}</span>, <span class="profile-age">${savedAge}</span>`;
        }
        if (locationElement) {
             locationElement.textContent = savedLocation;
        }
        if (bioElement) {
             bioElement.textContent = savedBio;
        }
        
        // Laad foto
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage && profileImg) {
            profileImg.src = savedImage;
        }

    }


    // --- Hoofd Edit Functie (Naam, Leeftijd, Locatie) ---

    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const section = e.currentTarget.closest('.profile-section');
            if (!section) return;

            const editableElements = section.querySelectorAll('.profile-name, .profile-age, .profile-location, .bio-text');
            const originalValues = {};
            const keys = {
                'profile-name': 'profileName', 
                'profile-age': 'profileAge', 
                'profile-location': 'profileLocation',
                'bio-text': 'profileBio'
            };

            editableElements.forEach(el => {
                const className = el.className.split(' ')[0]; // Pak de eerste class voor de key
                if (keys[className]) {
                    el.contentEditable = true;
                    el.style.border = '1px solid #fd267a';
                    el.style.padding = '2px';
                    originalValues[keys[className]] = el.textContent.trim();
                }
            });

            // Voeg Opslaan/Annuleren knoppen toe
            const { container, saveBtn, cancelBtn } = createActionButtons(button);

            saveBtn.addEventListener('click', () => {
                const updatedData = {};
                editableElements.forEach(el => {
                    const className = el.className.split(' ')[0];
                    if (keys[className]) {
                        updatedData[keys[className]] = el.textContent.trim();
                        el.contentEditable = false;
                        el.style.border = 'none';
                    }
                });
                container.remove();
                button.style.display = 'block';
                saveProfileData(updatedData);
            });

            cancelBtn.addEventListener('click', () => {
                editableElements.forEach(el => {
                    const className = el.className.split(' ')[0];
                    if (keys[className]) {
                        el.textContent = originalValues[keys[className]];
                        el.contentEditable = false;
                        el.style.border = 'none';
                    }
                });
                container.remove();
                button.style.display = 'block';
            });
        });
    });


    // --- Upload Foto Modaal (Vastgehouden van vorige code) ---

    profileImgContainer.addEventListener('click', showPhotoModal);

    function showPhotoModal() {
        const modalHTML = `
            <div id="photoModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; width: 80%; max-width: 350px;">
                    <h4>Profiel foto bewerken</h4>
                    <button id="uploadPhoto" style="margin: 10px 0; padding: 10px; width: 100%; background: #2dd08a; color: white; border: none; border-radius: 5px; cursor: pointer;">Uploaden</button>
                    <input type="file" id="fileInput" accept="image/*" style="display: none;">
                    <button id="generatePhoto" style="margin: 10px 0; padding: 10px; width: 100%; background: #1e9cee; color: white; border: none; border-radius: 5px; cursor: pointer;">AI Genereren (Simulatie)</button>
                    <button id="closeModal" style="margin: 10px 0; padding: 10px; width: 100%; background: #eee; border: none; border-radius: 5px; cursor: pointer;">Annuleren</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modal = document.getElementById('photoModal');
        
        document.getElementById('uploadPhoto').addEventListener('click', function() {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0]; 
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    profileImg.src = event.target.result;
                    localStorage.setItem('profileImage', event.target.result); // Foto opslaan
                    modal.remove();
                };
                reader.readAsDataURL(file);
            }
        });
        
        document.getElementById('generatePhoto').addEventListener('click', function() {
            const prompt = window.prompt('Beschrijf de foto die je wilt genereren:');
            if (prompt) {
                alert('AI foto generatie functionaliteit vereist een backend service. De prompt is: ' + prompt);
                modal.remove();
            }
        });
        
        document.getElementById('closeModal').addEventListener('click', function() {
            modal.remove();
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // --- Initialisatie ---
    loadProfileData();
});
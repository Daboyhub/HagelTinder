document.addEventListener('DOMContentLoaded', () => {
    const likesGrid = document.getElementById('likes-grid');

    // --- DE PROFIELEN LIJST IS NU LEEG ---
    let likedProfiles = [];

    // --- DE SIMULATIE PROFIELEN ZIJN OOK LEEG ---
    // Deze lijst is nu leeg, en de simulatie-code is verwijderd
    const allPossibleProfiles = [];

    /**
     * Creates the HTML element for a single profile card.
     * @param {object} profile - The profile data.
     * @returns {string} - The HTML string for the card.
     */
    function createProfileCard(profile) {
        return `
            <div class="profile-card" data-profile-id="${profile.id}">
                <img src="${profile.imageUrl}" alt="Foto van ${profile.name}" onerror="this.onerror=null; this.src='https://placehold.co/400x533/ff6036/ffffff?text=Profiel';" />
                <div class="profile-info">
                    <h3>${profile.name}<span class="age">${profile.age}</span></h3>
                    <button class="chat-btn" data-action="match">Chat Nu</button>
                </div>
            </div>
        `;
    }

    /**
     * Renders all liked profiles to the grid.
     */
    function renderLikedProfiles() {
        if (likedProfiles.length === 0) {
            likesGrid.innerHTML = '<p style="text-align: center; color: #999; margin-top: 20px;">Niemand heeft je nog geliket. Swipe verder!</p>';
            return;
        }

        const cardsHtml = likedProfiles.map(createProfileCard).join('');
        likesGrid.innerHTML = cardsHtml;
    }


    // --- HUIDIGE LIKES VANAF NU ALLEEN UIT LOCALSTORAGE HALEN ---
    function initializeLikes() {
        // Op de Likes-pagina moeten we de profielen laten zien die ONS hebben geliket.
        // In deze simulatie gebruiken we een aparte localStorage key voor de likes die WIJ hebben gedaan
        // en laten we de Likes-pagina in eerste instantie leeg, tenzij er een Match ontstaat
        // via de homepagina.

        // Omdat de homepagina profiles opslaat in userLikes, en de likes.js
        // nu geen simulatie meer heeft, zullen we de likedProfiles leeg laten.
        // Echter, als we de chat pagina willen vullen met ECHTE matches, dan
        // moet de 'createMatch' logica in home.js later de 'likedProfiles' in likes.js 
        // gaan vullen (via een gesimuleerde 'Match!').
        
        // Voor nu: De lijst blijft leeg
        likedProfiles = []; 
        renderLikedProfiles();
    }
    
    // Initialisatie
    initializeLikes();


    // Event delegation for creating a match when the CHAT button is clicked
    likesGrid.addEventListener('click', (e) => {
        // Controleer of de klik op de 'Chat Nu' knop was
        const chatButton = e.target.closest('.chat-btn');
        
        if (chatButton) {
            // Vind de dichtstbijzijnde .profile-card ouder
            const card = chatButton.closest('.profile-card'); 
            const profileId = card.dataset.profileId;
            const profile = likedProfiles.find(p => p.id == profileId);
            
            if (profile) {
                createMatch(card, profile);
            }
        }
    });

    /**
     * Handles the logic for creating a match.
     */
    function createMatch(card, profile) {
        console.log(`Creating a match with ${profile.name} (ID: ${profile.id})`);

        // --- Visual Feedback ---
        card.classList.add('matched');
        showMatchMessage(profile.name);
        
        // Voeg het gematchte profiel toe aan 'userLikes' in localStorage
        // Dit zorgt ervoor dat ze zichtbaar worden op de chat.html pagina.
        let userMatches = JSON.parse(localStorage.getItem('userLikes')) || [];
        if (!userMatches.some(p => p.id === profile.id)) {
            userMatches.push(profile);
            localStorage.setItem('userLikes', JSON.stringify(userMatches));
            console.log(`Profiel ${profile.name} toegevoegd aan de lokale Matches/Chat lijst.`);
        }


        setTimeout(() => {
            card.style.transform = 'scale(0.8)';
            card.style.opacity = '0';
            setTimeout(() => {
                // Verwijder het profiel uit de gelikte lijst van de gebruiker
                const index = likedProfiles.findIndex(p => p.id == profile.id);
                if (index > -1) {
                    likedProfiles.splice(index, 1);
                }
                // Update de grid
                renderLikedProfiles();
            }, 300);
        }, 1500);
    }
    
    /**
     * Shows a temporary "It's a Match!" message on the screen.
     */
    function showMatchMessage(name) {
        let matchBox = document.createElement('div');
        matchBox.className = 'match-notification';
        matchBox.innerHTML = `
            <h2>It's a Match!</h2>
            <p>Je en ${name} hebben een match! Begin met chatten!</p>
        `;
        document.body.appendChild(matchBox);

        setTimeout(() => {
            matchBox.style.opacity = '0';
            setTimeout(() => matchBox.remove(), 500);
        }, 2000);
    }
});
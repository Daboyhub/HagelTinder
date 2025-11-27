/**
 * Controleert of de gebruiker ingelogd is op basis van localStorage.
 * Indien niet ingelogd, wordt de gebruiker doorgestuurd naar de loginpagina.
 */
function checkAuthentication() {
    if (!localStorage.getItem('loggedInUser')) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Start met de authenticatiecontrole
    checkAuthentication(); 
    
    const cardStack = document.querySelector('.card-stack');

    // --- GLOBALE SWIPE VARIABELEN ---
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const DRAG_THRESHOLD = 100; // Afstand in pixels om een swipe te registreren
    let currentCard = null;

    // --- DUMMY PROFIEL DATA ---
    let profiles = [
        { id: 101, name: "Emma", age: 50, location: "Amsterdam", distance: 3, bio: "Liefhebber van sterke koffie en lange wandelingen.", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop" },
        { id: 103, name: "Sophie", age: 52, location: "Antwerpen", distance: 5, bio: "Danseres. Houdt van festivals en spontane trips.", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop" },
    ];

    let currentProfileIndex = 0;
    let lastSwipedProfile = null; // 🚨 NIEUW: Voor de Undo functie


    // --- 1. KAART RENDERING FUNCTIES ---
    function createCardHTML(profile) {
        return `
            <div class="card" data-profile-id="${profile.id}">
                <img src="${profile.imageUrl}" alt="Profiel van ${profile.name}">
                <div class="card-info">
                    <div class="card-details">
                        <h2>${profile.name} <span class="age">${profile.age}</span></h2>
                        <p class="bio">${profile.bio}</p>
                        <p><i class="fas fa-home"></i> Woont in ${profile.location}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${profile.distance} kilometer verderop</p>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn undo"><i class="fas fa-undo"></i></button>
                        <button class="action-btn dislike" data-action="dislike"><i class="fas fa-times"></i></button>
                        <button class="action-btn star"><i class="fas fa-star"></i></button>
                        <button class="action-btn like" data-action="like"><i class="fas fa-heart"></i></button>
                        <button class="action-btn boost"><i class="fas fa-bolt"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    function loadNextCard() {
        cardStack.innerHTML = '';
        currentCard = null; // Reset de huidige kaart

        if (currentProfileIndex < profiles.length) {
            const profile = profiles[currentProfileIndex];
            const cardHTML = createCardHTML(profile);
            
            cardStack.innerHTML = cardHTML; 
            currentCard = cardStack.querySelector('.card');
            
            if (currentCard) {
                // Zorg ervoor dat de kaart start met 0 opacity op de labels (via CSS Custom Properties)
                currentCard.style.setProperty('--like-opacity', 0);
                currentCard.style.setProperty('--nope-opacity', 0);
                setupDragListeners(currentCard);
            }
            
        } else {
            cardStack.innerHTML = '<div class="no-more">Geen nieuwe profielen in de buurt. Probeer het later opnieuw!</div>';
        }
    }


    // --- 2. ACTIE FUNCTIE (LIKE/DISLIKE & OPSLAAN) ---
    function handleAction(action, card) {
        // Voer de swipe animatie uit
        card.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
        
        if (action === 'like') {
            card.style.transform = 'translate(400px, -50px) rotate(30deg)';
        } else if (action === 'dislike') {
            card.style.transform = 'translate(-400px, -50px) rotate(-30deg)';
        }
        card.style.opacity = '0';

        const profileId = card.dataset.profileId;
        const swipedProfile = profiles.find(p => p.id == profileId);

        // 🚨 UPDATE: Sla het geswipete profiel op voor de Undo-functie
        lastSwipedProfile = swipedProfile;
        
        if (action === 'like') {
            // --- Logica voor LIKES OPSLAAN ---
            let savedLikes = JSON.parse(localStorage.getItem('userLikes')) || [];
            
            if (swipedProfile && !savedLikes.some(p => p.id === swipedProfile.id)) {
                savedLikes.push(swipedProfile);
            }

            localStorage.setItem('userLikes', JSON.stringify(savedLikes));
            console.log(`LIKE verstuurd voor profiel ID: ${profileId} en opgeslagen.`);
            
            // OPTIONEEL: Match simulatie
            if (Math.random() < 0.2) { 
                 console.log(`🎉 Je hebt een (gesimuleerde) match!`);
            }
        } else {
             console.log(`DISLIKE verstuurd voor profiel ID: ${profileId}`);
        }

        currentProfileIndex++;

        // Verwijder de kaart na de animatie en laad de volgende
        setTimeout(() => {
            card.remove();
            loadNextCard();
        }, 300);
    }


    // --- 3. SWIPE LOGICA FUNCTIES ---

    function getEventX(e) {
        return e.clientX || e.touches[0].clientX;
    }

    function dragStart(e) {
        if (e.target.closest('.action-btn')) return; 

        isDragging = true;
        currentCard = e.currentTarget;
        currentCard.style.transition = 'none'; // Zorgt dat de kaart direct beweegt
        
        startX = getEventX(e);
        currentX = startX;
    }

    function dragMove(e) {
        if (!isDragging || !currentCard) return;

        e.preventDefault(); 

        const moveX = getEventX(e);
        const deltaX = moveX - startX;
        
        const rotation = deltaX / 20; 
        
        currentCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        
        currentX = moveX;
        
        // 🚨 NIEUW: Visual Feedback (LIKE/NOPE labels)
        // Bepaal de dekking (opacity) op basis van de gesleepte afstand (max 100px)
        const opacity = Math.min(Math.abs(deltaX) / DRAG_THRESHOLD, 1); 

        // Pas de CSS Custom Properties aan die in home.css gebruikt worden
        if (deltaX > 0) {
            // Rechts (LIKE)
            currentCard.style.setProperty('--like-opacity', opacity);
            currentCard.style.setProperty('--nope-opacity', 0);
        } else {
            // Links (NOPE)
            currentCard.style.setProperty('--nope-opacity', opacity);
            currentCard.style.setProperty('--like-opacity', 0);
        }
    }

    function dragEnd() {
        if (!isDragging || !currentCard) return;

        isDragging = false;
        const deltaX = currentX - startX;

        // Reset de opacity van de labels onmiddellijk
        currentCard.style.setProperty('--like-opacity', 0);
        currentCard.style.setProperty('--nope-opacity', 0);

        // Bepaal of de kaart voldoende is gesleept
        if (Math.abs(deltaX) > DRAG_THRESHOLD) {
            const action = deltaX > 0 ? 'like' : 'dislike'; 
            handleAction(action, currentCard);
        } else {
            // Spring terug naar het midden
            currentCard.style.transition = 'transform 0.2s ease-in-out';
            currentCard.style.transform = 'translate(0, 0) rotate(0deg)';
        }
    }
    
    function setupDragListeners(card) {
        // Desktop (Muis)
        card.addEventListener('mousedown', dragStart);
        window.addEventListener('mousemove', dragMove);
        window.addEventListener('mouseup', dragEnd);

        // Mobiel (Touch)
        card.addEventListener('touchstart', dragStart);
        window.addEventListener('touchmove', dragMove);
        window.addEventListener('touchend', dragEnd);
    }


    // --- 4. EVENT LISTENER VOOR KNOPPEN (Inclusief Undo) ---
    cardStack.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const action = button.dataset.action;
        const topCard = cardStack.querySelector('.card'); 

        if (action && topCard) {
            // LIKE of DISLIKE actie
            handleAction(action, topCard);
        } 
        // 🚨 NIEUW: Undo Logica
        else if (button.classList.contains('undo') && lastSwipedProfile) {
            // Stap 1: Reset de index
            currentProfileIndex--; 
            const profileToUndo = lastSwipedProfile;
            
            // Stap 2: Maak de stack leeg en render de kaart opnieuw
            cardStack.innerHTML = ''; 
            const cardHTML = createCardHTML(profileToUndo);
            cardStack.innerHTML = cardHTML;
            currentCard = cardStack.querySelector('.card');
            
            // Stap 3: Reset de kaart en herstel de drag listeners
            if (currentCard) {
                currentCard.style.transition = 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out';
                currentCard.style.opacity = '1';
                currentCard.style.transform = 'translate(0, 0) rotate(0deg)';
                setupDragListeners(currentCard); 
            }
            
            // Stap 4: Reset de Undo variabele zodat Undo niet nog een keer kan
            lastSwipedProfile = null; 
            
            console.log(`UNDO: Laatste swipe ongedaan gemaakt. Profiel: ${profileToUndo.name}`);
        }
        
        // Voor de speciale knoppen (Star/Boost) - nog steeds dummy
        else if (button.classList.contains('star') || button.classList.contains('boost')) {
            console.log(`Actie: ${button.className.split(' ')[1]} (Nog te implementeren)`);
        }
    });


    // --- Start de app ---
    loadNextCard();

});

// chat.js
// Importeer de benodigde Firebase modules
// Let op: De Firebase code is hier ingesloten, maar de focus van deze update ligt op de localStorage logica.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, setLogLevel 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, collection, query, where, orderBy, onSnapshot, 
    addDoc, serverTimestamp, doc, setDoc, getDoc 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Zorg ervoor dat de logs aanstaan voor debugging
setLogLevel('Debug');

// Globale variabelen (geleverd door de Canvas omgeving of placeholders)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// Gebruik een placeholder configuratie als de echte niet beschikbaar is
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' && __firebase_config !== '{}' ? __firebase_config : '{"apiKey": "YOUR_API_KEY", "authDomain": "YOUR_AUTH_DOMAIN", "projectId": "YOUR_PROJECT_ID"}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let db;
let auth;
let currentUserId = null;
let currentChatId = null;
let chatsUnsubscribe = null;
let messagesUnsubscribe = null;

// --- DOM ELEMENTEN DEFINIEREN ---
// Deze zijn nodig omdat ze in de event listeners worden gebruikt, maar ontbraken in de snippet
const chatList = document.getElementById('chat-list'); // Container voor de items in de lijstweergave
const chatListView = document.getElementById('chat-list-view');
const activeChatView = document.getElementById('active-chat-view');
const messageList = document.getElementById('message-list');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const backToListBtn = document.getElementById('backToListBtn');
const partnerNameHeader = document.getElementById('partnerName');
const loadingIndicator = document.getElementById('loadingIndicator');

// De chat-input elementen zitten vast aan de onderkant van de active-chat-view
const chatInput = document.querySelector('.chat-input');


// =========================================================================
// 🚨 NIEUWE FUNCTIE: Dynamische Chat Lijst vanuit localStorage (Stap 1)
// =========================================================================
/**
 * Haalt de gelikete profielen (simulatie van matches) op uit localStorage
 * en rendert deze als chat items in de lijstweergave.
 */
function renderChatList() {
    // Haal de 'matches' (gelikete profielen) op uit localStorage
    // Dit is de array die we in home.js opslaan
    const matches = JSON.parse(localStorage.getItem('userLikes')) || [];
    
    // De container voor de chat items is de #chat-list container
    if (!chatList) {
        console.error('Fout: Chat lijst container (#chat-list) niet gevonden.');
        return;
    }
    
    // Maak de lijst leeg
    chatList.innerHTML = '';

    if (matches.length === 0) {
        chatList.innerHTML = '<p style="text-align: center; padding-top: 50px; color: #888;">Nog geen matches om mee te chatten. Begin met swipen!</p>';
        return;
    }

    // Render elk profiel als een chat item
    matches.forEach(profile => {
        // Gebruik de ID van het profiel als een unieke chat ID
        const chatId = `chat_${profile.id}`; 
        
        // Simuleer laatste bericht en tijd
        const lastMessage = `Hallo ${profile.name}, hoe gaat het?`; 
        const lastTime = new Date().toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });

        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chatId; 
        
        // Let op: 'avatar' moet een img tag zijn met de URL
        chatItem.innerHTML = `
            <img src="${profile.imageUrl}" alt="Avatar van ${profile.name}" class="avatar">
            <div class="chat-details">
                <h3>${profile.name}</h3>
                <p>${lastMessage}</p>
            </div>
            <div class="chat-time">${lastTime}</div>
        `;
        
        chatList.appendChild(chatItem);
    });

    console.log(`Chatlijst dynamisch geladen met ${matches.length} matches.`);
}
// =========================================================================
// EINDE NIEUWE FUNCTIE
// =========================================================================


// --- FIREBASE LOGICA FUNCTIES (Onveranderd) ---

/**
 * Functie om de chat te openen en berichten te luisteren
 * @param {string} chatId 
 * @param {string} partnerName 
 */
function startMessagesListener(chatId, partnerName) {
    // Zorg ervoor dat de vorige listener stopt
    if (messagesUnsubscribe) messagesUnsubscribe();

    currentChatId = chatId;
    partnerNameHeader.textContent = partnerName;

    // Toon de chatweergave en verberg de lijst
    chatListView.classList.add('hidden');
    activeChatView.classList.remove('hidden');

    // Simuleer het laden van berichten (in een echte app: Firebase onSnapshot)
    console.log(`Open chat: ${chatId} met ${partnerName}`);
    
    messageList.innerHTML = `
        <div class="message-bubble received">Hoi, ik zag je op HagelTinder!</div>
        <div class="message-bubble sent">Hoi ${partnerName}, leuk dat je me een bericht stuurt!</div>
    `;
    messageList.scrollTop = messageList.scrollHeight;
    
    // Hier zou de Firebase onSnapshot() logica komen
    messagesUnsubscribe = () => console.log('Simulatie: Messages listener gestopt.');
}

/**
 * Functie om een nieuw bericht te verzenden
 */
function sendMessage() {
    if (!currentChatId || !currentUserId) {
        console.error('Kan bericht niet verzenden: Chat of gebruiker niet gedefinieerd.');
        return;
    }

    const messageText = messageInput.value.trim();
    if (messageText === '') return;

    // Toevoegen aan de berichtenlijst (simulatie)
    const newSentBubble = document.createElement('div');
    newSentBubble.className = 'message-bubble sent';
    newSentBubble.textContent = messageText;
    messageList.appendChild(newSentBubble);

    // Scroll naar het nieuwste bericht
    messageList.scrollTop = messageList.scrollHeight;

    // Reset de input
    messageInput.value = '';
    sendButton.disabled = true;

    // Hier zou de Firebase addDoc(collection(db, 'chats', currentChatId, 'messages')) komen
    console.log(`Verzonden in chat ${currentChatId}: ${messageText}`);

    // Optioneel: Simuleer een antwoord na een korte vertraging
    setTimeout(() => {
        const replyText = 'Dat klinkt interessant!';
        const newReceivedBubble = document.createElement('div');
        newReceivedBubble.className = 'message-bubble received';
        newReceivedBubble.textContent = replyText;
        messageList.appendChild(newReceivedBubble);
        messageList.scrollTop = messageList.scrollHeight;
        console.log(`Ontvangen in chat ${currentChatId}: ${replyText}`);
    }, 1500);
}

/**
 * Initialiseert Firebase en authenticatie
 */
async function initializeAppAndAuth() {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);

        // Gebruik de anonieme login als we geen token hebben
        // In een echte app zou de login.js een token opslaan en doorgeven
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
             // We gebruiken localStorage om te simuleren dat de gebruiker ingelogd is
             if (localStorage.getItem('loggedInUser')) {
                 console.log('Gebruiker is lokaal ingelogd, simuleren van anonieme Firebase login...');
                 await signInAnonymously(auth);
             } else {
                console.log('Geen gebruiker gedetecteerd, omleiden naar login.');
                window.location.href = 'login.html';
                return;
             }
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUserId = user.uid;
                console.log(`Firebase User ID: ${currentUserId}`);
                
                // 🚨 OPROEP: Laad de chatlijst nadat de authenticatie is voltooid
                renderChatList();
            
                // Hier zou de onSnapshot() voor de hoofd chatlijst komen
                // simulateChatsListener(); 
                
            } else {
                console.warn("Geen Firebase gebruiker ingelogd.");
            }
        });

    } catch (error) {
        console.error("Firebase Initialisatie Fout:", error);
        if (loadingIndicator) {
             loadingIndicator.textContent = `Fout bij initialisatie: ${error.message}`;
        }
    }
}

// --- EVENT LISTENERS ---

// Zorg ervoor dat de zendknop alleen actief is als er tekst is
if (messageInput && sendButton) {
    messageInput.addEventListener('input', () => {
        sendButton.disabled = messageInput.value.trim() === '';
    });

    sendButton.addEventListener('click', sendMessage);

    // Verzend bericht met ENTER-toets
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !sendButton.disabled) {
            sendMessage();
        }
    });
}

// Event listener voor het klikken op een chat in de lijst
if (chatList) {
    chatList.addEventListener('click', (e) => {
        const chatItem = e.target.closest('.chat-item');
        if (chatItem) {
            const chatId = chatItem.dataset.chatId;
            // Haal de partner naam op uit de h3 in het chat item
            const partnerName = chatItem.querySelector('h3').textContent;
            startMessagesListener(chatId, partnerName);
        }
    });
}


// Event listener om terug te gaan naar de chatlijst
if (backToListBtn && chatListView && activeChatView) {
    backToListBtn.addEventListener('click', () => {
        if (messagesUnsubscribe) messagesUnsubscribe();
        currentChatId = null;
        activeChatView.classList.add('hidden');
        chatListView.classList.remove('hidden'); // Toon de chatlijst container weer
        
        // Optioneel: Render de lijst opnieuw om de nieuwste status te tonen
        // renderChatList(); 
    });
}


// Start de applicatie
initializeAppAndAuth();
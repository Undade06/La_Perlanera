let isTransitioning = false;
let tr
let currentUserId = null; // added for tracking the current user ID

window.onload = function() {
    //console.log("Pagina caricata");
    checkSession()
        .then(userData => {
            //console.log("Sessione verificata con successo:", userData);
        })
        .catch(error => {
            //console.error("Errore durante la verifica della sessione:", error);
        });
}

//Function that show one slide
function toSlide(slideId) {
    // Hide all slides
    document.querySelectorAll('.slide').forEach(slide => {
        slide.classList.add('hidden');
        slide.classList.remove('visible');
        slide.querySelectorAll("*").forEach(function(e1) {
        e1.tabIndex = "-1"; 
        });
    });
    // Show target slide
    const targetSlide = document.getElementById(slideId);
    targetSlide.classList.remove('hidden');
    targetSlide.classList.add('visible');
    targetSlide.style.scrollTop = "0";
    targetSlide.querySelectorAll("*").forEach(function(e2) {
        e2.tabIndex = "0";  
    });
    if(slideId == "admin"){
        loadReservations();
    }
    // Load menu when menu slide is shown
    if (slideId === 'menu') {
        loadMenu();
    }
    //logo things
    if (slideId === 'main') {
        setTimeout(() => {
            document.querySelector('.logo-main').classList.add('visible');
        }, 500);
    } else {
        document.querySelector('.logo-main').classList.remove('visible');
    }
    //clear the Timeout if we are not in the main slide
    if(slideId !== 'main'){
        clearTimeout(tr)
    }
}


//Change the slide after 1s
tr = setTimeout(() => toSlide('main'), 1000); 

//Function that change the logo color
window.addEventListener('scroll', function() {
    const sections = document.querySelector('.sections');
    const logo = document.querySelector('.logo-main img');
    const logoRect = logo.getBoundingClientRect();
    const sectionsTop = sections.getBoundingClientRect().top;
    const logoMiddle = logoRect.top + (logoRect.height / 2);
    let i=""
    if (logoMiddle >= sectionsTop) {
        i = 'img/loghi/logo29517a.png';
    } else {
        i = 'img/loghi/logoLPNazzurrino.png';
    }
    //console.log(logo.src+" "+i)
    if(!logo.src.endsWith(i)) logo.src=i
});

function scrollToMenuSection(sectionId) {
    const section = document.querySelector('#'+sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        // Update active button state
        document.querySelectorAll('.menu-sidebar button').forEach(btn => {
            btn.classList.remove('active');
        });
        // Usa data-section per trovare il pulsante corretto
        const activeButton = document.querySelector('.menu-sidebar button[data-section="'+sectionId+'"]');
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
}

// select all the admin buttons
const adminButtons = document.querySelectorAll('.admin-btn');

// Add an event listener to each admin button
adminButtons.forEach(button => {

    button.addEventListener('click', () => {
        // Remove the 'selected' class from all admin buttons
        adminButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Add the 'selected' class to the clicked button
        button.classList.add('selected');
    });
});


// Function to load and display menu
async function loadMenu() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const menuContainer = document.getElementById('menu-container');
        const sidebar = document.getElementById('menu-sidebar');
        
        // Clean content
        menuContainer.innerHTML = '';
        sidebar.innerHTML = '';
        
        // Group by type
        const menuByType = data.menu.reduce((acc, item) => {
            if (!acc[item.tipologia]) {
                acc[item.tipologia] = [];
            }
            acc[item.tipologia].push(item);
            return acc;
        }, {});

        // Create sidebar buttons
        for (const [tipo, items] of Object.entries(menuByType)) {
            // Create button
            const sectionId = 'menu-section-' + tipo.toLowerCase().replace(/\s+/g, '-');
            const button = document.createElement('button');
            button.textContent = tipo;
            button.setAttribute('data-section', sectionId);
            button.onclick = () => scrollToMenuSection(sectionId);
            sidebar.appendChild(button);
            
            // Create menu section
            const section = document.createElement('div');
            section.className = 'menu-section';
            section.id = sectionId;
            section.innerHTML = '<h2>'+tipo+'</h2>';
            
            // Create menu items
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'menu-items';
            
            items.forEach(item => {
                let allergeniText = '';
                if (item.allergeni.length > 0) {
                    allergeniText = '<p class="allergeni">Allergeni: ' + item.allergeni.join(', ') + '</p>';
                }
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = '<h3>'+item.nome+'</h3>'+
                    '<p class="ingredients">'+item.ingredienti.join(', ')+'</p>'+
                    allergeniText +
                    '<p class="price">€'+item.costo.toFixed(2)+'</p>';
                itemsContainer.appendChild(menuItem);
            });
            
            section.appendChild(itemsContainer);
            menuContainer.appendChild(section);
        }

        // Add beverages
        if (data.bevande) {
            const sectionId = 'menu-section-bevande';
            const button = document.createElement('button');
            button.textContent = 'Bevande';
            button.setAttribute('data-section', sectionId);
            button.onclick = () => scrollToMenuSection(sectionId);
            sidebar.appendChild(button);
            
            const bevandeSection = document.createElement('div');
            bevandeSection.className = 'menu-section';
            bevandeSection.id = sectionId;
            bevandeSection.innerHTML = '<h2>Bevande</h2>';
            
            const bevandeContainer = document.createElement('div');
            bevandeContainer.className = 'menu-items';
            
            data.bevande.forEach(bevanda => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = '<h3>'+bevanda.nome+'</h3>'+
                    '<p class="price">€'+bevanda.costo.toFixed(2)+'</p>';
                bevandeContainer.appendChild(menuItem);
            });
            
            bevandeSection.appendChild(bevandeContainer);
            menuContainer.appendChild(bevandeSection);
        }
        // Activate first button
        const firstButton = sidebar.querySelector('button');
        if (firstButton) {
            firstButton.click();
        }
    } catch (error) {
        console.error('Errore caricamento menu:', error);
    }
}

//old reservation function
/* 
//Class reservation
class Reservation {

    //Constructor for Reservation
    constructor() {
        this.reservations = [];
        this.initializeForm();
    }

    //
    initializeForm() {
        const form = document.getElementById('reservationForm');
        form.addEventListener('submit', (event) => this.handleSubmit(event));
    }

    
    handleSubmit(event) {
        event.preventDefault();
        //Controllo data
        const selectedDate = new Date(document.getElementById('date').value);
        const currentDate = new Date();
        if (selectedDate < currentDate) {
            alert('Non è possibile prenotare per una data passata. Seleziona una data valida.');
            return;
        }
        //Controllo persone
        if (document.getElementById('people').value < 1 || document.getElementById('people').value > 20) {
            alert('Inserisci un numero di persone valido');
            return;
        }

        //Create a new reservation whith all the value
        const newReservation = {
            phone: document.getElementById('phone').value,
            people: parseInt(document.getElementById('people').value),
            date: document.getElementById('date').value,
            allergies: document.getElementById('allergies').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };
        //Send an allert that inform the user 
        this.addReservation(newReservation);
        alert('Prenotazione ricevuta! Ti contatteremo presto.');
        reservation();
        event.target.reset();
    }

    addReservation(reservation) {
        this.reservations.push(reservation);
        console.log('Nuova prenotazione aggiunta:', reservation);
        console.log('Tutte le prenotazioni:', this.reservations);
    }

    getAllReservations() {
        return this.reservations;
    }

    getReservationByEmail(email) {
        return this.reservations.filter(res => res.email === email);
    }

    getReservationsByDate(date) {
        return this.reservations.filter(res => res.date === date);
    }

    printReservations() {
        if (this.reservations.length === 0) {
            console.log('Non ci sono prenotazioni al momento.');
            return;
        }
        console.log('\n=== ELENCO PRENOTAZIONI ===')
        this.reservations.forEach((res, index) => {
            console.log('\nPrenotazione #'+(index + 1))
            console.log('------------------------')
            console.log('Telefono: '+res.phone)
            console.log('Numero persone: '+res.people)
            console.log('Data: '+res.date)
            console.log('Allergie: '+res.allergies || 'Nessuna')
            console.log('Note: '+res.notes || 'Nessuna')
            console.log('Timestamp:'+new Date(res.timestamp).toLocaleString('it-IT'))
            console.log('------------------------')
        })
        console.log('Totale prenotazioni: '+this.reservations.length)
    }
}

// 
const reservationManager = new Reservation();
*/
// Initialize map when about section is shown
function initializeMap() {
    // Convert coordinates from degrees,minutes format to decimal degrees
    const lat = 43 + (43.7/60); // 43°43',7N   Monaco lat
    const lng = 7 + (25.4/60);  // 007°25',4E  Monaco lng
    
    // Create map if it doesn't exist
    if (!window.restaurantMap) {
        window.restaurantMap = L.map('map').setView([lat, lng], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(window.restaurantMap);
        
        // Add marker for restaurant location
        L.marker([lat, lng])
        .addTo(window.restaurantMap)
        .bindPopup('La Perla Nera')
        .openPopup();
    }
}

// Add map initialization to slide transition
const originalToSlide = window.toSlide;
window.toSlide = function(slideId) {
    originalToSlide(slideId);
    if (slideId === 'about') {
        // Small delay to ensure the container is visible
        setTimeout(initializeMap, 100);
    }
};


//Function that shows an error message
function showError(message) {
    errorDiv = document.getElementById("login-error");
    errorDiv.innerText = message;
    errorDiv.classList.add('visible');
}

//Function that hides the error message
function hideError() {
    errorDiv = document.getElementById("login-error");
    errorDiv.classList.remove('visible');
}

function showErrorRegistration(message) {
    errorDiv = document.getElementById("register-error");
    errorDiv.innerText = message;
    errorDiv.classList.add('visible');
}

function hideErrorRegistration() {
    errorDiv = document.getElementById("register-error");
    errorDiv.classList.remove('visible');
}

function showErrorReservation(message) {
    errorDiv = document.getElementById("reservation-error");
    errorDiv.innerText = message;
    errorDiv.classList.add('visible');
}

function hideErrorReservation() {
    errorDiv = document.getElementById("reservation-error");
    errorDiv.classList.remove('visible');
}

function checkSession() {
    return new Promise((resolve, reject) => {
        let x = new XMLHttpRequest();
        x.onload = function() {
            try {
                let j = JSON.parse(x.responseText);
                if (j.error != 0) {
                    //console.error("Errore sessione:", j.message);
                    reject(j.message);
                    return;
                }
               //console.log("Sessione attiva, dati utente:", j);                
                if (j.isAdmin) {
                    //console.log("Accesso amministratore confermato.");
                    toSlide("admin");
                } else {
                    //console.log("Accesso confermato.");
                    toSlide("reservation");
                }
                resolve(j);
            } catch (e) {
                console.error("Errore:", e);
                reject(e);
            }
        };
        x.onerror = function() {
            console.error("Errore di rete");
            reject(new Error("Errore di rete"));
        };
        x.open("GET", "api.php?op=checkSession");
        x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        x.send();
    });
}

//login function 
function login(){
    //console.log("Login...");
    const username = document.getElementById('usernameLog').value;
    const email = document.getElementById('emailLog').value;
    const password = document.getElementById('passwordLog').value;

    hideError();
    if(username == "" || password == "" || email == "") {
        showError("Inserisci username, password e email");
        return;
    }

    let x = new XMLHttpRequest()
    x.onload = function(){
        try{
            let j = JSON.parse(x.responseText)
            if(j.error != 0) throw j.message || "Errore server"
            //console.log("Login effettuato");
            if(j.isAdmin) toSlide("admin");
            else toSlide("reservation");
            document.getElementById("usernameLog").value = "";
            document.getElementById("passwordLog").value = "";
            document.getElementById("emailLog").value = "";
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            //console.log("Campi form:", {nameField, emailField});
            
        }catch(e){
            console.error("Errore:", e);
            showError("Errore: " + e);
        }
    }
    x.onerror = function(){
        console.error("Errore di rete");
        showError("Errore di rete");
    }

    let dati = "usernameLog=" + encodeURIComponent(username) + "&passwordLog=" + encodeURIComponent(password) + "&emailLog=" + encodeURIComponent(email);
    //console.log(dati)
    x.open("POST", "api.php?op=login");
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    x.send(dati);
}

function register(){
    //console.log("Registrazione...");
    let username = document.getElementById("usernameReg").value
    let password = document.getElementById("passwordReg").value
    let email = document.getElementById("emailReg").value
    hideErrorRegistration();
    const usernameRegex = /\d/;
    if (usernameRegex.test(username)) {
        console.error("Errore: Il nome utente non può contenere numeri")
        showErrorRegistration("Errore: Il nome utente non può contenere numeri")
        return
    }
    if(password != document.getElementById("confirmPasswordReg").value){
        console.error("Errore: Le password non coincidono")
        showErrorRegistration("Errore: Le password non coincidono")
        return
    }
    if(username == "" || password == "" || email == "") {
        showErrorRegistration("Inserisci username, password e email")
        return;
    }
    //console.log(username, password, email)
    let x = new XMLHttpRequest()
    x.onload = function(){
        try{
            let j = JSON.parse(x.responseText)
            if(j.error != 0) throw j.message || "Errore server"
            //console.log("Registrazione effettuata");
            document.getElementById("usernameReg").value = ""
            document.getElementById("passwordReg").value = ""
            document.getElementById("emailReg").value = ""
            alert("Registrazione effettuata con successo! \nEsegui il login");
            toSlide("login")
        }catch(e){
            console.error("Errore:", e)
            showErrorRegistration("Errore: " + e)
        }
    }
    x.onerror = function(){
        console.error("Errore di rete")
        showErrorRegistration("Errore di rete")
        //console.error("Errore di rete")
    }
    let dati = "usernameReg=" + encodeURIComponent(username) +
               "&passwordReg=" + encodeURIComponent(password) +
               "&emailReg=" + encodeURIComponent(email)

    x.open("POST", "api.php?op=register")
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    x.send(dati)
}

function logout(){
    let x = new XMLHttpRequest()
    x.onload = function(){
        try{
            let j = JSON.parse(x.responseText)
            if(j.error != 0) throw j.message || "Errore server"
            //console.log("Logout effettuato");
            toSlide("main");
        }catch(e){
            console.error("Errore:", e)
        }
    }
    x.onerror = function(){
        console.error("Errore di rete")
    }
    x.open("GET", "api.php?op=logout")
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    x.send()
}

function reservation(){
        let phone = document.getElementById("phone").value
        let people = document.getElementById("people").value
        let date = document.getElementById("date").value
        let allergies = document.getElementById("allergies").value
        let notes = document.getElementById("notes").value
        hideErrorReservation();

        //all fields are empty
        if(phone == "" && people == "" && date == "") {
            showErrorReservation("Inserisci i dati");
            return;
        }

        // Validate phone number: only numbers, 10 digits
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            showErrorReservation("Il numero di telefono deve contenere esattamente 10 cifre");
            return;
        }

        // Validate date: not empty and valid
        if(date == "") {
            showErrorReservation("Inserisci una data valida");
            return;
        }

        // Validate people: not empty and between 1 and 4
        if(people < 1 || people >= 4) {
            showErrorReservation("Inserisci un numero di persone valido");
            return;
        }

        // Convert date string to Date object for comparison
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for fair comparison
        
        if(selectedDate < today) {
            showErrorReservation("Non è possibile prenotare per una data passata. Seleziona una data valida.");
            return;
        }

        let x = new XMLHttpRequest()
        x.onload = function(){
            try{
                let j = JSON.parse(x.responseText)
                if(j.error != 0) throw j.message || "Errore server"
                //sendReservationEmail(phone, people, date, allergies, notes);
                document.getElementById("phone").value = ""
                document.getElementById("people").value = ""
                document.getElementById("date").value = ""
                document.getElementById("allergies").value = ""
                document.getElementById("notes").value = ""
                alert("Prenotazione effettuata con successo!");
                toSlide("main");
                logout();
            }catch(e){
                console.error("Errore:", e)
                showErrorReservation("Errore: " + e)
            }
        }
        x.onerror = function(){
            console.error("Errore di rete")
            showErrorReservation("Errore di rete")
        }

        let dati = "phone=" + encodeURIComponent(phone) +
                "&people=" + encodeURIComponent(people) +
                "&date=" + encodeURIComponent(date) +
                "&allergies=" + encodeURIComponent(allergies) +
                "&notes=" + encodeURIComponent(notes)

        x.open("POST", "api.php?op=reservation")
        x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        x.send(dati)
}

// Email functions
/*
function sendReservationEmail(phone, people, date, allergies, notes) {
    let x = new XMLHttpRequest();
    x.onload = function () {
        try {
            let j = JSON.parse(x.responseText);
            if (j.error != 0) throw j.message || "Errore nell'invio della mail";
            console.log("Email di conferma inviata con successo!");
        } catch (e) {
            console.error("Errore invio mail:", e);
        }
    };
    x.onerror = function () {
        console.error("Errore di rete nell'invio della mail");
    };

    let dati = "phone=" + encodeURIComponent(phone) +
        "&people=" + encodeURIComponent(people) +
        "&date=" + encodeURIComponent(date) +
        "&allergies=" + encodeURIComponent(allergies) +
        "&notes=" + encodeURIComponent(notes);

    x.open("POST", "api.php?op=send_mail");
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    x.send(dati);
}*/

// Admin Panel Functions
let currentAdminView = ''; // Tracks current view (users/reservations)
let currentAdminData = []; // Stores current data being displayed

function loadUsers() {
    currentAdminView = 'users';
    const x = new XMLHttpRequest();
    x.onload = function() {
        try {
            const response = JSON.parse(this.responseText);
            if (response.error !== 0) {
                console.error("Errore nel caricamento utenti:", response.message);
                return;
            }
            const users = response.users; // Extract the users array
            currentAdminData = users;
            //console.log(currentAdminData);
            //console.log(users);
            displayUsers(users);
        } catch (e) {
            console.error("Errore nel parsing degli utenti:", this.responseText, e);
        }
    };
    x.open("GET", "api.php?op=getUsers");
    x.send();
}

function loadReservations() {
    currentAdminView = 'today';
    const x = new XMLHttpRequest();
    x.onload = function() {
        try {
            const response = JSON.parse(this.responseText);
            if (response.error !== 0) {
                console.error("Errore nel caricamento utenti:", response.message);
                return;
            }
            const reservations = response.reservations;
            currentAdminData = reservations;
            displayReservations(reservations, 'today');
        } catch(e) {
            console.error("Errore nel parsing delle prenotazioni:", e);
        }
    };
    x.open("GET", "api.php?op=getReservations");
    x.send();
}

function search() {
    document.getElementById('adminSearch').addEventListener('input', () => {
        const searchQuery = document.getElementById('adminSearch').value.toLowerCase();
        
        // if the search query is empty, show all data
        if (searchQuery === "") {
            if (currentAdminView === 'users') {
                displayUsers(currentAdminData);  // Show all users
            } else if (currentAdminView === 'today') {
                displayReservations(currentAdminData, 'today');  // Show all reservations
            }
            return;
        }

        // Otherwise, filter the data based on the character entered
        let filteredData = [];
        
        if (currentAdminView === 'users') {
            filteredData = currentAdminData.filter(user => {
                return user.name.toLowerCase().includes(searchQuery) ||  // Search in the user's name
                       user.email.toLowerCase().includes(searchQuery) ||  // Search in the user's email
                       user.id.toString().includes(searchQuery);  // Search in the user's ID
            });
        } else if (currentAdminView === 'today') {
            filteredData = currentAdminData.filter(reservation => {
                return reservation.name.toLowerCase().includes(searchQuery) ||  // Search in the client's name
                       reservation.phone.toLowerCase().includes(searchQuery) ||  // Search in the client's phone
                       reservation.date.toLowerCase().includes(searchQuery);  // Search in the reservation date
            });
        }

        displayAdminData(filteredData);
    });
}

function displayAdminData(filteredData) {
    const container = document.getElementById('adminDataContainer');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    if (!filteredData || filteredData.length === 0) {
        const message = document.createElement('p');
        message.appendChild(document.createTextNode('Nessun risultato trovato'));
        message.style.color = '#fff';
        message.style.textAlign = 'center';
        container.appendChild(message);
        return;
    }

    // Show the filtered data based on the current view
    if (currentAdminView === 'users') {
        displayUsers(filteredData);  // Show the filtered users
    } else if (currentAdminView === 'today') {
        displayReservations(filteredData, 'today');  // Show the filtered reservations
    }
}

function displayUsers(users) {
    const container = document.getElementById('adminDataContainer');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    if (!users || users.length === 0) {
        const message = document.createElement('p');
        message.appendChild(document.createTextNode('Nessun utente trovato'));
        message.style.color = '#fff';
        message.style.textAlign = 'center';
        container.appendChild(message);
        return;
    }

    users.forEach(user => {
        //console.log(user);
        const card = document.createElement('div');
        card.classList.add('data-card');

        const info = document.createElement('div');
        info.classList.add('data-card-info');

        const username = document.createElement('p');
        const usernameLabel = document.createElement('strong');
        usernameLabel.appendChild(document.createTextNode('Cliente: '));
        username.appendChild(usernameLabel);
        username.appendChild(document.createTextNode(user.name));
        info.appendChild(username);

        const email = document.createElement('p');
        const emailLabel = document.createElement('strong');
        emailLabel.appendChild(document.createTextNode('Email: '));
        email.appendChild(emailLabel);
        email.appendChild(document.createTextNode(user.email));
        info.appendChild(email);

        card.appendChild(info);

        if (!user.permissions && user.id !== currentUserId) {
            const deleteButton = document.createElement('button');
            deleteButton.appendChild(document.createTextNode('❌'));
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => deleteUser(user.id);
            card.appendChild(deleteButton);
        } else {
            const noAction = document.createElement('span');
            noAction.appendChild(document.createTextNode('Azione non permessa'));
            noAction.style.color = 'gray';
            card.appendChild(noAction);
        }

        container.appendChild(card);
    });
}

function displayReservations(reservations, type) {
    const container = document.getElementById('adminDataContainer');
    
    // Clear previous content
    container.innerHTML = '';
    
    if (!reservations || reservations.length === 0) {
        const noReservations = document.createElement('p');
        noReservations.textContent = 'Nessuna prenotazione trovata';
        container.appendChild(noReservations);
        return;
    }

    // Create a data card for each reservation
    reservations.forEach(reservation => {
        const card = document.createElement('div');
        card.classList.add('data-card');
        
        const cardInfo = document.createElement('div');
        cardInfo.classList.add('data-card-info');
        
        // Create and append reservation details
        const username = document.createElement('p');
        const usernameStrong = document.createElement('strong');
        usernameStrong.textContent = 'Cliente: ';
        username.appendChild(usernameStrong);
        username.appendChild(document.createTextNode(reservation.name));
        
        const date = document.createElement('p');
        const dateStrong = document.createElement('strong');
        dateStrong.textContent = 'Data: ';
        date.appendChild(dateStrong);
        date.appendChild(document.createTextNode(reservation.date));
        
        const people = document.createElement('p');
        const peopleStrong = document.createElement('strong');
        peopleStrong.textContent = 'Persone: ';
        people.appendChild(peopleStrong);
        people.appendChild(document.createTextNode(reservation.people));
        
        const phone = document.createElement('p');
        const phoneStrong = document.createElement('strong');
        phoneStrong.textContent = 'Telefono: ';
        phone.appendChild(phoneStrong);
        phone.appendChild(document.createTextNode(reservation.phone));
        
        const notes = document.createElement('p');
        const notesStrong = document.createElement('strong');
        notesStrong.textContent = 'Note: ';
        notes.appendChild(notesStrong);
        notes.appendChild(document.createTextNode(reservation.notes || '-'));
        
        // Add allergies if available
        const allergies = document.createElement('p');
        const allergiesStrong = document.createElement('strong');
        allergiesStrong.textContent = 'Allergie: ';
        allergies.appendChild(allergiesStrong);
        allergies.appendChild(document.createTextNode(reservation.allergies || 'Nessuna'));

        // Append info to card
        cardInfo.appendChild(username);
        cardInfo.appendChild(date);
        cardInfo.appendChild(people);
        cardInfo.appendChild(phone);
        cardInfo.appendChild(notes);
        cardInfo.appendChild(allergies); // Add allergies to the card info
        
        // Create delete button
        const actionCell = document.createElement('div');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '❌';
        deleteButton.classList.add('delete-btn');
        deleteButton.onclick = () => deleteReservation(reservation.id);
        actionCell.appendChild(deleteButton);
        
        // Append the card info and action cell to the card
        card.appendChild(cardInfo);
        card.appendChild(actionCell);
        
        // Append the card to the container
        container.appendChild(card);
    });
}

function deleteUser(userId) {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;
    
    let x = new XMLHttpRequest();
    x.onload = function() {
        try {
            let response = JSON.parse(x.responseText);
            if (response.error !== 0) throw response.message || "Errore server";
            loadUsers(); // Reload the users list
            alert('Utente eliminato con successo');
        } catch(e) {
            console.error("Errore:", e);
            showError("Errore nell'eliminazione dell'utente: " + e);
        }
    };
    x.onerror = function() {
        console.error("Errore di rete");
        showError("Errore di rete");
    };

    let dati = "userId=" + encodeURIComponent(userId)

    x.open("POST", "api.php?op=deleteUser");
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    x.send(dati)
}

function deleteReservation(reservationId) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;
    
    let x = new XMLHttpRequest();
    x.onload = function() {
        try {
            let response = JSON.parse(x.responseText);
            if (response.error !== 0) throw response.message || "Errore server";
            // Reload the current view
            loadTodayReservations();
            alert('Prenotazione eliminata con successo');
        } catch(e) {
            console.error("Errore:", e);
            showError("Errore nell'eliminazione della prenotazione: " + e);
        }
    };
    x.onerror = function() {
        console.error("Errore di rete");
        showError("Errore di rete");
    };
    x.open("POST", "api.php?op=deleteReservation");
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    x.send(`reservationId=${reservationId}`);
}
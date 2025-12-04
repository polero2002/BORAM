// Base de datos de psicólogos
const psychologists = [
    {
        id: 1,
        name: "Dra. María Fernández",
        specialty: "Ansiedad y Estrés",
        experience: "10 años",
        rating: 4.9,
        reviews: 127,
        price: 800,
        avatar: "MF",
        bio: "Especialista en terapia cognitivo-conductual con enfoque en ansiedad y trastornos del estrés.",
        tags: ["Ansiedad", "Estrés", "TCC"],
        availability: "inmediata"
    },
    {
        id: 2,
        name: "Dr. Carlos Mendoza",
        specialty: "Terapia de Parejas",
        experience: "15 años",
        rating: 4.8,
        reviews: 98,
        price: 950,
        avatar: "CM",
        bio: "Psicólogo especializado en terapia de parejas y resolución de conflictos familiares.",
        tags: ["Parejas", "Familiar", "Comunicación"],
        availability: "esta-semana"
    },
    {
        id: 3,
        name: "Dra. Ana Rodríguez",
        specialty: "Psicología Infantil",
        experience: "8 años",
        rating: 5.0,
        reviews: 156,
        price: 750,
        avatar: "AR",
        bio: "Experta en desarrollo infantil y adolescente. Utiliza técnicas de juego terapéutico.",
        tags: ["Infantil", "Adolescentes", "Desarrollo"],
        availability: "inmediata"
    },
    {
        id: 4,
        name: "Dr. Roberto García",
        specialty: "Depresión y Duelo",
        experience: "12 años",
        rating: 4.7,
        reviews: 89,
        price: 850,
        avatar: "RG",
        bio: "Especialista en manejo de depresión, duelo y procesos de pérdida emocional.",
        tags: ["Depresión", "Duelo", "Emocional"],
        availability: "esta-semana"
    },
    {
        id: 5,
        name: "Dra. Laura Sánchez",
        specialty: "Terapia Familiar",
        experience: "9 años",
        rating: 4.9,
        reviews: 112,
        price: 900,
        avatar: "LS",
        bio: "Terapeuta familiar sistémica. Ayuda a familias a mejorar su comunicación y vínculos.",
        tags: ["Familiar", "Sistémica", "Comunicación"],
        availability: "inmediata"
    },
    {
        id: 6,
        name: "Dr. José Martínez",
        specialty: "Adicciones",
        experience: "11 años",
        rating: 4.6,
        reviews: 73,
        price: 920,
        avatar: "JM",
        bio: "Especialista en tratamiento de adicciones y comportamientos compulsivos.",
        tags: ["Adicciones", "Rehabilitación", "Apoyo"],
        availability: "esta-semana"
    }
];

// Estado de la aplicación
let currentUser = null;
let isLoggedIn = false;
let selectedPsychologist = null;
let filteredPsychologists = [...psychologists];
let userAppointments = [];
let currentAppointment = null;
let sessionTimer = null;
let sessionStartTime = null;
let micEnabled = true;
let videoEnabled = true;
let chatVisible = false;

// Referencias DOM
const loginModal = document.getElementById('loginModal');
const profileModal = document.getElementById('profileModal');
const appointmentModal = document.getElementById('appointmentModal');
const notificationModal = document.getElementById('notificationModal');
const cancelModal = document.getElementById('cancelModal');
const loginBtn = document.getElementById('loginBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const myAppointmentsBtn = document.getElementById('myAppointmentsBtn');
const psychologistsGrid = document.getElementById('psychologistsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const specialtyFilter = document.getElementById('specialtyFilter');
const availabilityFilter = document.getElementById('availabilityFilter');

// Vistas
const mainView = document.querySelector('body');
const appointmentsView = document.getElementById('appointmentsView');
const videoCallView = document.getElementById('videoCallView');

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    renderPsychologists();
    setupEventListeners();
    checkLoginStatus();
});

// Configurar event listeners
function setupEventListeners() {
    // Modales
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Botones de navegación
    loginBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            logout();
        } else {
            openModal(loginModal);
        }
    });

    profileBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            openModal(profileModal);
        } else {
            showNotification('⚠️', 'warning', 'Acceso restringido', 'Por favor, inicia sesión primero para acceder a tu perfil.');
            setTimeout(() => {
                closeAllModals();
                openModal(loginModal);
            }, 2000);
        }
    });

    myAppointmentsBtn.addEventListener('click', () => {
        if (isLoggedIn) {
            showAppointmentsView();
        } else {
            showNotification('⚠️', 'warning', 'Acceso restringido', 'Por favor, inicia sesión primero para ver tus citas.');
            setTimeout(() => {
                closeAllModals();
                openModal(loginModal);
            }, 2000);
        }
    });

    // Formularios
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('appointmentForm').addEventListener('submit', handleAppointment);
    
    logoutBtn.addEventListener('click', logout);

    // Notificaciones
    document.getElementById('notificationBtn').addEventListener('click', () => {
        closeAllModals();
    });

    // Modal de cancelación
    document.getElementById('cancelNoBtn').addEventListener('click', () => {
        closeModal(cancelModal);
    });

    document.getElementById('cancelYesBtn').addEventListener('click', confirmCancelAppointment);

    // Navegación entre vistas
    document.getElementById('newAppointmentBtn').addEventListener('click', showMainView);
    document.getElementById('profileBtnAlt').addEventListener('click', () => openModal(profileModal));
    document.getElementById('logoutBtnAlt').addEventListener('click', logout);

    // Videollamada
    document.getElementById('endCallBtn').addEventListener('click', endVideoCall);
    document.getElementById('toggleMicBtn').addEventListener('click', toggleMicrophone);
    document.getElementById('toggleVideoBtn').addEventListener('click', toggleVideo);
    document.getElementById('toggleChatBtn').addEventListener('click', toggleChat);
    document.getElementById('closeChatBtn').addEventListener('click', toggleChat);
    document.getElementById('shareScreenBtn').addEventListener('click', shareScreen);
    document.getElementById('sendMessageBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Búsqueda y filtros
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    specialtyFilter.addEventListener('change', applyFilters);
    availabilityFilter.addEventListener('change', applyFilters);

    // Botón de términos y condiciones en el footer
    const termsBtn = document.getElementById('termsBtn');
    if (termsBtn) {
        termsBtn.addEventListener('click', showTermsView);
    }
}

// Renderizar catálogo de psicólogos
function renderPsychologists() {
    psychologistsGrid.innerHTML = '';
    
    if (filteredPsychologists.length === 0) {
        psychologistsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); font-size: 1.2rem;">No se encontraron psicólogos con esos criterios.</p>';
        return;
    }

    filteredPsychologists.forEach(psychologist => {
        const card = createPsychologistCard(psychologist);
        psychologistsGrid.appendChild(card);
    });
}

// Crear tarjeta de psicólogo
function createPsychologistCard(psychologist) {
    const card = document.createElement('div');
    card.className = 'psychologist-card';
    
    const stars = '★'.repeat(Math.floor(psychologist.rating)) + 
                  (psychologist.rating % 1 >= 0.5 ? '½' : '') + 
                  '☆'.repeat(5 - Math.ceil(psychologist.rating));
    
    card.innerHTML = `
        <div class="psychologist-header">
            <div class="psychologist-avatar">${psychologist.avatar}</div>
            <div class="psychologist-name">
                <h3>${psychologist.name}</h3>
                <div class="psychologist-specialty">${psychologist.specialty}</div>
            </div>
        </div>
        
        <div class="psychologist-details">
            <div class="detail-item">
                <span>📚</span>
                <span>${psychologist.experience} de experiencia</span>
            </div>
            <div class="detail-item">
                <span>🎓</span>
                <span>Cédula profesional verificada</span>
            </div>
        </div>
        
        <p class="psychologist-bio">${psychologist.bio}</p>
        
        <div class="psychologist-tags">
            ${psychologist.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        
        <div class="psychologist-footer">
            <div>
                <div class="price">$${psychologist.price}</div>
                <div class="price-label">por sesión</div>
            </div>
            <div class="rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${psychologist.reviews})</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openAppointmentModal(psychologist));
    
    return card;
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const specialty = specialtyFilter.value;
    const availability = availabilityFilter.value;
    
    filteredPsychologists = psychologists.filter(psy => {
        const matchesSearch = psy.name.toLowerCase().includes(searchTerm) ||
                            psy.specialty.toLowerCase().includes(searchTerm) ||
                            psy.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesSpecialty = !specialty || psy.tags.some(tag => tag.includes(specialty));
        const matchesAvailability = !availability || psy.availability === availability;
        
        return matchesSearch && matchesSpecialty && matchesAvailability;
    });
    
    renderPsychologists();
}

// Manejo de login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simulación de login (en producción conectaría con un backend)
    if (email && password) {
        currentUser = {
            name: 'Usuario Demo',
            email: email,
            phone: '+52 555 123 4567',
            regDate: '25/11/2025'
        };
        
        isLoggedIn = true;
        updateUIForLogin();
        closeAllModals();
        
        // Mostrar mensaje de éxito
        showNotification('✓', 'success', '¡Bienvenido!', `Has iniciado sesión correctamente.\n\n¡Ahora puedes agendar citas con nuestros profesionales!`);
    }
}

// Actualizar UI después del login
function updateUIForLogin() {
    loginBtn.textContent = 'Cerrar Sesión';
    loginBtn.classList.remove('btn-primary');
    loginBtn.classList.add('btn-danger');
    
    // Actualizar información del perfil
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userPhone').textContent = currentUser.phone;
    document.getElementById('userRegDate').textContent = currentUser.regDate;
    document.getElementById('userInitials').textContent = currentUser.name.charAt(0);
}

// Cerrar sesión
function logout() {
    isLoggedIn = false;
    currentUser = null;
    
    loginBtn.textContent = 'Iniciar Sesión';
    loginBtn.classList.remove('btn-danger');
    loginBtn.classList.add('btn-primary');
    
    closeAllModals();
    showNotification('✓', 'info', 'Sesión cerrada', 'Has cerrado sesión correctamente.\n\n¡Esperamos verte pronto!');
}

// Verificar estado de login
function checkLoginStatus() {
    // Aquí podrías verificar si hay un token guardado en localStorage
    // Por ahora, siempre empieza sin login
    isLoggedIn = false;
}

// Abrir modal de cita
function openAppointmentModal(psychologist) {
    if (!isLoggedIn) {
        showNotification('⚠️', 'warning', 'Inicio de sesión requerido', 'Por favor, inicia sesión para agendar una cita con nuestros profesionales.');
        setTimeout(() => {
            closeAllModals();
            openModal(loginModal);
        }, 2500);
        return;
    }
    
    selectedPsychologist = psychologist;
    
    // Actualizar información del psicólogo en el modal
    const psychologistInfo = document.getElementById('psychologistInfo');
    psychologistInfo.innerHTML = `
        <h3>${psychologist.name}</h3>
        <p>${psychologist.specialty}</p>
        <p style="font-weight: bold; color: var(--success-color); font-size: 1.3rem;">$${psychologist.price} / sesión</p>
    `;
    
    // Establecer fecha mínima (hoy)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
    
    openModal(appointmentModal);
}

// Manejar agendamiento de cita
function handleAppointment(e) {
    e.preventDefault();
    
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const notes = document.getElementById('appointmentNotes').value;
    
    // Formatear fecha
    const dateObj = new Date(date + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Simulación de guardado (en producción se enviaría al backend)
    const appointment = {
        psychologist: selectedPsychologist,
        date: formattedDate,
        time: time,
        notes: notes,
        user: currentUser
    };
    
    console.log('Cita agendada:', appointment);
    
    // Guardar la cita
    userAppointments.push(appointment);
    
    closeAllModals();
    
    // Mostrar confirmación
    showNotification(
        '✓', 
        'success', 
        '¡Cita agendada con éxito!', 
        `Psicólogo: ${selectedPsychologist.name}\nFecha: ${formattedDate}\nHora: ${time}\n\nRecibirás un correo de confirmación en breve.`
    );
    
    // Limpiar formulario
    document.getElementById('appointmentForm').reset();
}

// Funciones auxiliares para modales
function openModal(modal) {
    closeAllModals();
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Mostrar notificación personalizada
function showNotification(icon, type, title, message) {
    const notificationIcon = document.getElementById('notificationIcon');
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    
    // Limpiar clases previas
    notificationIcon.className = 'notification-icon';
    
    // Configurar el contenido
    notificationIcon.textContent = icon;
    notificationIcon.classList.add(type);
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    // Mostrar el modal
    openModal(notificationModal);
}

// Mostrar vista de citas
function showAppointmentsView() {
    // Ocultar elementos de la vista principal
    const mainNav = document.querySelector('body > nav');
    const hero = document.querySelector('.hero');
    const filters = document.querySelector('.filters');
    const main = document.querySelector('main');
    const footer = document.querySelector('.footer');
    
    if (mainNav) mainNav.style.display = 'none';
    if (hero) hero.style.display = 'none';
    if (filters) filters.style.display = 'none';
    if (main) main.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    appointmentsView.classList.add('active');
    renderAppointments();
}

// Mostrar vista principal
function showMainView() {
    appointmentsView.classList.remove('active');
    videoCallView.classList.remove('active');
    
    // Ocultar vista del test psicológico
    const psychTestView = document.getElementById('psychTestView');
    if (psychTestView) psychTestView.classList.remove('active');
    
    // Ocultar vista de términos y condiciones
    const termsView = document.getElementById('termsView');
    if (termsView) termsView.classList.remove('active');
    
    const mainNav = document.querySelector('body > nav');
    const hero = document.querySelector('.hero');
    const filters = document.querySelector('.filters');
    const main = document.querySelector('main');
    const footer = document.querySelector('.footer');
    
    if (mainNav) mainNav.style.display = 'block';
    if (hero) hero.style.display = 'block';
    if (filters) filters.style.display = 'block';
    if (main) main.style.display = 'block';
    if (footer) footer.style.display = 'block';
}

// Renderizar lista de citas
function renderAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    
    // Actualizar estadísticas
    const totalAppointments = document.getElementById('totalAppointments');
    const upcomingAppointments = document.getElementById('upcomingAppointments');
    
    if (totalAppointments) {
        totalAppointments.textContent = userAppointments.length;
    }
    
    if (upcomingAppointments) {
        const today = new Date();
        const upcomingCount = userAppointments.filter(apt => {
            // Contar citas futuras (simplificado para demo)
            return true;
        }).length;
        upcomingAppointments.textContent = upcomingCount;
    }
    
    if (userAppointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="empty-appointments">
                <div class="empty-icon">📅</div>
                <h3>No tienes citas agendadas</h3>
                <p>Usa el botón "Agendar Nueva Cita" para programar tu primera sesión.</p>
            </div>
        `;
        return;
    }
    
    appointmentsList.innerHTML = '';
    
    userAppointments.forEach((appointment, index) => {
        const card = document.createElement('div');
        card.className = 'appointment-card';
        
        const isToday = appointment.date.includes(new Date().toLocaleDateString('es-ES', { day: 'numeric' }));
        const statusClass = isToday ? 'status-today' : 'status-upcoming';
        const statusText = isToday ? '⚡ Hoy' : '📅 Próximamente';
        
        card.innerHTML = `
            <div class="appointment-header">
                <div class="appointment-avatar">${appointment.psychologist.avatar}</div>
                <div class="appointment-info">
                    <h3>${appointment.psychologist.name}</h3>
                    <div class="appointment-specialty">${appointment.psychologist.specialty}</div>
                </div>
            </div>
            
            <span class="appointment-status ${statusClass}">${statusText}</span>
            
            <div class="appointment-details">
                <div class="appointment-detail-item">
                    <span>📅</span>
                    <span><strong>Fecha:</strong> ${appointment.date}</span>
                </div>
                <div class="appointment-detail-item">
                    <span>🕐</span>
                    <span><strong>Hora:</strong> ${appointment.time}</span>
                </div>
                <div class="appointment-detail-item">
                    <span>💰</span>
                    <span><strong>Costo:</strong> $${appointment.psychologist.price} MXN</span>
                </div>
                <div class="appointment-detail-item">
                    <span>⏱️</span>
                    <span><strong>Duración:</strong> 50 minutos</span>
                </div>
                ${appointment.notes ? `
                    <div class="appointment-notes">
                        <strong>📝 Motivo de consulta:</strong><br>
                        ${appointment.notes}
                    </div>
                ` : ''}
            </div>
            
            <div class="appointment-actions">
                <button class="btn-join" onclick="joinVideoCall(${index})">
                    🎥 Unirse a la sesión
                </button>
                <button class="btn-cancel" onclick="cancelAppointment(${index})" title="Cancelar cita">
                    ❌
                </button>
            </div>
        `;
        
        appointmentsList.appendChild(card);
    });
}

// Unirse a videollamada
function joinVideoCall(appointmentIndex) {
    currentAppointment = userAppointments[appointmentIndex];
    
    appointmentsView.classList.remove('active');
    videoCallView.classList.add('active');
    
    // Configurar información de la sesión
    document.getElementById('sessionPsychologist').textContent = 
        `Sesión con ${currentAppointment.psychologist.name}`;
    document.getElementById('psychologistName').textContent = 
        currentAppointment.psychologist.name;
    document.getElementById('psychologistAvatar').textContent = 
        currentAppointment.psychologist.avatar;
    document.getElementById('userAvatar').textContent = 
        currentUser.name.charAt(0);
    
    // Iniciar temporizador
    startSessionTimer();
    
    // Simular conexión de video
    setTimeout(() => {
        initializeVideoCall();
    }, 2000);
    
    // Mensaje de bienvenida en el chat
    addChatMessage('Sistema', `Bienvenido a tu sesión con ${currentAppointment.psychologist.name}`, false, true);
}

// Inicializar videollamada
async function initializeVideoCall() {
    try {
        // Hacer la cámara flotante y arrastrable
        makeSelfVideoFloating();
        
        // Solicitar acceso a cámara y micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        const userVideo = document.getElementById('userVideo');
        userVideo.srcObject = stream;
        
        // Ocultar placeholder del usuario
        const userPlaceholder = document.querySelector('.self-video .video-placeholder');
        if (userPlaceholder) userPlaceholder.style.display = 'none';
        
        // Simular video del psicólogo (en producción sería WebRTC real)
        setTimeout(() => {
            const psychPlaceholder = document.querySelector('.main-video .video-placeholder');
            if (psychPlaceholder) {
                psychPlaceholder.innerHTML = `
                    <div class="placeholder-avatar">${currentAppointment.psychologist.avatar}</div>
                    <p>${currentAppointment.psychologist.name} está en la sesión</p>
                `;
            }
            
            addChatMessage(
                currentAppointment.psychologist.name, 
                '¡Hola! Bienvenido a la sesión. ¿Cómo te encuentras hoy?', 
                false
            );
        }, 3000);
        
    } catch (error) {
        console.error('Error al acceder a medios:', error);
        addChatMessage('Sistema', 'No se pudo acceder a la cámara/micrófono. Verifica los permisos.', false, true);
    }
}

// Temporizador de sesión
function startSessionTimer() {
    sessionStartTime = Date.now();
    sessionTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('sessionTimer').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Finalizar videollamada
function endVideoCall() {
    if (confirm('¿Estás seguro de que deseas finalizar la sesión?')) {
        // Detener temporizador
        if (sessionTimer) {
            clearInterval(sessionTimer);
            sessionTimer = null;
        }
        
        // Detener streams de video
        const userVideo = document.getElementById('userVideo');
        if (userVideo.srcObject) {
            userVideo.srcObject.getTracks().forEach(track => track.stop());
            userVideo.srcObject = null;
        }
        
        // Volver a la vista de citas
        videoCallView.classList.remove('active');
        showAppointmentsView();
        
        showNotification('✓', 'success', 'Sesión finalizada', 'La sesión ha terminado correctamente.\n\n¡Esperamos que haya sido de ayuda!');
    }
}

// Controles de videollamada
function toggleMicrophone() {
    micEnabled = !micEnabled;
    const btn = document.getElementById('toggleMicBtn');
    
    const userVideo = document.getElementById('userVideo');
    if (userVideo.srcObject) {
        userVideo.srcObject.getAudioTracks().forEach(track => {
            track.enabled = micEnabled;
        });
    }
    
    btn.classList.toggle('disabled', !micEnabled);
    btn.querySelector('.control-icon').textContent = micEnabled ? '🎤' : '🎤';
    btn.style.opacity = micEnabled ? '1' : '0.5';
    
    addChatMessage('Sistema', `Micrófono ${micEnabled ? 'activado' : 'desactivado'}`, false, true);
}

function toggleVideo() {
    videoEnabled = !videoEnabled;
    const btn = document.getElementById('toggleVideoBtn');
    
    const userVideo = document.getElementById('userVideo');
    if (userVideo.srcObject) {
        userVideo.srcObject.getVideoTracks().forEach(track => {
            track.enabled = videoEnabled;
        });
    }
    
    btn.classList.toggle('disabled', !videoEnabled);
    btn.querySelector('.control-icon').textContent = videoEnabled ? '📹' : '📹';
    btn.style.opacity = videoEnabled ? '1' : '0.5';
    
    addChatMessage('Sistema', `Cámara ${videoEnabled ? 'activada' : 'desactivada'}`, false, true);
}

function toggleChat() {
    chatVisible = !chatVisible;
    const chatSection = document.getElementById('chatSection');
    const btn = document.getElementById('toggleChatBtn');
    
    chatSection.classList.toggle('visible', chatVisible);
    btn.classList.toggle('active', chatVisible);
    
    // Inicializar drag cuando se abre el chat por primera vez
    if (chatVisible && !chatSection.dataset.dragInitialized) {
        initChatDrag();
        initChatSwipe();
        chatSection.dataset.dragInitialized = 'true';
    }
}

// Hacer el chat arrastrable (solo desktop)
function initChatDrag() {
    const chatSection = document.getElementById('chatSection');
    const chatHeader = chatSection.querySelector('.chat-header');
    
    // Solo en desktop
    if (window.innerWidth <= 768) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    chatHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === chatHeader || chatHeader.contains(e.target)) {
            if (e.target.tagName !== 'BUTTON') {
                isDragging = true;
            }
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, chatSection);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

// Cerrar chat deslizando hacia abajo (solo móvil)
function initChatSwipe() {
    const chatSection = document.getElementById('chatSection');
    const chatHeader = chatSection.querySelector('.chat-header');
    
    // Solo en móvil
    if (window.innerWidth > 768) return;
    
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isDragging = false;

    chatHeader.addEventListener('touchstart', handleTouchStart, { passive: true });
    chatHeader.addEventListener('touchmove', handleTouchMove, { passive: false });
    chatHeader.addEventListener('touchend', handleTouchEnd);

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
        isDragging = true;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        
        touchCurrentY = e.touches[0].clientY;
        const deltaY = touchCurrentY - touchStartY;
        
        // Solo permitir deslizar hacia abajo
        if (deltaY > 0) {
            e.preventDefault();
            chatSection.style.transform = `translateY(${deltaY}px)`;
        }
    }

    function handleTouchEnd(e) {
        if (!isDragging) return;
        
        const deltaY = touchCurrentY - touchStartY;
        
        // Si deslizó más de 100px hacia abajo, cerrar el chat
        if (deltaY > 100) {
            toggleChat();
        }
        
        // Resetear la posición
        chatSection.style.transform = '';
        isDragging = false;
        touchStartY = 0;
        touchCurrentY = 0;
    }
}

function shareScreen() {
    addChatMessage('Sistema', 'Función de compartir pantalla en desarrollo', false, true);
}

// Chat
function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(currentUser.name, message, true);
        input.value = '';
        
        // Simular respuesta del psicólogo
        setTimeout(() => {
            const responses = [
                'Entiendo, cuéntame más sobre eso.',
                'Eso es muy interesante. ¿Cómo te hace sentir?',
                'Gracias por compartir. ¿Desde cuándo experimentas esto?',
                'Es completamente normal sentirse así. Trabajaremos juntos en esto.',
                'Me parece que estás progresando muy bien.'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage(currentAppointment.psychologist.name, randomResponse, false);
        }, 2000 + Math.random() * 2000);
    }
}

function addChatMessage(sender, message, isSelf, isSystem = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSelf ? 'self' : ''}`;
    
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-sender">${isSystem ? '⚙️ ' : ''}${sender}</div>
        <div class="message-content">${message}</div>
        <div class="message-time">${time}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Cancelar cita
let appointmentToCancel = null;

function cancelAppointment(index) {
    appointmentToCancel = index;
    const appointment = userAppointments[index];
    document.getElementById('cancelMessage').textContent = 
        `¿Estás seguro que deseas cancelar tu cita con ${appointment.psychologist.name} programada para el ${appointment.date} a las ${appointment.time}?`;
    openModal(cancelModal);
}

function confirmCancelAppointment() {
    if (appointmentToCancel !== null) {
        const appointment = userAppointments[appointmentToCancel];
        userAppointments.splice(appointmentToCancel, 1);
        appointmentToCancel = null;
        closeModal(cancelModal);
        renderAppointments();
        
        showNotification('✓', 'success', 'Cita cancelada', `Tu cita con ${appointment.psychologist.name} ha sido cancelada exitosamente.`);
    }
}

// Ir a la página principal
function goToHome() {
    showMainView();
}

// Mostrar vista de términos y condiciones
function showTermsView() {
    // Ocultar otras vistas
    appointmentsView.classList.remove('active');
    videoCallView.classList.remove('active');
    
    const psychTestView = document.getElementById('psychTestView');
    if (psychTestView) psychTestView.classList.remove('active');
    
    // Ocultar elementos principales
    const mainNav = document.querySelector('body > nav');
    const hero = document.querySelector('.hero');
    const filters = document.querySelector('.filters');
    const main = document.querySelector('main');
    const footer = document.querySelector('.footer');
    
    if (mainNav) mainNav.style.display = 'none';
    if (hero) hero.style.display = 'none';
    if (filters) filters.style.display = 'none';
    if (main) main.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    // Mostrar vista de términos
    const termsView = document.getElementById('termsView');
    if (termsView) {
        termsView.classList.add('active');
        window.scrollTo(0, 0);
    }
}

// ========================================
// FUNCIONALIDAD DE TEST PSICOLÓGICO
// ========================================

// Referencias globales para el test
const psychTestView = document.getElementById('psychTestView');
const psychTestForm = document.getElementById('psychTestForm');
const testSections = document.querySelectorAll('.test-section');
const prevSectionBtn = document.getElementById('prevSectionBtn');
const nextSectionBtn = document.getElementById('nextSectionBtn');
const submitTestBtn = document.getElementById('submitTestBtn');
const testResults = document.getElementById('testResults');
const testProgress = document.getElementById('testProgress');
const progressText = document.getElementById('progressText');
const recommendedPsychologists = document.getElementById('recommendedPsychologists');

let currentSection = 0;
const totalSections = testSections.length;

// Navegar al test psicológico
document.getElementById('psychTestBtn')?.addEventListener('click', showPsychTest);

function showPsychTest() {
    // Ocultar otras vistas
    const mainView = document.querySelector('.main-view') || document.body.querySelector('main');
    const appointmentsView = document.getElementById('appointmentsView');
    const videoCallContainer = document.getElementById('videoCallContainer');
    
    if (mainView) mainView.style.display = 'none';
    if (appointmentsView) appointmentsView.classList.remove('active');
    if (videoCallContainer) videoCallContainer.classList.remove('active');
    
    // Mostrar vista del test
    psychTestView.classList.add('active');
    
    // Resetear el test
    resetTest();
}

function resetTest() {
    currentSection = 0;
    psychTestForm.reset();
    testResults.classList.add('hidden');
    psychTestForm.style.display = 'block';
    
    // Mostrar primera sección
    testSections.forEach((section, index) => {
        if (index === 0) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    
    updateNavigation();
    updateProgress();
}

function updateNavigation() {
    // Botón Anterior
    if (currentSection === 0) {
        prevSectionBtn.style.display = 'none';
    } else {
        prevSectionBtn.style.display = 'block';
    }
    
    // Botón Siguiente / Submit
    if (currentSection === totalSections - 1) {
        nextSectionBtn.style.display = 'none';
        submitTestBtn.style.display = 'block';
    } else {
        nextSectionBtn.style.display = 'block';
        submitTestBtn.style.display = 'none';
    }
}

function updateProgress() {
    const totalQuestions = 16;
    const questionsPerSection = [4, 3, 3, 3, 3]; // A, B, C, D, E
    
    let completedQuestions = 0;
    for (let i = 0; i < currentSection; i++) {
        completedQuestions += questionsPerSection[i];
    }
    
    // Si estamos en la última sección, mostrar el total
    const currentQuestion = currentSection === totalSections - 1 ? totalQuestions : completedQuestions + 1;
    const percentage = currentSection === totalSections - 1 ? 100 : (completedQuestions / totalQuestions) * 100;
    
    testProgress.style.width = percentage + '%';
    progressText.textContent = `Pregunta ${currentQuestion} de ${totalQuestions}`;
}

// Validar sección actual
function validateCurrentSection() {
    const currentSectionEl = testSections[currentSection];
    const inputs = currentSectionEl.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentSectionEl.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) isValid = false;
        } else {
            if (!input.value) isValid = false;
        }
    });
    
    return isValid;
}

// Navegación entre secciones
prevSectionBtn?.addEventListener('click', () => {
    if (currentSection > 0) {
        testSections[currentSection].classList.add('hidden');
        currentSection--;
        testSections[currentSection].classList.remove('hidden');
        updateNavigation();
        updateProgress();
        window.scrollTo(0, 0);
    }
});

nextSectionBtn?.addEventListener('click', () => {
    if (!validateCurrentSection()) {
        alert('Por favor completa todos los campos requeridos antes de continuar.');
        return;
    }
    
    if (currentSection < totalSections - 1) {
        testSections[currentSection].classList.add('hidden');
        currentSection++;
        testSections[currentSection].classList.remove('hidden');
        updateNavigation();
        updateProgress();
        window.scrollTo(0, 0);
    }
});

// Enviar test
psychTestForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateCurrentSection()) {
        alert('Por favor completa todos los campos requeridos.');
        return;
    }
    
    // Recopilar respuestas
    const formData = new FormData(psychTestForm);
    const answers = {
        age: document.getElementById('testAge').value,
        gender: document.getElementById('testGender').value,
        occupation: document.getElementById('testOccupation').value,
        schedule: document.getElementById('testSchedule').value,
        reason: document.getElementById('testReason').value,
        duration: document.getElementById('testDuration').value,
        impact: document.getElementById('testImpact').value,
        sadness: formData.get('testSadness'),
        anxiety: formData.get('testAnxiety'),
        physical: formData.get('testPhysical'),
        prevTherapy: formData.get('testPrevTherapy'),
        medication: formData.get('testMedication'),
        diagnosis: formData.get('testDiagnosis'),
        genderPref: document.getElementById('testGenderPref').value,
        approach: document.getElementById('testApproach').value,
        sessionType: document.getElementById('testSessionType').value
    };
    
    // Analizar y recomendar
    const recommendations = analyzeAnswers(answers);
    showRecommendations(recommendations);
});

function analyzeAnswers(answers) {
    // Sistema de puntuación para cada psicólogo
    const scores = psychologists.map(psych => ({
        psychologist: psych,
        score: 0,
        reasons: []
    }));
    
    // Análisis del motivo principal
    const reasonMap = {
        'ansiedad': ['Ansiedad', 'Estrés', 'TCC'],
        'depresion': ['Depresión', 'Bienestar Emocional'],
        'pareja': ['Terapia de Pareja', 'Relaciones'],
        'familiar': ['Terapia Familiar', 'Familia'],
        'duelo': ['Duelo', 'Pérdida'],
        'autoestima': ['Autoestima', 'Desarrollo Personal'],
        'trauma': ['Trauma', 'EMDR']
    };
    
    const keywords = reasonMap[answers.reason] || [];
    scores.forEach(item => {
        keywords.forEach(keyword => {
            if (item.psychologist.specialty.includes(keyword) || 
                item.psychologist.tags.some(tag => tag.includes(keyword))) {
                item.score += 3;
                item.reasons.push(`Especialista en ${keyword}`);
            }
        });
    });
    
    // Análisis de síntomas (ansiedad/depresión)
    if (answers.anxiety === 'si') {
        scores.forEach(item => {
            if (item.psychologist.tags.includes('Ansiedad') || 
                item.psychologist.specialty.includes('Ansiedad')) {
                item.score += 2;
                item.reasons.push('Experiencia en manejo de ansiedad');
            }
        });
    }
    
    if (answers.sadness === 'si') {
        scores.forEach(item => {
            if (item.psychologist.tags.includes('Depresión') || 
                item.psychologist.specialty.includes('Depresión')) {
                item.score += 2;
                item.reasons.push('Experiencia en depresión');
            }
        });
    }
    
    // Análisis de experiencia previa en terapia
    if (answers.prevTherapy === 'si') {
        scores.forEach(item => {
            if (item.psychologist.experience >= 10) {
                item.score += 1;
                item.reasons.push('Alta experiencia profesional');
            }
        });
    } else {
        // Primera vez en terapia - buscar psicólogos con enfoque humanista
        scores.forEach(item => {
            if (item.psychologist.specialty.includes('Humanista')) {
                item.score += 2;
                item.reasons.push('Excelente para primera vez en terapia');
            }
        });
    }
    
    // Análisis de enfoque preferido
    if (answers.approach !== 'no-sabe') {
        const approachMap = {
            'cognitivo-conductual': 'TCC',
            'humanista': 'Humanista',
            'sistemico': 'Familiar'
        };
        const preferredApproach = approachMap[answers.approach];
        
        scores.forEach(item => {
            if (item.psychologist.specialty.includes(preferredApproach)) {
                item.score += 2;
                item.reasons.push(`Enfoque ${preferredApproach}`);
            }
        });
    }
    
    // Análisis de disponibilidad horaria
    scores.forEach(item => {
        if (item.psychologist.availability && item.psychologist.availability.length > 0) {
            item.score += 1;
            item.reasons.push('Disponibilidad inmediata');
        }
    });
    
    // Ordenar por puntuación
    scores.sort((a, b) => b.score - a.score);
    
    // Retornar top 3
    return scores.slice(0, 3).filter(item => item.score > 0);
}

function showRecommendations(recommendations) {
    // Ocultar formulario
    psychTestForm.style.display = 'none';
    
    // Mostrar resultados
    testResults.classList.remove('hidden');
    
    // Limpiar resultados previos
    recommendedPsychologists.innerHTML = '';
    
    if (recommendations.length === 0) {
        recommendedPsychologists.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <p>No pudimos encontrar una coincidencia perfecta basada en tus respuestas.</p>
                <p>Te recomendamos explorar nuestro catálogo completo de psicólogos.</p>
                <button class="btn-primary" onclick="goToHome()" style="margin-top: 1rem;">
                    Ver todos los psicólogos
                </button>
            </div>
        `;
        return;
    }
    
    recommendations.forEach((item, index) => {
        const psych = item.psychologist;
        const reasons = item.reasons.slice(0, 3).join(' • ');
        const badge = index === 0 ? '<div class="best-match-badge">🏆 Mejor Coincidencia</div>' : '';
        
        // Obtener iniciales del nombre
        const nameParts = psych.name.split(' ');
        const initials = nameParts.length >= 2 
            ? nameParts[0][0] + nameParts[nameParts.length - 1][0] 
            : nameParts[0].substring(0, 2);
        
        const card = document.createElement('div');
        card.className = 'psychologist-card';
        card.innerHTML = `
            ${badge}
            <div class="psychologist-avatar">${initials}</div>
            <div class="psychologist-info">
                <h3 class="psychologist-name">${psych.name}</h3>
                <p class="psychologist-specialty">${psych.specialty}</p>
                <div class="psychologist-rating">
                    <span class="stars">${'⭐'.repeat(Math.floor(psych.rating))}${'☆'.repeat(5 - Math.floor(psych.rating))}</span>
                    <span class="rating-number">${psych.rating} (${psych.reviews} reseñas)</span>
                </div>
                <p class="psychologist-experience">${psych.experience} años de experiencia</p>
                <p class="psychologist-price">$${psych.price}/sesión</p>
                
                <div class="recommendation-reasons">
                    <strong>¿Por qué este psicólogo?</strong>
                    <p>${reasons}</p>
                </div>
                
                <div class="psychologist-tags">
                    ${psych.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <button class="btn-primary" onclick="openAppointmentModal(${psych.id})" style="width: 100%; margin-top: 1rem;">
                    📅 Agendar Cita
                </button>
            </div>
        `;
        
        recommendedPsychologists.appendChild(card);
    });
    
    // Scroll a resultados
    testResults.scrollIntoView({ behavior: 'smooth' });
}

// Hacer la cámara flotante y arrastrable
function makeSelfVideoFloating() {
    const selfVideo = document.querySelector('.self-video');
    if (!selfVideo) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // Obtener posición inicial desde bottom/right
    const computedStyle = window.getComputedStyle(selfVideo);
    const bottom = parseInt(computedStyle.bottom);
    const right = parseInt(computedStyle.right);
    
    // Convertir a coordenadas top/left para facilitar el arrastre
    const rect = selfVideo.getBoundingClientRect();
    xOffset = window.innerWidth - rect.right;
    yOffset = rect.top;
    
    selfVideo.addEventListener('touchstart', dragStart, false);
    selfVideo.addEventListener('touchend', dragEnd, false);
    selfVideo.addEventListener('touchmove', drag, false);
    
    selfVideo.addEventListener('mousedown', dragStart, false);
    selfVideo.addEventListener('mouseup', dragEnd, false);
    selfVideo.addEventListener('mousemove', drag, false);
    
    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        if (e.target === selfVideo || selfVideo.contains(e.target)) {
            isDragging = true;
            selfVideo.style.cursor = 'grabbing';
            selfVideo.style.transition = 'none';
        }
    }
    
    function dragEnd(e) {
        isDragging = false;
        selfVideo.style.cursor = 'grab';
        selfVideo.style.transition = 'all 0.3s ease';
        
        // Asegurar que no se salga de los límites
        const rect = selfVideo.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width - 10;
        const maxY = window.innerHeight - rect.height - 10;
        
        if (currentX < 10) currentX = 10;
        if (currentX > maxX) currentX = maxX;
        if (currentY < 10) currentY = 10;
        if (currentY > maxY) currentY = maxY;
        
        setTranslate(currentX, currentY, selfVideo);
    }
    
    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            
            xOffset = currentX;
            yOffset = currentY;
            
            setTranslate(currentX, currentY, selfVideo);
        }
    }
    
    function setTranslate(xPos, yPos, el) {
        // Cambiar a posición absoluta para poder mover libremente
        el.style.position = 'fixed';
        el.style.left = xPos + 'px';
        el.style.top = yPos + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    }
    
    // Establecer cursor inicial
    selfVideo.style.cursor = 'grab';
}

// ========================================
// MENÚ MÓVIL HAMBURGUESA
// ========================================

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en cualquier botón
    const navButtons = navMenu.querySelectorAll('button');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Cerrar menú al hacer scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(scrollTop - lastScrollTop) > 5) {
            mobileMenuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
        lastScrollTop = scrollTop;
    }, { passive: true });
}

//CONFIGURACIÓN Y VARIABLES GLOBALES

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000'; //Puerto API
const API_ENDPOINT = '/contactos';

// Variables globales
let todosLosContactos = [];
let contactosFiltrados = [];



//INICIALIZACIÓN PRINCIPAL


// Función principal que se ejecuta cuando la página se carga
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el botón de atrás (para página de agregar contacto)
    configurarBotonAtras();
    
    // Configurar formulario de contacto (si existe)
    configurarFormularioContacto();
    
    // Cargar contactos al iniciar (solo en index.html)
    cargarContactos();
    
    // Configurar todos los event listeners
    configurarEventListeners();
});


// CONFIGURACIÓN DE EVENT LISTENERS

function configurarBotonAtras() {
    const atrasBtn = document.getElementById('atras-btn');
    if (atrasBtn) {
        atrasBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Evita que la página se recargue
            window.location.href = "index.html";
            window.close()
        });
    }
}

function configurarFormularioContacto() {
    const contactoForm = document.getElementById('contactoForm');
    if (contactoForm) {
        contactoForm.addEventListener('submit', handleFormSubmit);
    }
}

function configurarEventListeners() {
    // Configurar búsqueda
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', manejarBusqueda);
    }

    // Configurar botones de letras
    const letrasBtn = document.querySelectorAll('.letrabtn');
    letrasBtn.forEach(btn => {
        btn.addEventListener('click', function() {
            const letra = this.dataset.letter;
            filtrarPorLetra(letra);
        });
    });

    // Configurar botón de favoritos
    const favoritosBtn = document.getElementById('favoritos-sidebar');
    if (favoritosBtn) {
        favoritosBtn.addEventListener('click', mostrarFavoritos);
    }

    // Configurar botón de agregar contacto
    const aggContactoBtn = document.getElementById('aggContacto');
    if (aggContactoBtn) {
        aggContactoBtn.addEventListener('click', function() {
            window.location.href = 'agregarContacto.html';
        });
    }
}


//OPERACIONES CON LA API (CRUD)


// Función para cargar todos los contactos desde el backend
async function cargarContactos() {
    try {
        mostrarCargando(true);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const contactos = await response.json();
        
        // DEBUG: Ver la estructura real de los datos
        console.log('Datos recibidos del API:', contactos);
        if (contactos.length > 0) {
            console.log('Estructura del primer contacto:', contactos[0]);
        }

        // Guardar contactos en variables globales
        todosLosContactos = contactos;
        contactosFiltrados = contactos;
        
        // Mostrar contactos en la interfaz
        mostrarContactos(contactos);
        
        console.log('Contactos cargados:', contactos.length);

    } catch (error) {
        console.error('Error al cargar contactos:', error);
        mostrarError('Error al cargar los contactos: ' + error.message);
    } finally {
        mostrarCargando(false);
    }
}

// Función para enviar datos al backend
async function saveContact(contactoData) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactoData)
        });

        const data = await response.json();

        if (!response.ok) {
            // Manejar errores del backend
            if (data.errors) {
                // Si hay errores de validación de Zod
                const errorMessages = Object.values(data.errors)
                    .filter(error => error._errors)
                    .map(error => error._errors.join(', '))
                    .join('; ');
                
                throw new Error(errorMessages || 'Error de validación');
            }
            throw new Error(data.message || 'Error del servidor');
        }

        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.');
        }
        throw error;
    }
}


// MANEJO DE FORMULARIOS

// Función para manejar el envío del formulario de contacto
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Obtener los datos del formulario
    const formData = new FormData(event.target);

    const contactoData = {
        PrimerNombre: formData.get('primerNombre'), 
        SegundoNombre: formData.get('segundoNombre') || undefined, 
        Apellidos: formData.get('apellidos'), 
        Telefono: formData.get('telefono'), 
        Correo: formData.get('correo') || undefined 
    };

    console.log('Datos a enviar:', contactoData); // Para debug

    // VALIDACIÓN: solo campos realmente obligatorios
    if (!contactoData.primerNombre || !contactoData.apellidos || !contactoData.telefono) {
        alert('Por favor, complete: Primer nombre, Apellidos y Teléfono');
        return;
    }

    if (!isValidPhone(contactoData.telefono)) {
        alert('Teléfono no válido. Debe tener entre 8 y 15 dígitos y opcionalmente el prefijo "+" al inicio.');
        return;
    }

    // Validación de email SOLO si se proporciona
    if (contactoData.correo && contactoData.correo !== '' && !isValidEmail(contactoData.correo)) {
        alert('Por favor, ingrese un correo electrónico válido');
        return;
    }

    try {
        // Mostrar indicador de carga
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Guardando...';
        submitBtn.disabled = true;

        // Enviar datos al backend
        const response = await saveContact(contactoData);

        // Mostrar mensaje de éxito
        alert('Contacto guardado exitosamente!');
        
        // Limpiar formulario
        event.target.reset();

    } catch (error) {
        console.error('Error al guardar contacto:', error);
        alert('Error al guardar el contacto: ' + error.message);
    } finally {
        // Restaurar botón
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<img class="guardar-icon" src="./assets/logos/guardar.png">';
            submitBtn.disabled = false;
        }
    }
}


// FILTRADO Y BÚSQUEDA

// Función para manejar la búsqueda en tiempo real
function manejarBusqueda(event) {
    const terminoBusqueda = event.target.value.toLowerCase().trim();
    
    if (terminoBusqueda === '') {
        // Si no hay término de búsqueda, mostrar todos
        contactosFiltrados = todosLosContactos;
    } else {
        // Filtrar contactos que coincidan con el término
        contactosFiltrados = todosLosContactos.filter(contacto => {
            const nombreCompleto = `${contacto.PrimerNombre} ${contacto.SegundoNombre || ''} ${contacto.Apellidos}`.toLowerCase();
            const telefono = contacto.Telefono.toString(); // Cambiado a Telefono
            const correo = contacto.Correo ? contacto.Correo.toLowerCase() : ''; // Asumiendo que se llama Correo
            
            return nombreCompleto.includes(terminoBusqueda) ||
                   telefono.includes(terminoBusqueda) ||
                   (correo && correo.includes(terminoBusqueda));
        });
    }
    
    mostrarContactos(contactosFiltrados);
}

// Función para filtrar contactos por letra del alfabeto
function filtrarPorLetra(letra) {
    // Remover clase activa de todos los botones de letra
    document.querySelectorAll('.letrabtn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Agregar clase activa al botón clickeado
    document.querySelector(`[data-letter="${letra}"]`).classList.add('active');
    
    // Filtrar contactos usando el nombre correcto de propiedad
    contactosFiltrados = todosLosContactos.filter(contacto => 
        contacto.PrimerNombre.charAt(0).toUpperCase() === letra // Cambiado a PrimerNombre
    );
    
    mostrarContactos(contactosFiltrados);
}

// Función para mostrar solo favoritos (placeholder para futura implementación)
function mostrarFavoritos() {
    // Esta función se puede implementar cuando tengas la funcionalidad de favoritos
    console.log('Mostrar favoritos - Funcionalidad pendiente');
    // contactosFiltrados = todosLosContactos.filter(contacto => contacto.favorito);
    // mostrarContactos(contactosFiltrados);
}


//RENDERIZADO Y MANIPULACIÓN DEL DOM

// Función para mostrar los contactos en el DOM
function mostrarContactos(contactos) {
    const main = document.querySelector('main');
    if (!main) {
        console.error('No se encontró el elemento main');
        return;
    }

    // Limpiar contenido existente (excepto el hr)
    const hr = main.querySelector('hr');
    main.innerHTML = '';
    if (hr) {
        main.appendChild(hr);
    }

    if (contactos.length === 0) {
        mostrarMensajeVacio();
        return;
    }

    // Ordenar contactos alfabéticamente por primer nombre
    const contactosOrdenados = contactos.sort((a, b) => {
        const nombreA = (a.PrimerNombre || '').toString().toLowerCase(); // Cambiado a PrimerNombre
        const nombreB = (b.PrimerNombre || '').toString().toLowerCase(); // Cambiado a PrimerNombre
        return nombreA.localeCompare(nombreB);
    });

    // Crear elementos para cada contacto
    contactosOrdenados.forEach(contacto => {
        const contactoElement = crearElementoContacto(contacto);
        main.appendChild(contactoElement);
    });
}

// Función para crear el elemento DOM de un contacto individual
function crearElementoContacto(contacto) {
    const contactoDiv = document.createElement('div');
    contactoDiv.className = 'contact-container';
    contactoDiv.dataset.contactoId = contacto.ContactoID; // Cambiado a ContactoID

    // Crear nombre completo usando los nombres correctos de propiedades
    const nombreCompleto = `${contacto.PrimerNombre} ${contacto.SegundoNombre || ''} ${contacto.Apellidos}`.trim();

    contactoDiv.innerHTML = `
        <button class="modalBtn" onclick="mostrarDetalleContacto(${contacto.ContactoID})"> <!-- Cambiado a ContactoID -->
            <span class="contact-name">${nombreCompleto}</span>
        </button>
        <button class="call-btn" onclick="llamarContacto('${contacto.Telefono}')"> <!-- Cambiado a Telefono -->
            <img src="./assets/logos/call.png" class="llamar-icon" alt="Llamar" />
        </button>
    `;

    return contactoDiv;
}


// INTERACCIONES DEL USUARIO

// Función para mostrar detalles de un contacto 
function mostrarDetalleContacto(contactoId) {
    const contacto = todosLosContactos.find(c => c.ContactoID === contactoId); // Cambiado a ContactoID
    if (contacto) {
        console.log('Mostrar detalle de contacto:', contacto);
        alert(`Detalle de: ${contacto.PrimerNombre} ${contacto.Apellidos}\nTeléfono: ${contacto.Telefono}${contacto.Correo ? '\nCorreo: ' + contacto.Correo : ''}`); // Cambiado a Telefono y asumiendo Correo
    }
}


// ESTADOS DE LA INTERFAZ

// Función para mostrar mensaje cuando no hay contactos
function mostrarMensajeVacio() {
    const main = document.querySelector('main');
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-vacio';
    mensajeDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
            <h3>No se encontraron contactos</h3>
            <p>Agrega tu primer contacto usando el botón +</p>
        </div>
    `;
    main.appendChild(mensajeDiv);
}

// Función para mostrar indicador de carga
function mostrarCargando(mostrar) {
    let loader = document.getElementById('loader');
    
    if (mostrar && !loader) {
        loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div>Cargando contactos...</div>
            </div>
        `;
        
        const main = document.querySelector('main');
        if (main) {
            main.appendChild(loader);
        }
    } else if (!mostrar && loader) {
        loader.remove();
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const main = document.querySelector('main');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mensaje-error';
    errorDiv.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #d32f2f;">
            <h3>Error</h3>
            <p>${mensaje}</p>
            <button onclick="cargarContactos()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Reintentar
            </button>
        </div>
    `;
    
    if (main) {
        main.innerHTML = '';
        main.appendChild(errorDiv);
    }
}


//VALIDACIONES


// Función para validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar formato de teléfono
function isValidPhone(phone) {
    const phoneRegex = /^\+?\d{8,15}$/;
    return phoneRegex.test(phone);
}


//UTILIDADES PÚBLICAS

// Función para recargar contactos (útil para después de agregar/editar)
function recargarContactos() {
    cargarContactos();
}
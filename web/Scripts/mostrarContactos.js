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
    // Cargar contactos al iniciar (solo en index.html)
    cargarContactos();
    
    // Configurar todos los event listeners para mostrar contactos
    configurarEventListeners();
});

// CONFIGURACIÓN DE EVENT LISTENERS

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
            window.location.href = 'crearContacto.html';
        });
    }
}

//OPERACIONES CON LA API (READ)

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
            const telefono = contacto.Telefono.toString();
            const correo = contacto.Correo ? contacto.Correo.toLowerCase() : '';
            
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
        contacto.PrimerNombre.charAt(0).toUpperCase() === letra
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
        const nombreA = (a.PrimerNombre || '').toString().toLowerCase();
        const nombreB = (b.PrimerNombre || '').toString().toLowerCase();
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
    contactoDiv.dataset.contactoId = contacto.ContactoID;

    // Crear nombre completo usando los nombres correctos de propiedades
    const nombreCompleto = `${contacto.PrimerNombre} ${contacto.SegundoNombre || ''} ${contacto.Apellidos}`.trim();

    // Crear botón principal del contacto
    const modalBtn = document.createElement('button');
    modalBtn.className = 'modalBtn';
    modalBtn.innerHTML = `<span class="contact-name">${nombreCompleto}</span>`;
    
    // Agregar event listener para abrir perfil
    modalBtn.addEventListener('click', function() {
        abrirPerfilContacto(contacto.ContactoID);
    });

    // Crear botón de llamar
    const callBtn = document.createElement('button');
    callBtn.className = 'call-btn';
    callBtn.innerHTML = `<img src="./assets/logos/call.png" class="llamar-icon" alt="Llamar" />`;
    
    // Agregar event listener para llamar (evitar propagación)
    callBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        llamarContacto(contacto.Telefono);
    });

    // Agregar botones al contenedor
    contactoDiv.appendChild(modalBtn);
    contactoDiv.appendChild(callBtn);

    return contactoDiv;
}

// INTERACCIONES DEL USUARIO

// Función para abrir el perfil de un contacto usando su ID
function abrirPerfilContacto(contactoId) {
    console.log('Abriendo perfil para contacto ID:', contactoId);
    window.open(`perfil.html?id=${contactoId}`, '_blank');
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

//UTILIDADES PÚBLICAS

// Función para recargar contactos (útil para después de agregar/editar)
function recargarContactos() {
    cargarContactos();
}
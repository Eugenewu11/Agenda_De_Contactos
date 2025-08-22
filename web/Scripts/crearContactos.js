//CONFIGURACIÓN Y VARIABLES GLOBALES

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000'; //Puerto API
const API_ENDPOINT = '/contactos';

//INICIALIZACIÓN PRINCIPAL

// Función principal que se ejecuta cuando la página se carga
document.addEventListener('DOMContentLoaded', function() {
    // Configurar el botón de atrás (para página de agregar contacto)
    configurarBotonAtras();
    
    // Configurar formulario de contacto (si existe)
    configurarFormularioContacto();
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

//OPERACIONES CON LA API (CREATE)

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
        primerNombre: formData.get('primerNombre'),      
        segundoNombre: formData.get('segundoNombre') || undefined, 
        apellidos: formData.get('apellidos'),            
        telefono: formData.get('telefono'),              
        correo: formData.get('correo') || undefined      
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

    contactoData.telefono = cleanPhoneNumber(contactoData.telefono);

    try {
        // Mostrar indicador de carga
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Guardando...';
        submitBtn.disabled = true;

        // Enviar datos al backend
        const response = await saveContact(contactoData);

        // Mostrar mensaje de éxito
        mostrarMensajeExito('Contacto guardado exitosamente!');
        
        // Limpiar formulario
        event.target.reset();

        // Opción: redirigir a index después de un delay
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        console.error('Error al guardar contacto:', error);
        mostrarMensajeError('Error al guardar el contacto: ' + error.message);
    } finally {
        // Restaurar botón
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<img class="guardar-icon" src="./assets/logos/guardar.png">';
            submitBtn.disabled = false;
        }
    }
}

//VALIDACIONES

// Función para validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function cleanPhoneNumber(phone) {
    // Remover espacios, guiones, paréntesis
    return phone.replace(/[\s\-\(\)]/g, '');
}

function isValidPhone(phone) {
    const cleanedPhone = cleanPhoneNumber(phone);
    const phoneRegex = /^\+?\d{8,15}$/;
    return phoneRegex.test(cleanedPhone);
}

//UTILIDADES DE INTERFAZ

// Función para mostrar mensaje de éxito
function mostrarMensajeExito(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-exito';
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4caf50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    mensajeDiv.textContent = mensaje;
    
    document.body.appendChild(mensajeDiv);
    
    // Remover el mensaje después de 3 segundos
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.parentNode.removeChild(mensajeDiv);
        }
    }, 3000);
}

// Función para mostrar mensaje de error
function mostrarMensajeError(mensaje) {
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-error';
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    mensajeDiv.textContent = mensaje;
    
    document.body.appendChild(mensajeDiv);
    
    // Remover el mensaje después de 5 segundos
    setTimeout(() => {
        if (mensajeDiv.parentNode) {
            mensajeDiv.parentNode.removeChild(mensajeDiv);
        }
    }, 5000);
}

//UTILIDADES DE FORMULARIO

// Función para limpiar formulario
function limpiarFormulario() {
    const form = document.getElementById('contactoForm');
    if (form) {
        form.reset();
    }
}

// Función para validar formulario completo
function validarFormulario(formData) {
    const errores = [];
    
    if (!formData.get('primerNombre')) {
        errores.push('El primer nombre es obligatorio');
    }
    
    if (!formData.get('apellidos')) {
        errores.push('Los apellidos son obligatorios');
    }
    
    if (!formData.get('telefono')) {
        errores.push('El teléfono es obligatorio');
    } else if (!isValidPhone(formData.get('telefono'))) {
        errores.push('El formato del teléfono no es válido');
    }
    
    const correo = formData.get('correo');
    if (correo && correo !== '' && !isValidEmail(correo)) {
        errores.push('El formato del correo electrónico no es válido');
    }
    
    return errores;
}
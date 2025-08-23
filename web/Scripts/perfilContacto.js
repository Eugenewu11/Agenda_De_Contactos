// CONFIGURACIÓN DE LA API PARA PERFIL
const API_BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/contactos';

// Variables globales del perfil
let contactoActual = null;

// INICIALIZACIÓN DEL PERFIL
document.addEventListener('DOMContentLoaded', function() {
    cargarPerfilContacto();
    configurarEventListenersPerfil();
});

// CONFIGURACIÓN DE EVENT LISTENERS DEL PERFIL
function configurarEventListenersPerfil() {
    // Botón de atrás
    const atrasBtn = document.getElementById('atras-btn');
    if (atrasBtn) {
        atrasBtn.addEventListener('click', function() {
            window.close(); // Cierra la ventana/pestaña actual
            // Si no se puede cerrar (por ejemplo, no se abrió con window.open), redirige
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 100);
        });
    }

    // Botón de favorito
    const favoritoBtn = document.getElementById('favorito-btn');
    if (favoritoBtn) {
        favoritoBtn.addEventListener('click', toggleFavorito);
    }

    // Botón de editar
    const editarBtn = document.getElementById('editar-btn');
    if (editarBtn) {
        editarBtn.addEventListener('click', function() {
            if (contactoActual) {
                // Redirigir a página de edición con el ID del contacto
                window.location.href = `editarContacto.html?id=${contactoActual.ContactoID}`;
            }
        });
    }

    // Botón de eliminar
    const eliminarBtn = document.getElementById('eliminar-btn');
    if (eliminarBtn) {
        eliminarBtn.addEventListener('click', confirmarEliminacion);
    }

    // Botones de acción en las secciones de información
    configurarBotonesAccion();
}

// CARGA DE DATOS DEL CONTACTO
async function cargarPerfilContacto() {
    try {
        // Obtener el ID del contacto desde los parámetros URL
        const urlParams = new URLSearchParams(window.location.search);
        const contactoId = urlParams.get('id');

        console.log('URL actual:', window.location.href);
        console.log('Parámetros URL:', urlParams.toString());
        console.log('ID del contacto obtenido:', contactoId);

        if (!contactoId) {
            throw new Error('No se proporcionó ID de contacto');
        }

        mostrarCargandoPerfil(true);

        // Primero intentar obtener todos los contactos y buscar por ID
        // (en caso de que tu API no tenga endpoint individual)
        console.log('Intentando obtener contacto con ID:', contactoId);
        
        let contacto = null;
        
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}/${contactoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                contacto = await response.json();
                console.log('Contacto obtenido del endpoint individual:', contacto);
            } else {
                console.log('Endpoint individual no disponible, intentando obtener todos...');
                throw new Error('Endpoint individual no disponible');
            }
        } catch (individualError) {
           
            console.log('Obteniendo todos los contactos para filtrar...');
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const todosContactos = await response.json();
            console.log('Todos los contactos:', todosContactos);
            
            // Filtrar por ID (convertir a número para comparar)
            contacto = todosContactos.find(c => c.ContactoID == contactoId);
            console.log('Contacto filtrado:', contacto);
        }

        if (!contacto) {
            throw new Error(`No se encontró contacto con ID: ${contactoId}`);
        }

        contactoActual = contacto;
        console.log('Contacto actual asignado:', contactoActual);

        // Mostrar los datos en la interfaz
        mostrarDatosContacto(contacto);

    } catch (error) {
        console.error('Error al cargar el perfil del contacto:', error);
        mostrarErrorPerfil('Error al cargar el perfil: ' + error.message);
    } finally {
        mostrarCargandoPerfil(false);
    }
}

// MOSTRAR DATOS EN LA INTERFAZ
function mostrarDatosContacto(contacto) {
    console.log('Ejecutando mostrarDatosContacto con:', contacto);
    
    // Actualizar nombre en el header
    const nombreContacto = document.querySelector('.nombre-contacto');
    
    if (nombreContacto) {
        const nombreCompleto = `${contacto.PrimerNombre} ${contacto.SegundoNombre || ''} ${contacto.Apellidos}`.trim();
        nombreContacto.textContent = nombreCompleto;
    }

    // Actualizar número de teléfono
    const infoSections = document.querySelectorAll('.info-section');
    
    // Primera sección - Teléfono
    if (infoSections[0]) {
        const phoneValue = infoSections[0].querySelector('.info-value');
        console.log('Elemento teléfono encontrado:', phoneValue);
        if (phoneValue) {
            phoneValue.textContent = contacto.Telefono || 'No disponible';
            console.log('Teléfono actualizado a:', contacto.Telefono);
        }
    }

    // Segunda sección - Correo
    if (infoSections[1]) {
        const emailValue = infoSections[1].querySelector('.info-value');
        console.log('Elemento correo encontrado:', emailValue);
        if (emailValue) {
            emailValue.textContent = contacto.Correo || 'No disponible';
            console.log('Correo actualizado a:', contacto.Correo);
        }
        
        // Ocultar sección de correo si no existe
        if (!contacto.Correo) {
            infoSections[1].style.display = 'none';
            console.log('Sección de correo oculta porque no hay correo');
        }
    }

    // Actualizar estado de favorito
    actualizarEstadoFavorito(contacto.Favorito || false);
    console.log('Estado de favorito actualizado:', contacto.Favorito);
}

// FUNCIONES DE FAVORITO
function actualizarEstadoFavorito(esFavorito) {
    const favoritoBtn = document.getElementById('favorito-btn');
    const favoritoImg = favoritoBtn ? favoritoBtn.querySelector('img') : null;
    
    if (favoritoImg) {
        favoritoImg.src = esFavorito 
            ? './assets/logos/favoritoConClick.png' 
            : './assets/logos/favoritoSinClick.png';
        favoritoImg.alt = esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos';
    }
}

async function toggleFavorito() {
    if (!contactoActual) return;

    try {
        const nuevoEstado = !contactoActual.Favorito;
        
        // Actualizar en el servidor
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}/${contactoActual.ContactoID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...contactoActual,
                Favorito: nuevoEstado
            })
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Actualizar estado local
        contactoActual.Favorito = nuevoEstado;
        actualizarEstadoFavorito(nuevoEstado);

        console.log(`Contacto ${nuevoEstado ? 'agregado a' : 'removido de'} favoritos`);

    } catch (error) {
        console.error('Error al actualizar favorito:', error);
        alert('Error al actualizar favorito: ' + error.message);
    }
}

// FUNCIONES DE ELIMINACIÓN
async function confirmarEliminacion() {
    if (!contactoActual) return;

    const nombreCompleto = `${contactoActual.PrimerNombre} ${contactoActual.SegundoNombre || ''} ${contactoActual.Apellidos}`.trim();
    
    if (confirm(`¿Estás seguro de que deseas eliminar a ${nombreCompleto}?`)) {
        await eliminarContacto();
    }
}

async function eliminarContacto() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}/${contactoActual.ContactoID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        alert('Contacto eliminado exitosamente');
        
        // Redirigir de vuelta a la página principal
        window.close();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 100);

    } catch (error) {
        console.error('Error al eliminar contacto:', error);
        alert('Error al eliminar contacto: ' + error.message);
    }
}

// CONFIGURAR BOTONES DE ACCIÓN
function configurarBotonesAccion() {
    const infoSections = document.querySelectorAll('.info-section');

    // Botones de la sección de teléfono
    if (infoSections[0]) {
        const buttons = infoSections[0].querySelectorAll('.action-btn');
        
        // Botón copiar teléfono
        if (buttons[0]) {
            buttons[0].addEventListener('click', function() {
                if (contactoActual && contactoActual.Telefono) {
                    copiarAlPortapapeles(contactoActual.Telefono);
                }
            });
        }

        // Botón llamar
        if (buttons[1]) {
            buttons[1].addEventListener('click', function() {
                if (contactoActual && contactoActual.Telefono) {
                    window.open(`tel:${contactoActual.Telefono}`);
                }
            });
        }
    }

    // Botones de la sección de correo
    if (infoSections[1]) {
        const buttons = infoSections[1].querySelectorAll('.action-btn');
        
        // Botón copiar correo
        if (buttons[0]) {
            buttons[0].addEventListener('click', function() {
                if (contactoActual && contactoActual.Correo) {
                    copiarAlPortapapeles(contactoActual.Correo);
                }
            });
        }

        // Botón enviar correo
        if (buttons[1]) {
            buttons[1].addEventListener('click', function() {
                if (contactoActual && contactoActual.Correo) {
                    window.open(`mailto:${contactoActual.Correo}`);
                }
            });
        }
    }

    // Botones de compartir y QR (placeholder para futura implementación)
    if (infoSections[2]) {
        const shareBtn = infoSections[2].querySelector('.action-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                compartirContacto();
            });
        }
    }

    if (infoSections[3]) {
        const qrBtn = infoSections[3].querySelector('.action-btn');
        if (qrBtn) {
            qrBtn.addEventListener('click', function() {
                generarCodigoQR();
            });
        }
    }
}

// FUNCIONES UTILITARIAS
async function copiarAlPortapapeles(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        // Mostrar feedback visual temporal
        mostrarFeedback('Copiado al portapapeles');
    } catch (error) {
        console.error('Error al copiar:', error);
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = texto;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarFeedback('Copiado al portapapeles');
    }
}

function mostrarFeedback(mensaje) {
    // Crear elemento temporal para mostrar feedback
    const feedback = document.createElement('div');
    feedback.textContent = mensaje;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

function compartirContacto() {
    if (!contactoActual) return;
    
    const nombreCompleto = `${contactoActual.PrimerNombre} ${contactoActual.SegundoNombre || ''} ${contactoActual.Apellidos}`.trim();
    const textoCompartir = `Contacto: ${nombreCompleto}\nTeléfono: ${contactoActual.Telefono}${contactoActual.Correo ? '\nCorreo: ' + contactoActual.Correo : ''}`;
    
    if (navigator.share) {
        navigator.share({
            title: `Contacto de ${nombreCompleto}`,
            text: textoCompartir
        });
    } else {
        copiarAlPortapapeles(textoCompartir);
    }
}

function generarCodigoQR() {
    // Placeholder para funcionalidad de código QR
    alert('Funcionalidad de código QR - Pendiente de implementación');
}

// ESTADOS DE LA INTERFAZ
function mostrarCargandoPerfil(mostrar) {
    let loader = document.getElementById('perfil-loader');
    
    if (mostrar && !loader) {
        loader = document.createElement('div');
        loader.id = 'perfil-loader';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        loader.innerHTML = '<div>Cargando perfil...</div>';
        document.body.appendChild(loader);
    } else if (!mostrar && loader) {
        loader.remove();
    }
}

function mostrarErrorPerfil(mensaje) {
    const main = document.querySelector('.perfil-main');
    if (main) {
        main.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #d32f2f;">
                <h3>Error</h3>
                <p>${mensaje}</p>
                <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

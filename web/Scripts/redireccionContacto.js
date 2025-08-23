//! FUNCIONALIDADES DE REDIRECCIÓN Y NAVEGACIÓN

document.addEventListener('DOMContentLoaded', () => {
  // Manejo del clic en call-btn (debe evitar propagación)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.call-btn')) {
      e.stopPropagation(); 
      console.log('Botón de llamar clickeado');
      // La funcionalidad de llamada se maneja en mostrarContactos.js
    }
  });
});

//! Abre nueva página para guardar nuevo contacto
document.addEventListener('DOMContentLoaded', function() {
  const aggContactoBtn = document.getElementById("aggContacto");
  if (aggContactoBtn) {
    aggContactoBtn.addEventListener("click", function () {
      window.location.href = "crearContacto.html";
    });
  }
});

// NOTA: La redirección a perfil.html ahora se maneja directamente en mostrarContactos.js
// usando el ID del contacto en lugar del nombre para mayor precisión.

//TODO: Que la redireccion sea segun el id de contacto.
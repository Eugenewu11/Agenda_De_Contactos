//! Abre el perfil del contacto en una nueva pagina 
document.addEventListener('DOMContentLoaded', () => {
  const contactos = document.querySelectorAll('.contact-container');

  // Manejo del clic en call-btn (debe evitar propagación)
  const callButtons = document.querySelectorAll('.call-btn');
  callButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      console.log('Llamando al contacto...');
      
    });
  });

  // Clic en el contenedor para abrir perfil
  contactos.forEach((contacto) => {
    contacto.addEventListener('click', () => {
      const nombre = contacto.querySelector('.contact-name').textContent.trim();
      const nombreCodificado = encodeURIComponent(nombre);
      window.open(`perfil.html?nombre=${nombreCodificado}`, '_blank');
    });
  });
});

//! Abre nueva pagina para guardar nuevo contacto
document.getElementById("aggContacto").addEventListener("click", function () {
    window.location.href = "crearContacto.html"
  });


//TODO: Que la redireccion sea segun el id de contacto.
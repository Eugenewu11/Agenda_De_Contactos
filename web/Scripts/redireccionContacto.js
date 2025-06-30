//! Abre el perfil del contacto en una nueva pagina 
document.addEventListener('DOMContentLoaded', () => {
  const contactos = document.querySelectorAll('.contact-container');

  contactos.forEach((contacto) => {
    contacto.addEventListener('click', () => {
      const nombre = contacto.querySelector('.contact-name').textContent.trim();
      const nombreCodificado = encodeURIComponent(nombre);
      window.open(`perfil.html?nombre=${nombreCodificado}`, '_blank');
    });
  });
});

//! Abre nueva pagina para guardar nuevo contacto

//TODO: Que la redireccion sea segun el id de contacto.
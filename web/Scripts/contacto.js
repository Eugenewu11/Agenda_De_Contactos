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

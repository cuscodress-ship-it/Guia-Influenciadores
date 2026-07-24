// Insere a barra de navegação inferior (estilo app mobile).
// "active" é "guia" ou "perfil".
export function renderBottomNav(active) {
  const nav = document.createElement("div");
  nav.className = "bottom-nav";
  nav.innerHTML = `
    <a class="bottom-nav__item ${active === "guia" ? "active" : ""}" href="area-de-membros.html">
      <span class="bottom-nav__icon">📖</span>
      <span>Guia</span>
    </a>
    <a class="bottom-nav__item ${active === "perfil" ? "active" : ""}" href="perfil.html">
      <span class="bottom-nav__icon">👤</span>
      <span>Perfil</span>
    </a>
  `;
  document.body.appendChild(nav);
}

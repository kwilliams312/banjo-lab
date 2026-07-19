const siteMenu = document.querySelector(".site-menu");
const menuToggle = document.querySelector(".site-menu-toggle");

if (siteMenu && menuToggle) {
  const setMenuOpen = (open) => {
    siteMenu.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(!siteMenu.classList.contains("is-open"));
  });

  siteMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("click", (event) => {
    if (siteMenu.classList.contains("is-open") && !siteMenu.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && siteMenu.classList.contains("is-open")) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });
}

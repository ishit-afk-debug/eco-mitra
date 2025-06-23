// lang.js
// Reusable language selection and translation logic for EcoMitra

function initLanguage(translations, dropdownId) {
  const langSelect = document.getElementById(dropdownId);
  function setLang(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      } else if (translations['en'] && translations['en'][key]) {
        el.textContent = translations['en'][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute('placeholder', translations[lang][key]);
      } else if (translations['en'] && translations['en'][key]) {
        el.setAttribute('placeholder', translations['en'][key]);
      }
    });
  }
  if (langSelect) {
    langSelect.addEventListener('change', function(e) {
      const lang = e.target.value;
      localStorage.setItem('ecomitra_lang', lang);
      setLang(lang);
    });
    // On page load, set language from localStorage or default
    const savedLang = localStorage.getItem('ecomitra_lang') || langSelect.value;
    langSelect.value = savedLang;
    setLang(savedLang);
  }
}

// For module/ES6 usage:
// export { initLanguage }; 
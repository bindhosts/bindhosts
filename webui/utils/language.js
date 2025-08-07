import { applyRippleEffect } from './util.js';

const rtlLang = [
  'ar',  // Arabic
  'fa',  // Persian
  'he',  // Hebrew
  'ur',  // Urdu
  'ps',  // Pashto
  'sd',  // Sindhi
  'ku',  // Kurdish
  'yi',  // Yiddish
  'dv',  // Dhivehi
];

export let translations = {};
export let lang;
let baseTranslations = {};
let availableLanguages = ['en'];
let languageNames = {};

/**
 * Parse XML translation file into a JavaScript object
 * @param {string} xmlText - The XML content as string
 * @returns {Object} - Parsed translations
 */
function parseTranslationsXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const strings = xmlDoc.getElementsByTagName('string');
    const translations = {};

    for (let i = 0; i < strings.length; i++) {
        const string = strings[i];
        const name = string.getAttribute('name');
        const value = string.textContent;
        translations[name] = value;
    }

    return translations;
}

/**
 * Detect user's default language
 * @returns {Promise<string>} - Detected language code
 */
export async function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];

    try {
        // Fetch available languages
        const availableResponse = await fetch('locales/languages.json');
        const availableData = await availableResponse.json();
        availableLanguages = Object.keys(availableData);
        languageNames = availableData;

        // Get preferred language
        const preferedLang = localStorage.getItem('bindhostsLanguage');

        // Check if preferred language is valid
        if (preferedLang !== 'default' && availableLanguages.includes(preferedLang)) {
            return preferedLang;
        } else if (availableLanguages.includes(userLang)) {
            return userLang;
        } else if (availableLanguages.includes(langCode)) {
            return langCode;
        } else {
            localStorage.removeItem('bindhostsLanguage');
            return 'en';
        }
    } catch (error) {
        console.error('Error detecting user language:', error);
        return 'en';
    }
}

/**
 * Load translations dynamically based on the selected language
 * @returns {Promise<void>}
 */
export async function loadTranslations() {
    try {
        // load Englsih as base translations
        const baseResponse = await fetch('locales/strings/en.xml');
        const baseXML = await baseResponse.text();
        baseTranslations = parseTranslationsXML(baseXML);

        // load user's language if available
        lang = await detectUserLanguage();
        if (lang !== 'en') {
            const response = await fetch(`locales/strings/${lang}.xml`);
            const userXML = await response.text();
            const userTranslations = parseTranslationsXML(userXML);
            translations = { ...baseTranslations, ...userTranslations };
        } else {
            translations = baseTranslations;
        }

        // Support for rtl language
        const isRTL = rtlLang.includes(lang.split('-')[0]);
        const title = document.querySelector('.title-container');
        const headerBtn = document.getElementById('mode-btn');
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        title.style.display = 'flex';
        if (headerBtn) headerBtn.style.display = 'inline-block';
        setTimeout(() => {
            if (headerBtn) headerBtn.classList.add('loaded');
            title.classList.add('loaded');
        }, 10);
    } catch (error) {
        console.error('Error loading translations:', error);
        lang = 'en';
        translations = baseTranslations;
    }
    applyTranslations();
}

/**
 * Apply translations to all elements with data-i18n attributes
 * @returns {void}
 */
export function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const translation = translations[key];
        if (translation) {
            if (el.hasAttribute("placeholder")) {
                el.setAttribute("placeholder", translation);
            } else {
                el.textContent = translation;
            }
        }
    });
}

/**
 * Generate the language menu dynamically
 * Refer available-lang.json in ./locales for list of languages
 * @returns {void}
 */
export function generateLanguageMenu() {
    const languageMenu = document.querySelector('.language-menu');
    languageMenu.innerHTML = '';

    // Add System Default option
    const defaultButton = document.createElement('button');
    defaultButton.classList.add('language-option', 'ripple-element');
    defaultButton.setAttribute('data-lang', 'default');
    defaultButton.setAttribute('data-i18n', 'system_default');
    defaultButton.textContent = 'System Default';
    languageMenu.appendChild(defaultButton);

    const sortedLanguages = Object.entries(languageNames)
        .map(([lang, name]) => ({ lang, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    sortedLanguages.forEach(({ lang, name }) => {
        const button = document.createElement('button');
        button.classList.add('language-option', 'ripple-element');
        button.setAttribute('data-lang', lang);
        button.textContent = name;
        if (languageMenu) {
            languageMenu.appendChild(button);
        }
    });
    applyRippleEffect();

    languageMenu.addEventListener("click", (e) => {
        if (e.target.classList.contains("language-option")) {
            const lang = e.target.getAttribute("data-lang");
            localStorage.setItem('bindhostsLanguage', lang);
            setTimeout(() => location.reload(), 80);
        }
    });
}

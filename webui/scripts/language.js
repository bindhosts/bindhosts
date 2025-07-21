import { setupDocsMenu } from './docs.js';
import { exec, applyRippleEffect, moduleDirectory } from './util.js';

const languageMenu = document.querySelector('.language-menu');

export let translations = {};
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
        generateLanguageMenu();

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
    let lang;
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
    } catch (error) {
        console.error('Error loading translations:', error);
        lang = 'en';
        translations = baseTranslations;
    }
    applyTranslations();
    setupDocsMenu(lang);
}

/**
 * Apply translations to all elements with data-i18n attributes
 * @returns {void}
 */
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const translation = translations[key];
        if (key === "footer_home" && el.textContent.trim() !== translation.trim()) updateFooterLanguageKey();
        if (translation) {
            if (el.hasAttribute("placeholder")) {
                el.setAttribute("placeholder", translation);
            } else {
                const existingHTML = el.innerHTML;
                const splitHTML = existingHTML.split(/<br>/);
                if (splitHTML.length > 1) {
                    el.innerHTML = `${translation}<br>${splitHTML.slice(1).join('<br>')}`;
                } else {
                    el.textContent = translation;
                }
            }
        }
    });
}

/**
 * Generate the language menu dynamically
 * Refer available-lang.json in ./locales for list of languages
 * @returns {Promise<void>}
 */
async function generateLanguageMenu() {
    if (!languageMenu) return;
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
}

/**
 * Directly write translatation key into html file
 * Optimize for better ui experience
 * @returns {void}
 */
function updateFooterLanguageKey() {
    try {
        // Function to escape / and & for use in sed
        const escapeForSed = (text) => text.replace(/[\/&]/g, '\\$&');
        const homeText = escapeForSed(translations.footer_home);
        const hostsText = escapeForSed(translations.footer_hosts);
        const moreText = escapeForSed(translations.footer_more);

        exec(`
            files="${moduleDirectory}/webroot/index.html ${moduleDirectory}/webroot/hosts.html ${moduleDirectory}/webroot/more.html"
            for file in $files; do
                sed -i "s/<span data-i18n=\\"footer.home\\">[^<]*<\\/span>/<span data-i18n=\\"footer.home\\">${homeText}<\\/span>/g" "$file"
                sed -i "s/<span data-i18n=\\"footer.hosts\\">[^<]*<\\/span>/<span data-i18n=\\"footer.hosts\\">${hostsText}<\\/span>/g" "$file"
                sed -i "s/<span data-i18n=\\"footer.more\\">[^<]*<\\/span>/<span data-i18n=\\"footer.more\\">${moreText}<\\/span>/g" "$file"
            done
        `);
    } catch (error) {
        console.error("Error updating translation key in HTML:", error);
    }
}

/**
 * Add memory to the language menu
 * Restore user language if default language is selected
 */
if (languageMenu) {
    languageMenu.addEventListener("click", (e) => {
        if (e.target.classList.contains("language-option")) {
            const lang = e.target.getAttribute("data-lang");
            localStorage.setItem('bindhostsLanguage', lang);
            setTimeout(() => location.reload(), 80);
        }
    });
}

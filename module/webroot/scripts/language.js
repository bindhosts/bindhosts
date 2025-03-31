import { setupDocsMenu } from './docs.js';
import { execCommand, applyRippleEffect, moduleDirectory } from './util.js';

const languageMenu = document.querySelector('.language-menu');

export let translations = {};
let availableLanguages = ['en-US'];

/**
 * Detect user's default language
 * @returns {Promise<string>} - Detected language code
 */
export async function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];

    try {
        // Fetch available languages
        const availableResponse = await fetch('locales/available-lang.json');
        const availableData = await availableResponse.json();
        availableLanguages = availableData.languages;
        generateLanguageMenu();

        // Get preferred language
        const prefered_language_code = localStorage.getItem('bindhostsLanguage');

        // Check if preferred language is valid
        if (prefered_language_code !== 'default' && availableLanguages.includes(prefered_language_code)) {
            return prefered_language_code;
        } else if (availableLanguages.includes(userLang)) {
            return userLang;
        } else if (availableLanguages.includes(langCode)) {
            return langCode;
        } else {
            return 'en-US';
        }
    } catch (error) {
        console.error('Error detecting user language:', error);
        return 'en-US';
    }
}

/**
 * Load translations dynamically based on the selected language
 * @returns {Promise<void>}
 */
export async function loadTranslations() {
    const lang = await detectUserLanguage();
    const response = await fetch(`locales/${lang}.json`);
    translations = await response.json();
    applyTranslations();
    setupDocsMenu(lang);
}

/**
 * Apply translations to all elements with data-i18n attributes
 * @returns {void}
 */
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const keyString = el.getAttribute("data-i18n");
        const translation = keyString.split('.').reduce((acc, key) => acc && acc[key], translations);
        if (keyString === "footer.home" && el.textContent.trim() !== translation.trim()) updateFooterLanguageKey();
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

    const languagePromises = availableLanguages.map(async (lang) => {
        try {
            const response = await fetch(`locales/${lang}.json`);
            const data = await response.json();
            return { lang, name: data.language || lang };
        } catch (error) {
            console.error(`Error fetching language name for ${lang}:`, error);
            return { lang, name: lang };
        }
    });
    const languageData = await Promise.all(languagePromises);
    const sortedLanguages = languageData.sort((a, b) => a.name.localeCompare(b.name));
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
        const homeText = escapeForSed(translations.footer.home);
        const hostsText = escapeForSed(translations.footer.hosts);
        const moreText = escapeForSed(translations.footer.more);

        execCommand(`
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
 * @returns {void}
 */
if (languageMenu) {
    languageMenu.addEventListener("click", (e) => {
        if (e.target.classList.contains("language-option")) {
            const lang = e.target.getAttribute("data-lang");
            localStorage.setItem('bindhostsLanguage', lang);
            location.reload();
        }
    });
}

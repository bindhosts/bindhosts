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

export let lang;
let translations = {};
let baseTranslations = {};
let availableLanguages = ['en'];
let languageNames = {};

/**
 * Get a formatted string based on the language key and optional arguments
 * Supported formats: %s, %d, %f, %x, %1$s, %2$d, etc.
 * @param {string} id - The translation key
 * @param {...any} args - Arguments to format into the string
 * @returns {string} - The formatted translation
 */
export function getString(id, ...args) {
    let translation = translations[id] || (baseTranslations && baseTranslations[id]) || id;
    if (args.length === 0) return translation;

    let argIndex = 0;
    return translation.replace(/%(?:(\d+)\$)?([%sdfx])/g, (match, index, type) => {
        if (type === '%') return '%';
        if (index) {
            const i = parseInt(index) - 1;
            return args[i] !== undefined ? args[i] : match;
        } else {
            return args[argIndex++] !== undefined ? args[argIndex - 1] : match;
        }
    });
}

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
        const value = string.textContent.replace(/\\n/g, '\n');
        translations[name] = value;
    }

    return translations;
}

/**
 * Detect user's default language
 * @returns {Promise<string>} - Detected language code
 */
async function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const langCode = userLang.split('-')[0];

    try {
        // Fetch available languages
        const availableResponse = await fetch('locales/languages.json');
        const availableData = await availableResponse.json();
        availableLanguages = Object.keys(availableData);
        languageNames = availableData;

        // Fetch preferred language
        const prefered_language_code = localStorage.getItem('bindhostsLanguage');

        // Check if preferred language is valid
        if (prefered_language_code !== 'default' && availableLanguages.includes(prefered_language_code)) {
            return prefered_language_code;
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
        const baseResponse = await fetch('./locales/strings/en.xml');
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
        const dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.setAttribute('dir', dir);
        document.querySelectorAll('[flip-icon-in-rtl="true"]').forEach(el => {
            el.style.transform = dir === 'rtl' ? 'scaleX(-1)' : 'scaleX(1)';
        });

        // Generate language menu
        await generateLanguageMenu();
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = baseTranslations;
    }
}

/**
 * Apply translations to all elements with data-i18n attributes
 * @returns {void}
 */
export function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        const translation = getString(key);
        if (translation !== key) {
            if (el.hasAttribute("placeholder")) {
                el.setAttribute("placeholder", translation);
            } else if (el.hasAttribute("label")) {
                el.setAttribute("label", translation);
            } else {
                el.textContent = translation;
            }
        }
    });
}

/**
 * Function to set a language
 * @param {string} language - Target langauge to set
 * @returns {void}
 */
function setLanguage(language) {
    localStorage.setItem('bindhostsLanguage', language);
    window.location.reload();
}

/**
 * Generate the language menu dynamically
 * Refer available-lang.json in ./locales for list of languages
 * @returns {Promise<void>}
 */
async function generateLanguageMenu() {
    const languageForm = document.getElementById('language-form');
    languageForm.innerHTML = '';

    const createOption = (lang, name) => {
        const label = document.createElement('label');
        label.className = 'language-option';
        label.innerHTML = `
            <md-radio name="language" value="${lang}"></md-radio>
            <span>${name}</span>
        `;

        const radio = label.querySelector('md-radio');

        const currentLang = localStorage.getItem('bindhostsLanguage') || 'default';
        if (currentLang === lang) {
            radio.checked = true;
        }

        radio.addEventListener('change', () => {
            if (radio.checked) setLanguage(lang);
        });

        languageForm.appendChild(label);
    };

    createOption('default', getString('system_default'));

    const sortedLanguages = Object.entries(languageNames)
        .map(([lang, name]) => ({ lang, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    sortedLanguages.forEach(({ lang, name }) => {
        createOption(lang, name);
    });

    applyTranslations();
}

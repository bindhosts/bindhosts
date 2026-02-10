import { initializeLogCatcher } from './utils/log_catcher.js';
import { checkMMRL, setupSlideMenu, moduleDirectory } from './utils/util.js';
import { loadTranslations } from './utils/language.js';
import { router } from './route.js';
import { exec } from 'kernelsu-alt';
import { WXEventHandler } from "webuix";
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';
import '@material/web/ripple/ripple.js';
import '@material/web/switch/switch.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/fab/fab.js';

window.wx = new WXEventHandler();

/**
 * Setup navigation
 */
document.querySelectorAll('.bottom-bar-item').forEach(item => {
    const page = item.getAttribute('page');
    item.addEventListener('click', () => router.navigate(page));
});

/**
 * Setup the Rick Roll overlay to appear on April 1st with a 70% chance.
 * Consecutive trigger protection for user experience.
 * Countdown end or clicking on close button or image will redirect to rick roll
 * Double click on black space to exit early
 * @returns {void}
 */
function setupRickRoll() {
    const today = new Date();
    if (today.getMonth() !== 3 || today.getDate() !== 1) return;

    const rickRollOverlay = document.getElementById('rick-roll');
    const rickRollImage = document.querySelector('.rr-image-box');
    const countDown = document.getElementById('rr-coundown');
    const closeRrButton = document.querySelector('.close-rr-btn');
    let redirect = true;

    const lastRickRoll = localStorage.getItem('lastRickRoll');
    const shouldRickRoll = Math.random() < 0.7;

    // Make sure this won't be triggered in a row for user experience
    if (shouldRickRoll && lastRickRoll !== '1') {
        rickRollOverlay.classList.add('show');
        let countdownValue = 5;
        countDown.textContent = countdownValue;
        const countdownInterval = setInterval(() => {
            countdownValue--;
            countDown.textContent = countdownValue;
            if (countdownValue === 0 && redirect) {
                clearInterval(countdownInterval);
                redirectRr();
            }
        }, 1000);

        // Set flag in localStorage to prevent it from happening next time
        localStorage.setItem('lastRickRoll', '1');
    } else {
        localStorage.setItem('lastRickRoll', '0');
    }

    rickRollImage.addEventListener('click', () => redirectRr());
    closeRrButton.addEventListener('click', () => redirectRr());

    rickRollOverlay.addEventListener('dblclick', (e) => {
        if (e.target === rickRollOverlay) {
            rickRollOverlay.classList.remove('show');
            redirect = false;
        }
    });

    function redirectRr() {
        rickRollOverlay.classList.remove('show');
        // bilibili (China) or YouTube
        exec(`
            if pm path tv.danmaku.bili > /dev/null 2>&1; then
                am start -a android.intent.action.VIEW -d "https://b23.tv/Qhk2xvo"
            else
                am start -a android.intent.action.VIEW -d "https://youtu.be/dQw4w9WgXcQ"
            fi
        `);
    }
}

async function setupUserCustomization() {
    // custom css
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'link/PERSISTENT_DIR/.webui_config/custom.css';
    link.onerror = () => {
        console.log('Custom CSS not found, using default styles');
        if (link.parentNode) {
            link.parentNode.removeChild(link);
        }
    };

    document.head.appendChild(link);

    // custom background
    const bgContainer = document.getElementById("custom-bg");
    const bgImage = document.getElementById("custom-bg-img");
    const bgPath = "link/PERSISTENT_DIR/.webui_config/custom_background.";
    const supportedExt = ["webp", "jpg", "png"];

    for (const ext of supportedExt) {
        const fullPath = bgPath + ext;
        const exists = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = fullPath;
        });

        if (exists) {
            bgImage.src = fullPath;
            bgImage.style.display = "block";
            bgContainer.style.display = "flex";
            break;
        }
    }
}

/**
 * Prevents invalid characters in file names
 * @param {HTMLInputElement} input - Input element to process
 * @returns {void}
 */
window.replaceSpaces = function(input) {
    const cursorPosition = input.selectionStart;
    input.value = input.value.replace(/ /g, '_').replace(/[\/\0*?[\]{}|&$`"'\\<>]/g, '');
    input.setSelectionRange(cursorPosition, cursorPosition);
}

wx.on(window, 'back', () => {
    const backBtn = document.querySelector('.back-button');
    const dialog = document.querySelectorAll('md-dialog');

    // Close side menu
    if (backBtn && backBtn.classList.contains('show')) {
        backBtn.click();
        return;
    // Close dialog
    } else if (dialog.length > 0) {
        for (const dlg of dialog) {
            if (dlg.open) {
                dlg.close();
                return;
            }
        }
    }
    // Back to home page
    if (router.currentView !== 'home') {
        router.navigate('home');
    // Close webui
    } else {
        webui.exit();
    }
});

/**
 * Initial load event listener
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', async () => {
    initializeLogCatcher();
    await Promise.all([loadTranslations(), exec(`sh ${moduleDirectory}/bindhosts.sh --setup-link`)]);
    document.querySelectorAll('[unresolved]').forEach(el => el.removeAttribute('unresolved'));
    checkMMRL();
    setupSlideMenu();
    router.navigate('home');
    setupUserCustomization();
    setupRickRoll();
});

// Overwrite default dialog animation
document.querySelectorAll('md-dialog').forEach(dialog => {
    const defaultOpenAnim = dialog.getOpenAnimation;
    const defaultCloseAnim = dialog.getCloseAnimation;

    dialog.getOpenAnimation = () => {
        const defaultAnim = defaultOpenAnim.call(dialog);
        const customAnim = {};
        Object.keys(defaultAnim).forEach(key => customAnim[key] = defaultAnim[key]);

        customAnim.dialog = [
            [
                [{ opacity: 0, transform: 'translateY(50px)' }, { opacity: 1, transform: 'translateY(0)' }],
                { duration: 300, easing: 'ease' }
            ]
        ];
        customAnim.scrim = [
            [
                [{'opacity': 0}, {'opacity': 0.32}],
                {duration: 300, easing: 'linear'},
            ],
        ];
        customAnim.container = [];

        return customAnim;
    };

    dialog.getCloseAnimation = () => {
        const defaultAnim = defaultCloseAnim.call(dialog);
        const customAnim = {};
        Object.keys(defaultAnim).forEach(key => customAnim[key] = defaultAnim[key]);

        customAnim.dialog = [
            [
                [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-50px)' }],
                { duration: 300, easing: 'ease' }
            ]
        ];
        customAnim.scrim = [
            [
                [{'opacity': 0.32}, {'opacity': 0}],
                {duration: 300, easing: 'linear'},
            ],
        ];
        customAnim.container = [];

        return customAnim;
    };
});

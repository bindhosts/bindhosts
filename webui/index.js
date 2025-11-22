import { exec } from 'kernelsu-alt';
import { applyRippleEffect, checkMMRL, setupScrollEvent, setFooterClick } from './utils/util.js';
import { loadTranslations, applyTranslations } from './utils/language.js';
import { WXEventHandler, WebUI, Intent } from "webuix";

window.wx = new WXEventHandler();

let currentContent = '';
let currentModule = null;

const content = document.getElementById('content-container');
const htmlModules = import.meta.glob('./page/*/*.html', { 
    query: '?raw', 
    import: 'default' 
});
const jsModules = import.meta.glob('./page/*/*.js');
const cssModules = import.meta.glob('./page/*/*.css');

/**
 * load html page content and corresponsing js, css
 * @param {string} contentName 
 * @returns {Promise<void>}
 */
async function loadContent(contentName) {
    if (contentName === currentContent) return;
    currentContent = contentName;

    // Cleanup
    setFooterClick(true);
    document.querySelector('.body-content')?.classList.remove('loaded');
    document.querySelector('.back-button').click();
    if (currentModule && currentModule?.destroy) {
        currentModule.destroy();
    }
    await new Promise(resolve => setTimeout(resolve, 50));

    // Update focued button
    document.querySelectorAll('.footer-btn').forEach(btn => {
        const footerBtnIcon = btn.querySelector('.footer-btn-icon');
        const activeIcon = btn.querySelector('.active');
        const inactiveIcon = btn.querySelector('.inactive');
        if (btn.getAttribute('page') === contentName) {
            footerBtnIcon.classList.add('focus');
            footerBtnIcon.classList.add('loaded');
            activeIcon.style.display = 'block';
            inactiveIcon.style.display = 'none';

        } else {
            footerBtnIcon.classList.remove('loaded');
            setTimeout(() => {
                footerBtnIcon.classList.remove('focus');
                activeIcon.style.display = 'none';
                inactiveIcon.style.display = 'block';
            }, 100);
        }
    });

    // Load html
    const htmlPath = `./page/${contentName}/${contentName}.html`;
    if (htmlModules[htmlPath]) {
        const html = await htmlModules[htmlPath]();
        content.innerHTML = html;
    }

    // Load css
    const cssPath = `./page/${contentName}/${contentName}.css`;
    if (cssModules[cssPath]) {
      await cssModules[cssPath]();
    }

    // Load js
    const jsPath = `./page/${contentName}/${contentName}.js`;
    if (jsModules[jsPath]) {
        currentModule = await jsModules[jsPath]();
        currentModule.init();
    }

    // Initialize content
    setFooterClick(false);
    document.querySelector('.body-content').classList.add('loaded');
    setupScrollEvent();
    applyRippleEffect();
    applyTranslations();
}

document.querySelectorAll('.footer-btn').forEach(btn => {
    const page = btn.getAttribute('page');
    btn.addEventListener('click', () => loadContent(page));
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
        openOverlay();
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
            closeOverlay();
            redirect = false;
        }
    });

    function redirectRr() {
        closeOverlay();
        // bilibili (China) or YouTube
        exec(`
            if pm path tv.danmaku.bili > /dev/null 2>&1; then
                am start -a android.intent.action.VIEW -d "https://b23.tv/Qhk2xvo"
            else
                am start -a android.intent.action.VIEW -d "https://youtu.be/dQw4w9WgXcQ"
            fi
        `);
    }

    function openOverlay() {
        rickRollOverlay.style.display = 'flex';
        setTimeout(() => rickRollOverlay.style.opacity = '1', 10);
    }

    function closeOverlay() {
        rickRollOverlay.style.opacity = '0';
        setTimeout(() => rickRollOverlay.style.display = 'none', 200);
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
    const bgPaths = [
        "link/PERSISTENT_DIR/.webui_config/custom_background.webp",
        "link/PERSISTENT_DIR/.webui_config/custom_background.jpg",
        "link/PERSISTENT_DIR/.webui_config/custom_background.png"
    ];

    for (const path of bgPaths) {
        try {
            const response = await fetch(path, { method: "HEAD" });
            if (response.ok) {
                bgImage.src = path;
                bgContainer.style.display = "flex";
                break;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

wx.on(window, 'back', () => {
    const backBtn = document.querySelector('.back-button');
    const overlays = document.querySelectorAll('.overlay');

    // Close side menu
    if (backBtn && backBtn.classList.contains('show')) {
        backBtn.click();
        return;
    // Close overlay
    } else if (overlays.length > 0) {
        for (const overlay of overlays) {
            if (overlay.style.display === 'flex') {
                const closeBtn = overlay.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.click();
                    return;
                }
                break;
            }
        }
    }
    // Back to home page
    if (currentContent !== 'home') {
        document.getElementById('home').click();
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
    checkMMRL();
    loadContent('home');
    loadTranslations();
    setupUserCustomization();
    applyRippleEffect();
    setupRickRoll();
});

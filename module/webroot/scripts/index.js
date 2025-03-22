import { execCommand, showPrompt, applyRippleEffect, checkMMRL, basePath, developerOption, setDeveloperOption, setLearnMore, initialTransition, isRunningOnMMRL, moduleDirectory } from './util.js';
import { loadTranslations } from './language.js';

let clickCount = 0;
let clickTimeout;

/**
 * Load the current mode from mode.sh
 * @returns {Promise<void>}
 */
async function getCurrentMode() {
    const modeElement = document.getElementById('mode-text');
    try {
        const mode = await execCommand(`grep '^operating_mode=' ${moduleDirectory}/mode.sh | cut -d'=' -f2`);
        modeElement.textContent = mode.trim();
    } catch (error) {
        console.error("Failed to read current mode from mode.sh:", error);
        modeElement.textContent = "Error";
    }
}

/**
 * Load the version from module.prop
 * @returns {Promise<void>}
 */
async function loadVersionFromModuleProp() {
    const versionElement = document.getElementById('version-text');
    try {
        const version = await execCommand(`grep '^version=' ${moduleDirectory}/module.prop | cut -d'=' -f2`);
        versionElement.textContent = version.trim();
    } catch (error) {
        console.error("Failed to read version from module.prop:", error);
        versionElement.textContent = "Error";
    }
}

/**
 * Get the status from module.prop
 * @returns {Promise<void>}
 */
async function updateStatusFromModuleProp() {
    try {
        const description = await execCommand(`grep '^description=' ${moduleDirectory}/module.prop | sed 's/description=status: //'`);
        if (!description.trim()) throw new Error("Description is empty");
        updateStatus(description.trim());
    } catch (error) {
        console.error("Failed to read description from module.prop:", error);
        updateStatus("Error reading description from module.prop");
        if (typeof ksu !== 'undefined' && ksu.mmrl) {
            const permissionOverlay = document.getElementById("mmrl-permission-overlay");
            permissionOverlay.style.display = 'flex';
            permissionOverlay.style.opacity = 1;
        }
    }
}

/**
 * Update the status text dynamically in the UI
 * @param {string} statusText - Status text to display
 * @returns {void}
 */
function updateStatus(statusText) {
    const statusElement = document.getElementById('status-text');
    statusElement.innerHTML = statusText.replace(/\n/g, '<br>');
}

/**
 * Developer option entrance, status box click event
 * Click 5 times in 2 seconds to enable developer option
 */
document.getElementById("status-box").addEventListener("click", async (event) => {  
    clickCount++;
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
        clickCount = 0;
    }, 2000);
    if (clickCount === 5) {
        clickCount = 0;
        await checkDevOption();
        if (!developerOption) {
            setDeveloperOption(true);
            showPrompt("global.dev_opt", true);
        } else {
            showPrompt("global.dev_opt_true", true);
        }
    }
});

/**
 * Check if developer option is enabled
 * Allow open mode menu if developer option is enabled
 * @returns {Promise<void>}
 */
async function checkDevOption() {
    try {
        const fileExists = await execCommand(`[ -f ${basePath}/mode_override.sh ] && echo 'true' || echo 'false'`);
        if (fileExists.trim() === "true") {
            setDeveloperOption(true);
        }
    } catch (error) {
        console.error("Error checking developer option:", error);
    }
}


// Open mode menu if developer option is enabled
document.getElementById("mode-btn").addEventListener("click", async () => {
    await checkDevOption();
    const modeMenu = document.getElementById("mode-menu");
    const overlayContent = document.querySelector(".overlay-content");
    if (developerOption) {
        modeMenu.style.display = "flex";
        setTimeout(() => {
            modeMenu.style.opacity = "1";
            setLearnMore(true);
        }, 10);
        document.querySelector(".close-btn").addEventListener("click", closeOverlay);
        document.getElementById("learn-btn").addEventListener("click", closeOverlay);
        modeMenu.addEventListener("click", (event) => {
            if(!overlayContent.contains(event.target)) closeOverlay();
        });
    }

    /**
     * Close overlay
     * @returns {void}
     */
    function closeOverlay() {
        modeMenu.style.opacity = "0";
        setTimeout(() => {
            modeMenu.style.display = "none";
        }, 200);
        setLearnMore(false);
    }

    /**
     * Save mode option
     * @param {string} mode - Mode to save
     * @returns {Promise<void>}
     */
    async function saveModeSelection(mode) {
        try {
            if (mode === "reset") {
                await execCommand(`rm -f ${basePath}/mode_override.sh`);
                closeOverlay();
                setLearnMore(false);
            } else {
                await execCommand(`echo "mode=${mode}" > ${basePath}/mode_override.sh`);
            }
            showPrompt("global.reboot", true, 4000);
            await updateModeSelection();
        } catch (error) {
            console.error("Error saving mode selection:", error);
        }
    }

    /**
     * Update radio button state based on current mode
     * @returns {Promise<void>}
     */
    async function updateModeSelection() {
        try {
            const fileExists = await execCommand(`[ -f ${basePath}/mode_override.sh ] && echo 'true' || echo 'false'`);
            if (fileExists.trim() === "false") {
                document.querySelectorAll("#mode-options input").forEach((input) => {
                    input.checked = false;
                });
                return;
            }
            const content = await execCommand(`cat ${basePath}/mode_override.sh`);
            const currentMode = content.trim().match(/mode=(\d+)/)?.[1] || null;
            document.querySelectorAll("#mode-options input").forEach((input) => {
                input.checked = input.value === currentMode;
            });
        } catch (error) {
            console.error("Error updating mode selection:", error);
        }
    }

    // Attach event listeners for mode options
    document.getElementById("mode-options").addEventListener("change", (event) => {
        const selectedMode = event.target.value;
        saveModeSelection(selectedMode);
    });

    // Attach event listener for reset button
    document.getElementById("reset-mode").addEventListener("click", () => saveModeSelection("reset"));
});

/**
 * Query box
 * Load hosts dynamically to avoid long loading time due to big hosts file
 * Load 50 each time, and load more when scroll to the bottom
 */
let hostLines = [], originalHostLines = [], currentIndex = 0, initialHeight = 0;
const batchSize = 50;
const hostList = document.querySelector('.host-list-item');

/**
 * Get hosts from hosts.txt and display them in the UI
 * @returns {Promise<void>}
 */
async function getHosts() {
    hostList.innerHTML = '';

    try {
        const response = await fetch('hosts.txt');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        let hostsText = await response.text();

        hostLines = hostsText
            .trim()
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#')) // Remove empty/comment lines
            .map(line => line.trim().split(/\s+/))
            .filter(parts => parts.length >= 2); // Ensure valid entries

        // Store the original data
        originalHostLines = [...hostLines];

        currentIndex = 0;
        loadMoreHosts(() => {
            initialHeight = hostList.offsetHeight;
        });

        // Add scroll event listener to reset horizontal scroll
        hostList.addEventListener('scroll', () => {
            const rows = document.querySelectorAll('.host-list-row');
            rows.forEach(row => {
                row.scrollTo({ left: 0, behavior: 'smooth' });
            });

            // Existing scroll to load more functionality
            const scrollTop = hostList.scrollTop;
            const hostListHeight = hostList.clientHeight;
            const scrollHeight = hostList.scrollHeight;
        
            if (scrollTop + hostListHeight >= scrollHeight - initialHeight) {
                loadMoreHosts();
            }
        });
    } catch (error) {
        linkHosts();
        console.error("Error getting hosts:", error);
    }
}

/**
 * Link hosts to the webroot if not found
 * @returns {Promise<void>}
 */
async function linkHosts() {
    try {
        // backend required due to different target host file
        await execCommand(`sh ${moduleDirectory}/bindhosts.sh --link-hosts`);
        await getHosts();
    } catch (error) {
        console.error("Error linking hosts:", error);
    }
}

/**
 * Load more hosts on scroll to the bottom
 * @param {Function} [callback] - Optional callback function to execute after loading more hosts
 * @returns {void}
 */
function loadMoreHosts(callback) {
    for (let i = 0; i < batchSize && currentIndex < hostLines.length; i++, currentIndex++) {
        const [hostIp, ...domains] = hostLines[currentIndex];
        const dataType = hostIp === "0.0.0.0" ? "block" : "custom";
        const hostItem = document.createElement('div');
        hostItem.classList.add('host-list-row');
        hostItem.setAttribute('data-type', dataType);

        // Add remove button if dataType is not 'custom'
        hostItem.innerHTML = `
            <div class="host-ip">${hostIp}</div>
            <div class="host-domain">${domains.join(' ')}</div>
            ${dataType !== 'custom' ? `
            <button class="remove-btn">
                <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg>
            </button>
            ` : ''}
        `;

        // Add event listener to remove button if it exists
        if (dataType !== 'custom') {
            hostItem.querySelector('.remove-btn').addEventListener('click', (event) => handleRemove(event, domains));
        }
        hostItem.addEventListener('click', () => {
            hostItem.scrollTo({ left: hostItem.scrollWidth, behavior: 'smooth' });
        });
        hostList.appendChild(hostItem);
    }

    if (callback) requestAnimationFrame(callback);
}

/**
 * Handle remove host
 * @param {Event} event - Click event
 * @param {string[]} domains - Domains to remove
 * @returns {Promise<void>}
 */
async function handleRemove(event, domains) {
    try {
        await execCommand(`sh ${moduleDirectory}/bindhosts.sh --whitelist ${domains.join(' ')}`);
        // Find and remove the element directly
        const hostItem = event.target.closest('.host-list-row');
        if (hostItem) {
            hostList.removeChild(hostItem);
        }
        showPrompt("query.remove_prompt", true, 2000, undefined, domains.join(' '));
    } catch (error) {
        console.error("Error removing host:", error);
        showPrompt("query.remove_error", false, 2000, undefined, domains.join(' '));
    }
}

/**
 * Setup search functionality
 * @returns {void}
 */
function setupQueryInput() {
    const inputBox = document.getElementById('query-input');
    const searchBtn = document.querySelector('.search-btn');
    const clearBtn = document.querySelector('.clear-btn');

    // Search functionality
    searchBtn.addEventListener('click', (event) => {
        const query = inputBox.value.trim().toLowerCase();
        if (!query) getHosts();

        // Always search from the original data
        const filteredHosts = originalHostLines.filter(([hostIp, ...domains]) => {
            return hostIp.toLowerCase().includes(query) || 
                domains.some(domain => domain.toLowerCase().includes(query));
        });

        // Clear current list
        hostList.scrollTo(0, 0);
        hostList.innerHTML = '';
        currentIndex = 0;
        hostLines = filteredHosts;
        loadMoreHosts();
    });

    // Search on enter
    inputBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') searchBtn.click();
    });

    // Update clear button visibility on any input change
    inputBox.addEventListener('input', () => {
        if (inputBox.value.length > 0) clearBtn.style.display = 'flex';
        else clearBtn.style.display = 'none';
    });

    // Clear search functionality
    clearBtn.addEventListener('click', async () => {
        inputBox.value = '';
        clearBtn.style.display = 'none';
        await getHosts();
    });
}

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

    async function redirectRr() {
        closeOverlay();
        try {
            // bilibili (China) or YouTube
            await execCommand(`
                if pm path tv.danmaku.bili > /dev/null 2>&1; then
                    am start -a android.intent.action.VIEW -d "https://b23.tv/Qhk2xvo"
                else
                    am start -a android.intent.action.VIEW -d "https://youtu.be/dQw4w9WgXcQ"
                fi
            `);
        } catch (error) {
            console.error("Error redirect link:", error);
        }
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

/**
 * Initial load event listener
 * @returns {void}
 */
document.addEventListener('DOMContentLoaded', async () => {
    checkMMRL();
    initialTransition();
    loadTranslations();
    await getCurrentMode();
    await updateStatusFromModuleProp();
    await loadVersionFromModuleProp();
    await checkDevOption();
    await getHosts();
    setupQueryInput();
    applyRippleEffect();
    setupRickRoll();
});

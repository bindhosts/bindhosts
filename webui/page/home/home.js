import { exec } from 'kernelsu-alt';
import { showPrompt, reboot, basePath, moduleDirectory, setDeveloperOption, developerOption, fetchText, updateUIVisibility } from '../../utils/util.js';
import { setupDocsMenu } from '../../utils/docs.js';
import { getString } from '../../utils/language.js';
import modes from './modes.json';

let clickCount = 0, clickTimeout = 0;

/**
 * Update the status elements with data from specified files.
 * If the file is not found, it attempts to set up the link and retries.
 * @returns {Promise<void>}
 */
function updateStatus() {
    const status = [
        { element: 'status-text', key: 'description', file: 'module.prop' },
        { element: 'version-text', key: 'version', file: 'module.prop' },
        { element: 'mode-btn', key: 'mode', file: 'mode.sh' },
    ]

    const fetchStatus = async (item) => {
        try {
            const data = await fetchText("link/MODDIR/" + item.file, `${moduleDirectory}/${item.file}`);
            let value = data.match(new RegExp(`${item.key}=(.*)`))[1].replace('status: ', '');
            if (item.element === 'mode-btn') {
                value = getString("mode_button", value);
            }
            document.getElementById(item.element).textContent = value;
        } catch (error) {
            console.error(`Error fetching status for ${item.element}:`, error);
            document.getElementById(item.element).textContent = 'Unknown';
        }
    };

    status.reduce(async (promise, item) => {
        await promise;
        return await fetchStatus(item);
    }, Promise.resolve()).catch(error => {
        console.error("Error updating status:", error);
    });
}

/**
 * Developer option entrance, status box click event
 * Click 5 times in 2 seconds to enable developer option
 * @returns {void}
 */
function setupDevOtp() {
    const statusBox = document.getElementById("status-box");
    statusBox.onclick = async () => {
        clickCount++;
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
            clickCount = 0;
        }, 2000);
        if (clickCount === 5) {
            clickCount = 0;
            if (!developerOption) {
                setDeveloperOption(true);
                showPrompt(getString('global_dev_opt'));
            } else {
                showPrompt(getString('global_dev_opt_true'));
            }
        }
    };
}

/**
 * Check if developer option is enabled
 * Allow open mode menu if developer option is enabled
 * @returns {Promise<void>}
 */
async function checkDevOption() {
    if (developerOption) return;
    try {
        await fetchText('link/PERSISTENT_DIR/mode_override.sh', `${basePath}/mode_override.sh`);
        setDeveloperOption(true);
    } catch {
        setDeveloperOption(false);
    }
}

/**
 * Update radio button state based on current mode
 * @returns {Promise<void>}
 */
async function updateModeSelection() {
    let currentMode;
    const result = await exec(`cat ${basePath}/mode_override.sh`);
    if (result.errno === 0) {
        currentMode = result.stdout.trim().match(/mode=(\d+)/)?.[1] || null;
    } else {
        currentMode = null;
    }
    document.querySelectorAll("#mode-options md-radio").forEach((radio) => {
        radio.checked = radio.value === currentMode;
    });
}

/**
 * Save mode option
 * @param {string} mode - Mode to save
 * @returns {Promise<void>}
 */
async function saveModeSelection(mode) {
    let command;
    if (mode === "reset") {
        command = `rm -f ${basePath}/mode_override.sh`;
    } else {
        command = `echo "mode=${mode}" > ${basePath}/mode_override.sh`;
    }
    const result = await exec(command);
    if (result.errno === 0) {
        document.getElementById("mode-menu").close();
        showPrompt(getString('global_reboot_now'), true, 5000, getString('global_reboot'), reboot);
        await updateModeSelection();
    } else {
        console.error("Error saving mode selection:", result.stderr);
    }
}

// Open mode menu if developer option is enabled
function setupModeBtn() {
    const modeBtn = document.getElementById("mode-btn");
    const modeMenu = document.getElementById("mode-menu");
    const modeOptions = document.getElementById("mode-options");

    modes.forEach(mode => {
        const label = document.createElement('label');
        label.className = 'custom-radio';
        label.innerHTML = `
            <md-radio name="mode" value="${mode.value}"></md-radio>
            <div class="radio-label">
                <div class="radio-label-title">
                    <span>${getString("mode_button", mode.value)}</span>
                </div>
                <small>${mode.description}</small>
            </div>
        `;
        modeOptions.appendChild(label);
    });

    modeOptions.addEventListener('change', (event) => {
        saveModeSelection(event.target.value);
    });

    document.getElementById("reset-mode").onclick = () => saveModeSelection("reset");

    modeBtn.addEventListener('click', (e) => {
        if (!developerOption) return;
        e.stopImmediatePropagation();
        modeMenu.show();
        updateModeSelection();
    });
}

/**
 * Query box
 * Load hosts dynamically to avoid long loading time due to big hosts file
 * Load 30 each time, and load more when scroll to the bottom
 */
let hostLines = [], originalHostLines = [], currentIndex = 0, initialHeight = 0;
const batchSize = 30;

/**
 * Get hosts from hosts.txt and display them in the UI
 * @returns {Promise<void>}
 */
async function getHosts() {
    const hostList = document.querySelector('.host-list-item');
    hostList.innerHTML = '';

    const response = await fetch('link/hosts.txt');
    if (!response.ok) {
        hostList.innerHTML = getString('global_unsupported');
        return;
    }
    const hostsText = await response.text();

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

    // Scroll down to load more
    hostList.onscroll = () => {
        // Reset position
        document.querySelectorAll('.scrollable-list').forEach(el => {
            el.scrollTo({ left: 0, behavior: 'smooth' });
        });

        // Existing scroll to load more functionality
        const scrollTop = hostList.scrollTop;
        const hostListHeight = hostList.clientHeight;
        const scrollHeight = hostList.scrollHeight;

        if (scrollTop + hostListHeight >= scrollHeight - initialHeight) {
            loadMoreHosts();
        }
    };
}

/**
 * Load more hosts on scroll to the bottom
 * @param {Function} [callback] - Optional callback function to execute after loading more hosts
 * @returns {void}
 */
function loadMoreHosts(callback) {
    const hostList = document.querySelector('.host-list-item');
    for (let i = 0; i < batchSize && currentIndex < hostLines.length; i++, currentIndex++) {
        const [hostIp, ...domains] = hostLines[currentIndex];
        const dataType = hostIp === "0.0.0.0" ? "block" : "custom";
        const hostItem = document.createElement('div');
        hostItem.className = 'scrollable-list';
        hostItem.setAttribute('data-type', dataType);

        // Add remove button if dataType is not 'custom'
        hostItem.innerHTML = `
            <div class="host-list-row">
                <div class="host-ip">${hostIp}</div>
                <div class="host-domain">${domains.join(' ')}</div>
            </div>
            ${dataType !== 'custom' ? `
            <md-filled-icon-button class="remove-btn">
                <md-icon><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg></md-icon>
            </md-filled-icon-button>
            ` : ''}
        `;

        // Add event listener to remove button if it exists
        if (dataType !== 'custom') {
            const removeBtn = hostItem.querySelector('.remove-btn');
            removeBtn.onclick = (e) => handleRemove(e, domains);
        }
        hostItem.onclick = () => {
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            hostItem.scrollTo({
                left: isRTL ? -hostItem.scrollWidth : hostItem.scrollWidth,
                behavior: 'smooth'
            });
        };
        hostList.appendChild(hostItem);
        hostList.appendChild(document.createElement("md-divider"));
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
    const hostList = document.querySelector('.host-list-item');
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --whitelist ${domains.join(' ')}`);
    if (result.errno === 0) {
        // Find and remove the element directly
        const hostItem = event.target.closest('.host-list-row');
        if (hostItem) {
            hostList.removeChild(hostItem);
        }
        showPrompt(getString('query_remove_prompt', domains.join(' ')));
    } else {
        console.error("Error removing host:", result.stderr);
        showPrompt(getString('query_remove_error', domains.join(' ')), false);
    }
}

/**
 * Setup search functionality
 * @returns {void}
 */
function setupQueryInput() {
    getHosts();
    const hostList = document.querySelector('.host-list-item');
    const inputBox = document.getElementById('query-input');
    const searchBtn = document.querySelector('.search-btn');
    const clearBtn = document.querySelector('.clear-btn');

    // Search functionality
    searchBtn.onclick = () => {
        const query = inputBox.value.trim().toLowerCase();
        if (!query) getHosts();

        // Always search from the original data
        const filteredHosts = originalHostLines.filter(([hostIp, ...domains]) => {
            return hostIp.toLowerCase().includes(query) || domains.some(domain => domain.toLowerCase().includes(query));
        });

        // Clear current list
        hostList.scrollTo(0, 0);
        hostList.innerHTML = '';
        currentIndex = 0;
        hostLines = filteredHosts;
        loadMoreHosts();
    };

    // Search on enter
    inputBox.onkeypress = (event) => {
        if (event.key === 'Enter') searchBtn.click();
    };

    // Update clear button visibility on any input change
    inputBox.oninput = () => {
        clearBtn.style.display = inputBox.value.length > 0 ? 'flex' : 'none';
    };

    // Clear search functionality
    clearBtn.onclick = async () => {
        inputBox.value = '';
        clearBtn.style.display = 'none';
        await getHosts();
    };
}

// Lifecycle: Initial mount to DOM
export function mount() {
    setupDevOtp();
    setupModeBtn();
    setupQueryInput();
    setupDocsMenu();
}

// Lifecycle: Each time page becomes visible
export function onShow() {
    updateUIVisibility();
    document.getElementById('mode-btn').classList.add('show');
    updateStatus();
    getHosts();
    checkDevOption();
}

// Lifecycle: Each time page is hidden
export function onHide() {
    document.getElementById('mode-btn').classList.remove('show');
    document.querySelectorAll('.fab-container').forEach(c => c.classList.remove('show', 'inTerminal'));
}

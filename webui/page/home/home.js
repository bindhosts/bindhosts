import { exec } from '../../utils/kernelsu.js';
import { showPrompt, basePath, developerOption, setDeveloperOption, setLearnMore, moduleDirectory, createEventManager } from '../../utils/util.js';
import { setupDocsMenu } from '../../utils/docs.js';

let em = createEventManager();

let clickCount = 0, clickTimeout = 0;

/**
 * Update the status elements with data from specified files.
 * If the file is not found, it attempts to set up the link and retries.
 * @returns {Promise<void>}
 */
function updateStatus() {
    const status = [
        { element : 'status-text', key : 'description', file: 'link/MODDIR/module.prop' },
        { element : 'version-text', key : 'version', file: 'link/MODDIR/module.prop' },
        { element : 'mode-text', key : 'mode', file: 'link/MODDIR/mode.sh' },
    ]

    const fetchStatus = async (item) => {
        try {
            const response = await fetch(item.file);
            if (!response.ok) throw new Error(`File not found: ${item.file}`);
            const data = await response.text();
            const value = data.match(new RegExp(`${item.key}=(.*)`))[1].replace('status: ', '');
            document.getElementById(item.element).textContent = value;
        } catch (error) {
            setupLink();
            updateStatus();
            throw error;
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
    em.on(statusBox, 'click', async () => {
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
                showPrompt("global_dev_opt", true);
            } else {
                showPrompt("global_dev_opt_true", true);
            }
        }
    });
}

let setupModeMenu = false

/**
 * Check if developer option is enabled
 * Allow open mode menu if developer option is enabled
 * @returns {Promise<void>}
 */
async function checkDevOption() {
    setupDevOtp();
    const response = await fetch('link/PERSISTENT_DIR/mode_override.sh');
    setDeveloperOption(response.ok ? true : false);
}

// Open mode menu if developer option is enabled
function setupModeBtn() {
    const modeBtn = document.getElementById("mode-btn");
    const modeMenu = document.getElementById("mode-menu");
    const overlayContent = document.querySelector(".overlay-content");

    em.on(modeBtn, 'click', async () => {
        if (developerOption) {
            modeMenu.style.display = "flex";
            setTimeout(() => {
                modeMenu.style.opacity = "1";
                setLearnMore(true);
            }, 10);
        }

        const closeOverlay = () => {
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
            let command;
            if (mode === "reset") {
                command = `rm -f ${basePath}/mode_override.sh`;
            } else {
                command = `echo "mode=${mode}" > ${basePath}/mode_override.sh`;
            }
            const result = await exec(command);
            if (result.errno === 0) {
                if (mode === "reset") {
                    closeOverlay();
                    setLearnMore(false);
                }
                showPrompt("global_reboot", true, 4000);
                await updateModeSelection();
            } else {
                console.error("Error saving mode selection:", result.stderr);
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
                currentMode = result.trim().match(/mode=(\d+)/)?.[1] || null;
            } else {
                currentMode = null;
            }
            document.querySelectorAll("#mode-options input").forEach((input) => {
                input.checked = input.value === currentMode;
            });
        }

        if (!setupModeMenu) {
            setupModeMenu = true;
            modeMenu.querySelector(".close-btn").onclick = closeOverlay;
            em.on(document.getElementById("learn-btn"), 'click', () => closeOverlay());
            em.on(modeMenu, 'click', (event) => {
                if(!overlayContent.contains(event.target)) closeOverlay();
            });
            // Attach event listeners for mode options
            const modeOption = document.getElementById("mode-options");
            em.on(modeOption, 'change', (event) => {
                const selectedMode = event.target.value;
                saveModeSelection(selectedMode);
            });
            // Attach event listener for reset button
            document.getElementById("reset-mode").onclick = () => saveModeSelection("reset");
        }
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

    try {
        const response = await fetch('link/hosts.txt');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
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
        em.on(hostList, 'scroll', () => {
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
        });
    } catch (error) {
        setupLink();
        await getHosts();
    }
}

/**
 * Link necessary file to the webroot if not found
 * @returns {void}
 */
function setupLink() {
    // backend required due to different target host file
    exec(`sh ${moduleDirectory}/bindhosts.sh --setup-link`);
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
            <button class="remove-btn ripple-element">
                <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg>
            </button>
            ` : ''}
        `;

        // Add event listener to remove button if it exists
        if (dataType !== 'custom') {
            const removeBtn = hostItem.querySelector('.remove-btn');
            em.on(removeBtn, 'click', (e) => handleRemove(e, domains));
        }
        em.on(hostItem, 'click', () => {
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';    
            hostItem.scrollTo({ 
                left: isRTL ? -hostItem.scrollWidth : hostItem.scrollWidth,
                behavior: 'smooth'
            });
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
    const hostList = document.querySelector('.host-list-item');
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --whitelist ${domains.join(' ')}`);
    if (result.errno === 0) {
        // Find and remove the element directly
        const hostItem = event.target.closest('.host-list-row');
        if (hostItem) {
            hostList.removeChild(hostItem);
        }
        showPrompt("query_remove_prompt", true, 2000, undefined, domains.join(' '));
    } else {
        console.error("Error removing host:", result.stderr);
        showPrompt("query_remove_error", false, 2000, undefined, domains.join(' '));
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
    em.on(searchBtn, 'click', () => {
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
    em.on(inputBox, 'keypress', (event) => {
        if (event.key === 'Enter') searchBtn.click();
    })

    // Update clear button visibility on any input change
    em.on(inputBox, 'input', () => {
        clearBtn.style.display = inputBox.value.length > 0 ? 'flex' : 'none';
    })

    // Clear search functionality
    em.on(clearBtn, 'click', async () => {
        inputBox.value = '';
        clearBtn.style.display = 'none';
        await getHosts();
    })
}

// init content
export function init() {
    document.getElementById('title').textContent = 'bindhosts ';
    document.getElementById('mode-btn').classList.add('show');
    updateStatus();
    checkDevOption();
    setupModeBtn();
    setupQueryInput();
    setupDocsMenu();
}

// exit cleanup
export function destroy() {
    clickCount = 0, clickTimeout = 0, setupModeMenu = false;
    hostLines = [], originalHostLines = [], currentIndex = 0, initialHeight = 0;

    document.getElementById('version-text').textContent = '';
    document.getElementById('mode-btn').classList.remove('show');

    em?.removeAll();
}

import { exec, spawn } from 'kernelsu-alt';
import { showPrompt, reboot, applyRippleEffect, basePath, moduleDirectory, linkRedirect, filePaths, setupSwipeToClose } from '../../utils/util.js';
import { getString, generateLanguageMenu } from '../../utils/language.js';
import { FileSelector } from '../../utils/file_selector.js';
import { addCopyToClipboardListeners, setupDocsMenu } from '../../utils/docs.js';
let isDownloading = false;

/**
 * Check if user has installed bindhosts app
 * Show QS tile option when user has not installed bindhosts app
 * Click to install bindhosts app
 * @returns {void}
 */
function checkBindhostsApp() {
    const tilesContainer = document.getElementById('tiles-container');

    exec("pm path me.itejo443.bindhosts")
        .then(({ errno }) => {
            if (errno !== 0) tilesContainer.style.display = "flex";
        });
}

/**
 * Install the bindhosts app
 * @returns {void}
 * @see controlPanelEventlistener - Calling this function
 */
function installBindhostsApp() {
    if (isDownloading) return;
    isDownloading = true;
    showPrompt(getString('control_panel_installing'), true, 10000);
    const tilesContainer = document.getElementById('tiles-container');
    const output = spawn("sh", [`${moduleDirectory}/bindhosts-app.sh`], { env: { WEBUI_QUIET: "true" }});
    output.stdout.on('data', (data) => {
        if (data.includes("[+]")) {
            showPrompt(getString('control_panel_installed'), true, 5000);
            tilesContainer.style.display = "none";
        } else if (data.includes("[x] Failed to download")) {
            showPrompt(getString('control_panel_download_fail'), false);
        } else if (data.includes("[*]")) {
            showPrompt(getString('control_panel_install_fail'), false, 5000);
        }
    });
    output.on('exit', () => {
        isDownloading = false;
    });
}

/**
 * Check module update status
 * Event listener for module update toggle
 * @returns {void}
 */
function checkUpdateStatus() {
    const toggleVersion = document.getElementById('toggle-version');
    fetch(`link/MODDIR/module.prop`)
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            toggleVersion.checked = lines.some(line => line.trim().startsWith("updateJson="));
        })
}

/**
 * Switch module update status and refresh toggle
 * @returns {Promise<void>}
 * @see controlPanelEventlistener - Calling this function
 */
async function toggleModuleUpdate() {
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --toggle-updatejson`);
    if (result.errno === 0) {
        const lines = result.stdout.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt(getString('control_panel_update_true'));
            } else if (line.includes("[x]")) {
                showPrompt(getString('control_panel_update_false'), false);
            }
        });
        checkUpdateStatus();
    } else {
        console.error("Failed to toggle update:", result.stderr);
    }
}

/**
 * Display action redirect switch when running in Magisk
 * Action redirect WebUI toggle
 * @returns {void}
 */
function checkMagisk() {
    exec(`grep -q Magisk ${basePath}/root_manager.sh`)
        .then(({ errno }) => {
            if (errno === 0) {
                document.getElementById('action-redirect-container').style.display = "flex";
                checkRedirectStatus();
            }
        });
}

/**
 * Toggle the action redirect WebUI setting
 * @returns {Promise<void>}
 * @see controlPanelEventlistener - Calling this function
 */
async function toggleActionRedirectWebui() {
    const actionRedirectStatus = document.getElementById('action-redirect');
    const result = await exec(`
        echo "magisk_webui_redirect=${actionRedirectStatus.checked ? 0 : 1}" > ${basePath}/webui_setting.sh
        chmod 755 ${basePath}/webui_setting.sh || true
    `);
    if (result.errno === 0) {
        if (actionRedirectStatus.checked) {
            showPrompt(getString('control_panel_action_prompt_false'), false);
        } else {
            showPrompt(getString('control_panel_action_prompt_true'));
        }
        checkRedirectStatus();
    } else {
        console.error("Failed to execute change status", result.stderr);
    }
}

/**
 * Check action redirect status
 * @returns {void}
 */
function checkRedirectStatus() {
    const actionRedirectStatus = document.getElementById('action-redirect');

    fetch(`link/PERSISTENT_DIR/webui_setting.sh`)
        .then(response => {
            if (!response.ok) throw new Error('File not found');
            return response.text();
        })
        .then(data => {
            const redirectStatus = data.match(/magisk_webui_redirect=(\d)/)[1];
            actionRedirectStatus.checked = redirectStatus === "1";
        })
        .catch(error => {
            actionRedirectStatus.checked = true;
        });
}

/**
 * Check cron status
 * Event listener for cron toggle
 * @returns {void}
 */
function checkCronStatus() {
    const cronToggle = document.getElementById('toggle-cron');

    // Hide cron toggle when using AdAway
    fetch('link/MODDIR/module.prop')
        .then(response => response.text())
        .then(text => {
            if (text.includes('AdAway')) {
                document.getElementById('cron-toggle-container').style.display = 'none';
            } else {
                exec(`grep -q bindhosts.sh ${basePath}/crontabs/root`)
                    .then(({ errno }) => {
                        cronToggle.checked = errno === 0 ? true : false;
                    });
            }
        })
        .catch(error => {
            console.error('Error checking cron status:', error);
        });
}

/**
 * Toggle cron job status
 * @returns {Promise<void>}
 * @see controlPanelEventlistener - Calling this function
 */
async function toggleCron() {
    const cronToggle = document.getElementById('toggle-cron');
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --${cronToggle.checked ? "disable" : "enable"}-cron`);
    if (result.errno === 0) {
        const lines = result.stdout.split("\n");
        lines.forEach(line => {
            if (line.includes("[+]")) {
                showPrompt(getString('control_panel_cron_true'));
            } else if (line.includes("[x]")) {
                showPrompt(getString('control_panel_cron_false'), false);
            }
        });
        checkCronStatus();
    } else {
        console.error("Failed to toggle cron", result.stderr);
    }
}

/**
 * Update to latest canary version
 * @returns {void}
 * @see controlPanelEventlistener - Calling this function
 */
function canaryUpdate() {
    if (isDownloading) return;
    isDownloading = true;
    const result = spawn('sh', [`${moduleDirectory}/bindhosts.sh`, '--install-canary'], { env: { KSU_WEBUI: "true", WEBUI_QUIET: "true" }});
    result.stdout.on('data', (data) => {
        if (data.includes('[+]')) {
            showPrompt(data, true, 15000);
        } else if (data.includes('[x]') || data.includes('[!]')) {
            showPrompt(data, false, 3000);
        }
    });
    result.on('exit', (code) => {
        isDownloading = false;
        if (code === 0) {
            showPrompt(getString('more_support_update_success'), true, 4000, getString('global_reboot'), reboot);
        } else {
            showPrompt(getString('more_support_update_fail'), false);
        }
    });
}

/**
 * Hot update tranlslation bundle
 * @returns {void}
 * @see controlPanelEventlistener - Calling this function
 */
function localesUpdate() {
    if (isDownloading) return;
    isDownloading = true;

    showPrompt(getString('more_support_checking_update'), true, 10000);
    fetch("https://raw.githubusercontent.com/bindhosts/bindhosts/bot/locales_version")
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .catch(async () => {
            return fetch("https://hub.gitmirror.com/raw.githubusercontent.com/bindhosts/bindhosts/bot/locales_version")
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response.text()
                });
        })
        .then(async (version) => {
            const remote_version = version.trim();
            const local_version = await fetch('locales/version').then(response => response.text()).then(text => text.trim());

            if (Number(remote_version) <= Number(local_version)) {
                showPrompt(getString('more_support_no_update'), true);
                isDownloading = false;
            } else {
                const result = spawn('sh', [`${moduleDirectory}/bindhosts.sh`, '--update-locales'], { env: { WEBUI_QUIET: "true" }});
                result.on('exit', (code) => {
                    isDownloading = false;
                    if (code === 0) {
                        window.location.reload();
                    } else {
                        throw new Error(`Update failed with code: ${code}`);
                    }
                });
            }
        })
        .catch(error => {
            showPrompt(getString('more_support_update_locales_failed'), false);
            isDownloading = false;
        });
}

let languageMenuListener = false;
/**
 * Open language menu overlay
 * @returns {void}
 * @see controlPanelEventlistener - Calling this function
 */
function openLanguageMenu() {
    const languageOverlay = document.getElementById('language-overlay');

    // Open menu
    languageOverlay.style.display = 'flex';
    setTimeout(() => {
        languageOverlay.style.opacity = '1';
    }, 10);

    const closeOverlay = () => {
        languageOverlay.style.opacity = '0';
        setTimeout(() => {
            languageOverlay.style.display = 'none';
        }, 200);
    };

    if (!languageMenuListener) {
        languageMenuListener = true;
        const closeBtn = document.querySelector('.close-btn');
        const infoBtn = document.getElementById('translate-btn');

        closeBtn.onclick = () => closeOverlay();
        languageOverlay.addEventListener('click', (event) => {
            if (event.target === languageOverlay) closeOverlay();
        });
    }
}

/**
 * Check availability of tcpdump
 * @returns {void}
 */
function checkTcpdump() {
    if (import.meta.env.DEV) return; // vite debug
    exec("command -v tcpdump")
        .then(({ errno }) => {
            if (errno !== 0) document.getElementById('tcpdump-container').style.display = 'none';
        })
}

let setupTcpdumpTerminal = false, contentBox = false;

/**
 * Open tcpdump terminal
 * @returns {void}
 * @see controlPanelEventlistener - Calling this function
 */
function openTcpdumpTerminal() {
    const cover = document.querySelector('.document-cover');
    const terminal = document.getElementById('tcpdump-terminal');
    const terminalContent = document.getElementById('tcpdump-terminal-content');
    const header = document.querySelector('.title-container');
    const title = document.getElementById('title');
    const backButton = document.querySelector('.back-button');
    const bodyContent = document.getElementById('page-more');
    const floatBtn = document.querySelector('.tcpdump-btn');
    const stopBtn = document.getElementById('stop-tcpdump');
    const scrollTopBtn = document.getElementById('scroll-top');

    terminalContent.innerHTML = `
        <div class="tcpdump-header" id="tcpdump-header"></div>
        <div class="box tcpdump-search translucent" id="tcpdump-search">
            <h2>${ getString('query_search') }</h2>
            <input class="query-input translucent" type="text" id="tcpdump-search-input" placeholder="${ getString('query_search') }" autocapitalize="off">
        </div>
    `;

    if (!setupTcpdumpTerminal) {
        setupSwipeToClose(terminal, cover);
        stopBtn.addEventListener('click', () => stopTcpdump());
        backButton.addEventListener('click', () => closeTcpdumpTerminal());
        const searchInput = document.getElementById('tcpdump-search-input');
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const tcpdumpLines = document.querySelectorAll('.tcpdump-line');
            tcpdumpLines.forEach(line => {
                const domain = line.querySelector('.tcpdump-result');
                if (!domain) return;
                line.style.display = domain.textContent.toLowerCase().includes(searchTerm) ? 'flex': 'none';
            });
        });
        scrollTopBtn.addEventListener('click', () => {
            terminalContent.scrollTo({ top: 0, behavior: 'smooth' });
        });
        setupTcpdumpTerminal = true;
    }

    const tcpdumpHeader = document.getElementById('tcpdump-header');
    const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, '--tcpdump'], { env: { WEBUI_QUIET: "true" }});
    output.stdout.on('data', (data) => {
        if (data.includes('Out IP') || data.includes('In IP')) {
            if (!contentBox) appendContentBox();
            const match = data.match(/(\bA+|HTTPS)\?\s+([^\s.]+(?:\.[^\s.]+)+)\./i);
            if (match) {
                const type = match[1].toUpperCase();
                const domain = match[2];
                const div = document.createElement('div');
                div.className = 'tcpdump-line';
                div.innerHTML = `
                    <div class="tcpdump-type">${type}</div>
                    <div class="tcpdump-domain tcpdump-result ripple-element" id="copy-link">${domain}</div>
                `;
                document.querySelector('.tcpdump-content').appendChild(div);
                terminalContent.scrollTop = terminalContent.scrollHeight;
                addCopyToClipboardListeners();
                applyRippleEffect();
            }
        } else {
            appendVerbose(data);
        }
    });
    output.stderr.on('data', (data) => appendVerbose(data));

    // Append content box before append content
    const appendContentBox = () => {
        const div = document.createElement('div');
        div.className = 'tcpdump-content';
        div.classList.add('translucent');
        div.innerHTML = `
            <div class="tcpdump-line tcpdump-line-header">
                <div class="tcpdump-type">${getString('query_host_type')}</div>
                <div class="tcpdump-domain">${getString('query_host_domain')}</div>
            <div>
        `;
        terminalContent.appendChild(div);
        contentBox = true;
    };

    // Append verbose log to header part
    const appendVerbose = (data) => {
        const p = document.createElement('p');
        p.className = 'tcpdump-header-content';
        p.textContent = data;
        tcpdumpHeader.appendChild(p);
    };

    // Terminate tcpdump
    const stopTcpdump = () => {
        const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, '--stop-tcpdump']);
        output.on('exit', () => contentBox = false);
        if (contentBox) {
            document.getElementById('tcpdump-search').style.display = 'block';
        }
        stopBtn.classList.remove('show');
        if (terminalContent.scrollHeight > 1.5 * terminal.clientHeight) {
            scrollTopBtn.classList.add('show');
            floatBtn.classList.add('show');
            setTimeout(() => floatBtn.classList.add('inTerminal'), 100);
        }
    };

    const closeTcpdumpTerminal = () => {
        stopTcpdump();
        floatBtn.classList.remove('show');
        floatBtn.classList.remove('inTerminal');
        scrollTopBtn.classList.remove('show');
        stopBtn.classList.remove('show');
        terminal.style.transform = 'translateX(100%)';
        bodyContent.style.transform = 'translateX(0)';
        cover.style.opacity = '0';
        backButton.classList.remove('show');
        header.classList.remove('back');
        title.textContent = getString('footer_more');
    }

    // Open output terminal
    setTimeout(() => {
        terminal.style.transform = 'translateX(0)';
        bodyContent.style.transform = 'translateX(-20vw)';
        cover.style.opacity = '1';
        header.classList.add('back');
        backButton.classList.add('show');
        floatBtn.classList.add('show');
        stopBtn.classList.add('show');
        title.textContent = getString('control_panel_monitor_network_activity');
        setTimeout(() => stopTcpdump(), 60000);
    }, 50);
}

/**
 * Backup bindhosts config to /sdcard/Download/bindhosts_config.json
 * @returns {Promise<void>}
 * @see controlPanelEventlistener - Calling this function
 */
async function exportConfig() {
    const config = {
        metadata: {
            version: "v1",
            description: "bindhosts config backup"
        }
    };

    // Fetch and process each file
    for (const [fileType, filePath] of Object.entries(filePaths)) {
        const response = await fetch(`link/PERSISTENT_DIR/${filePath}`);
        if (!response.ok) throw new Error(`Failed to fetch ${filePath}`);
        const text = await response.text();
        const lines = text.trim();
        config[fileType] = {
            path: filePath,
            content: lines
        };
    }

    // Output in json format
    const result = await exec(`
FILENAME="/storage/emulated/0/Download/bindhosts_config_$(date +%Y%m%d_%H%M%S).json"
cat <<'JSON_EOF' > "$FILENAME"
${JSON.stringify(config)}
JSON_EOF
echo "$FILENAME"
        `);
    if (result.errno === 0) {
        showPrompt(getString('backup_restore_exported', result.stdout.trim()));
    } else {
        console.error("Backup failed:", result.stderr);
        showPrompt(getString('backup_restore_export_fail'), false);
    }
}

/**
 * Restore config
 * Open file selector and restore config from selected file
 * @return {Promise<void>}
 * @see controlPanelEventlistener - Calling this function
 */
async function restoreConfig() {
    const fileContent = await FileSelector.getFileContent("json");
    if (!fileContent) return;
    
    const config = JSON.parse(fileContent);

    // Validate using metadata
    const isValid = config.metadata && config.metadata.description === "bindhosts config backup";
    if (!isValid) {
        showPrompt(getString('backup_restore_invalid_config'), false);
        return;
    }

    // Restore each file according to backup version
    if (config.metadata.version === "v1") {
        for (const [fileType, fileData] of Object.entries(config)) {
            if (!filePaths[fileType] || !fileData.content) continue;
            const content = fileData.content;
            const result = await exec(`
cat <<'RESTORE_EOF' > ${basePath}/${fileData.path}
${content}
RESTORE_EOF
chmod 644 ${basePath}/${fileData.path} || true
            `);
            if (result.errno === 0) {
                showPrompt(getString('backup_restore_restored'));
            } else {
                console.error("Restore failed:", result.stderr);
                showPrompt(getString('backup_restore_restore_fail'), false);
            }
        }
    }
}

/**
 * Attach event listeners to control panel items
 * @returns {void}
 */
function controlPanelEventlistener(event) {
    const controlPanel = {
        "language-container": openLanguageMenu,
        "tcpdump-container": openTcpdumpTerminal,
        "tiles-container": installBindhostsApp,
        "update-toggle-container": toggleModuleUpdate,
        "action-redirect-container": toggleActionRedirectWebui,
        "cron-toggle-container": toggleCron,
        "github-issues": () => linkRedirect('https://github.com/bindhosts/bindhosts/issues/new'),
        "canary-update": canaryUpdate,
        "locales-update": localesUpdate,
        "export": exportConfig,
        "restore": restoreConfig
    };

    Object.entries(controlPanel).forEach(([element, functionName]) => {
        const el = document.getElementById(element);
        if (el) {
            let touchMoved = false, isHandling = false;

            // Handler for end events
            const handleEndEvent = () => {
                if (isHandling) return;
                isHandling = true;
                if (!touchMoved) {
                    setTimeout(() => {
                        functionName(event);
                        isHandling = false;
                    }, 50);
                } else {
                    isHandling = false;
                }
                touchMoved = false;
            };

            // Touch event
            el.addEventListener('touchstart', () => touchMoved = false);
            el.addEventListener('touchmove', () => touchMoved = true);
            el.addEventListener('touchend', handleEndEvent);

            // Mouse event
            el.addEventListener('mousedown', () => touchMoved = false);
            el.addEventListener('mousemove', () => touchMoved = true);
            el.addEventListener('mouseup', handleEndEvent);
        }
    });
}

// Lifecycle: Initial mount to DOM
export function mount() {
    controlPanelEventlistener();
    setupDocsMenu();
    generateLanguageMenu();
}

// Lifecycle: Each time page becomes visible
export function onShow() {
    document.getElementById('title').textContent = getString('footer_more');
    checkUpdateStatus();
    checkBindhostsApp();
    checkMagisk();
    checkCronStatus();
    checkTcpdump();
}

// Lifecycle: Each time page is hidden
export function onHide() {
    const floatBtn = document.querySelector('.tcpdump-btn');
    floatBtn?.classList.remove('show');
    floatBtn?.classList.remove('inTerminal');
}

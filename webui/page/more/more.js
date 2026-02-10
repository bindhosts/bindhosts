import { exec, spawn } from 'kernelsu-alt';
import { showPrompt, reboot, basePath, moduleDirectory, linkRedirect, filePaths, fetchText, updateUIVisibility } from '../../utils/util.js';
import { getString } from '../../utils/language.js';
import { FileSelector } from '../../utils/file_selector.js';
import { addCopyToClipboardListeners, setupDocsMenu } from '../../utils/docs.js';
import { formatCapturedLogs, capturedLogs } from '../../utils/log_catcher.js';
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
    fetchText(`link/MODDIR/module.prop`, `${moduleDirectory}/module.prop`)
        .then(text => {
            const lines = text.split('\n');
            toggleVersion.selected = lines.some(line => line.trim().startsWith("updateJson="));
        })
        .catch(() => {
            toggleVersion.selected = true;
        });
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
        echo "magisk_webui_redirect=${actionRedirectStatus.selected ? 0 : 1}" > ${basePath}/webui_setting.sh
        chmod 755 ${basePath}/webui_setting.sh || true
    `);
    if (result.errno === 0) {
        if (actionRedirectStatus.selected) {
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

    fetchText(`link/PERSISTENT_DIR/webui_setting.sh`, `${basePath}/webui_setting.sh`)
        .then(data => {
            const redirectStatus = data.match(/magisk_webui_redirect=(\d)/)[1];
            actionRedirectStatus.selected = redirectStatus === "1";
        })
        .catch(() => {
            actionRedirectStatus.selected = true;
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
    fetchText('link/MODDIR/module.prop', `${moduleDirectory}/module.prop`)
        .then(text => {
            if (text.includes('AdAway')) {
                document.getElementById('cron-toggle-container').style.display = 'none';
            } else {
                exec(`grep -q bindhosts.sh ${basePath}/crontabs/root`)
                    .then(({ errno }) => {
                        cronToggle.selected = errno === 0 ? true : false;
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
    const result = await exec(`sh ${moduleDirectory}/bindhosts.sh --${cronToggle.selected ? "disable" : "enable"}-cron`);
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
        .catch(() => {
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
    languageOverlay.show();

    if (!languageMenuListener) {
        languageMenuListener = true;
        const closeBtn = languageOverlay.querySelector('.close-btn');
        closeBtn.onclick = () => languageOverlay.close();
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
    const terminal = document.getElementById('tcpdump-terminal');
    const terminalContent = document.getElementById('tcpdump-terminal-content');
    const backButton = document.querySelector('.back-button');
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
            terminal.scrollTo({ top: 0, behavior: 'smooth' });
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
                    <div class="tcpdump-domain tcpdump-result copy-link">
                        ${domain}
                        <md-ripple></md-ripple>
                    </div>
                `;
                document.querySelector('.tcpdump-content').appendChild(div);
                terminal.scrollTop = terminal.scrollHeight;
                addCopyToClipboardListeners();
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
        if (terminal.scrollHeight > 1.5 * terminal.clientHeight) {
            scrollTopBtn.classList.add('show');
        }
    };

    const closeTcpdumpTerminal = () => {
        stopTcpdump();
        terminal.close();
    }

    // Open output terminal
    setTimeout(() => {
        terminal.open();
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
        const text = await fetchText(`link/PERSISTENT_DIR/${filePath}`, `${basePath}/${filePath}`).catch(() => "");
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
 * Open the log viewer terminal.
 * @returns {void}
 */
function openLogViewer() {
    const terminal = document.getElementById('logs-terminal');
    const backButton = document.querySelector('.back-button');
    const saveButton = document.getElementById('save-btn');

    refreshLogTerminal();

    terminal.open();
    saveButton.onclick = () => saveLogsToFile();

    const closeLogViewer = () => {
        terminal.close();
    };

    backButton.onclick = closeLogViewer;
}

/**
 * Save captured logs to Download folder.
 * @returns {Promise<void>}
 */
async function saveLogsToFile() {
    const logs = formatCapturedLogs();
    const fileName = `/storage/emulated/0/Download/bindhosts_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    const result = await exec(`
cat << 'LOG_EOF' > "${fileName}"
${logs}
LOG_EOF
`);

    if (result.errno === 0) {
        showPrompt(getString('global_saved', fileName));
    } else {
        showPrompt(getString('global_save_fail'), false);
        console.error("Failed to save logs:", result.stderr);
    }
}

/**
 * Refresh the log terminal UI.
 * @returns {void}
 */
function refreshLogTerminal() {
    const terminalContent = document.getElementById('logs-terminal-content');
    if (!terminalContent) return;

    terminalContent.innerHTML = '';
    capturedLogs.forEach(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        const p = document.createElement('p');
        p.className = 'action-terminal-output';
        p.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-level level-${entry.level.toLowerCase()}">[${entry.level}]</span> <span class="log-message">${entry.message}</span>${entry.detail ? ' <span class="log-detail">| ' + entry.detail + '</span>' : ''}`;
        terminalContent.appendChild(p);
    });

    const terminal = document.getElementById('logs-terminal');
    if (terminal) {
        terminal.scrollTo({ top: terminal.scrollHeight, behavior: 'smooth' });
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
        "restore": restoreConfig,
        "view-webui-log": openLogViewer
    };

    Object.entries(controlPanel).forEach(([element, functionName]) => {
        const el = document.getElementById(element);
        if (el) {
            el.onclick = () => functionName(event);
        }
    });
}

// Lifecycle: Initial mount to DOM
export function mount() {
    controlPanelEventlistener();
    setupDocsMenu();
}

// Lifecycle: Each time page becomes visible
export function onShow() {
    updateUIVisibility();
    checkUpdateStatus();
    checkBindhostsApp();
    checkMagisk();
    checkCronStatus();
    checkTcpdump();
}

// Lifecycle: Each time page is hidden
export function onHide() {
    document.querySelectorAll('.fab-container').forEach(c => c.classList.remove('show', 'inTerminal'));
    document.getElementById('save-btn')?.classList.remove('show');
}

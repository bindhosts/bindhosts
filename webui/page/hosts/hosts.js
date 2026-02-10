import { exec, spawn } from 'kernelsu-alt';
import { showPrompt, basePath, moduleDirectory, filePaths, fetchText, updateUIVisibility } from '../../utils/util.js';
import { getString } from '../../utils/language.js';
import { FileSelector } from '../../utils/file_selector.js';
import { setupDocsMenu } from '../../utils/docs.js';

/**
 * Read a file and display its content in the UI
 * Exclude # pattern
 * Create empty file if file not found
 * @param {string} fileType - Type of hosts file ('custom', 'sources', 'blacklist', etc.)
 * @returns {Promise<void>}
 */
async function loadFile(fileType) {
    const content = await fetchText('link/PERSISTENT_DIR/' + filePaths[fileType], `${basePath}/${filePaths[fileType]}`).catch(() => "");
    const lines = content
        .split("\n")
        .map(line => line)
        .filter(line => line && !line.startsWith("#"));
    displayHostsList(lines, fileType);
}

/**
 * Display hosts list in the UI
 * Create list item with remove button, edit button on custom file
 * @param {string[]} lines - Array of host entries to display
 * @param {string} fileType - Type of hosts file ('custom', 'sources', 'blacklist', etc.)
 * @throws {Error} When DOM elements are not found
 * @returns {void}
 */
function displayHostsList(lines, fileType) {
    const listElement = document.getElementById(`${fileType}-list`);
    listElement.innerHTML = "";
    
    // "show more" option
    const showInitialLimit = 4;
    const minItemsForShowMore = 6; // Only show "Show More" when there are at least 6 items
    const hasMoreItems = lines.length >= minItemsForShowMore;
    const initialLines = hasMoreItems ? lines.slice(0, showInitialLimit) : lines;
    
    // Function to create list items
    const createListItem = (line) => {
        // Free favicon provided by GitHub@twentyhq/favicon
        let domain = line.trim().split(/\s+/).pop();
        try {
            if (!domain.startsWith("http")) domain = "http://" + domain;
            domain = new URL(domain).hostname;
        } catch {
            domain = domain.split(/[/:?#]/)[0];
        }
        const faviconUrl = `https://twenty-icons.com/${domain}`;

        const listItem = document.createElement("div");
        listItem.className = 'scrollable-list';
        listItem.innerHTML = `
            <!-- Favicon and link text -->
            <div class="link-box">
                ${fileType !== "import_custom" ? `<div class="favicon-wrapper">
                    <div class="favicon-loader"></div>
                    <img class="favicon-img favicon" src="${faviconUrl}" />
                </div>` : ""}
                <div class="link-text">${line.replace(/^disabled\|/, '')}</div>

                <!-- Checkbox (custom hosts only) -->
                ${fileType === "custom" ? `<md-checkbox></md-checkbox>` : ''}
            </div>

            <!-- Edit and delete buttons -->
            <div class="link-button">
                ${fileType === "import_custom" ? `<md-filled-icon-button class="edit-btn">
                    <md-icon><svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></md-icon>
                </md-filled-icon-button>` : ""}
                <md-filled-icon-button class="delete-btn" id="${fileType === "import_custom" ? "file-delete" : "line-delete"}">
                    <md-icon><svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#ffffff"><path d="M277.37-111.87q-37.78 0-64.39-26.61t-26.61-64.39v-514.5h-45.5v-91H354.5v-45.5h250.52v45.5h214.11v91h-45.5v514.5q0 37.78-26.61 64.39t-64.39 26.61H277.37Zm78.33-168.37h85.5v-360h-85.5v360Zm163.1 0h85.5v-360h-85.5v360Z"/></svg></md-icon>
                </md-filled-icon-button>
            </div>
        `;
        // Click to show remove button
        listElement.appendChild(listItem);
        listItem.addEventListener('click', () => {
            const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
            listItem.scrollTo({ 
                left: isRTL ? -listItem.scrollWidth : listItem.scrollWidth,
                behavior: 'smooth'
            });
        });
        const deleteLine = listItem.querySelector("#line-delete");
        const deleteFile = listItem.querySelector("#file-delete");
        const editFile = listItem.querySelector(".edit-btn");
        const img = listItem.querySelector(".favicon-img");
        // Wait for favicon to load
        if (img) {
            const loader = listItem.querySelector(".favicon-loader");
            img.onload = () => {
                loader.style.display = "none";
                img.style.display = "block";
            };
            img.onerror = () => {
                loader.style.display = "none";
                listItem.querySelector(".favicon-wrapper").innerHTML = `<svg class="favicon" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z"/></svg>`;
            };
        }
        // Checkbox functionality for custom hosts
        const checkbox = listItem.querySelector("md-checkbox");
        if (checkbox) {
            checkbox.checked = !line.startsWith('disabled|');
            checkbox.addEventListener('change', () => {
                const command = line.startsWith('disabled|') ? `s/${line}/${line.replace(/^disabled\|/, '')}/` : `s/^${line}/disabled|${line}/`;
                exec(`sed -i '${command}' ${basePath}/${filePaths[fileType]}`);
                loadFile(fileType);
            });
        }
        const removeEntry = () => {
            const next = listItem.nextElementSibling;
            if (next && next.tagName === 'MD-DIVIDER') {
                next.remove();
            } else {
                const prev = listItem.previousElementSibling;
                if (prev && prev.tagName === 'MD-DIVIDER') {
                    prev.remove();
                }
            }
            listItem.remove();
        };

        // Remove line from file
        if (deleteLine) {
            deleteLine.onclick = async () => {
                await exec(`
                    filtered=$(grep -vxF '${line}' ${basePath}/${filePaths[fileType]})
                    echo "$filtered" > ${basePath}/${filePaths[fileType]}
                `);
                removeEntry();
            };
        }
        // Remove file
        if (deleteFile) {
            deleteFile.onclick = async () => {
                const fileName = listItem.querySelector(".link-text").textContent;
                const remove = await removeCustomHostsFile(fileName);
                if (remove) {
                    await exec(`rm -f "${basePath}/${fileName}"`);
                    removeEntry();
                }
            };
        }
        // Edit file
        if (editFile) {
            editFile.onclick = () => {
                const line = listItem.querySelector(".link-text").textContent;
                fileNameEditor(line);
            };
        }
        return listItem;
    };

    // Display initial items
    initialLines.forEach((line, index) => {
        createListItem(line);
        if (index < initialLines.length - 1) {
            listElement.appendChild(document.createElement("md-divider"));
        }
    });

    // Add "Show More" button
    if (hasMoreItems) {
        listElement.appendChild(document.createElement("md-divider"));
        const showMoreItem = document.createElement("div");
        showMoreItem.className = "show-more-item";
        // Special styling to make it visually distinct
        showMoreItem.innerHTML = getString('global_show_all', lines.length - showInitialLimit);
        listElement.appendChild(showMoreItem);
        // Remove the "Show More" button and show remaining items
        showMoreItem.onclick = () => {
            listElement.removeChild(showMoreItem);
            const remainingLines = lines.slice(showInitialLimit);
            remainingLines.forEach((line, index) => {
                createListItem(line);
                if (index < remainingLines.length - 1) {
                    listElement.appendChild(document.createElement("md-divider"));
                }
            });
        };
    }

}

/**
 * Handle adding input to the file
 * @param {string} fileType - Type of hosts file ('custom', 'sources', 'blacklist', etc.)
 * @param {string} prompt - Prompt message to display
 * @returns {Promise<void>}
 */
async function handleAdd(fileType, prompt) {
    const inputElement = document.getElementById(`${fileType}-input`);
    const inputValue = inputElement.value.trim();
    console.log(`Input value for ${fileType}: "${inputValue}"`);
    if (inputValue === "") return;
    const inputLines = inputValue.split('\n').map(line => line.trim()).filter(line => line !== "");
    try {
        const fileContent = await fetchText('link/PERSISTENT_DIR/' + filePaths[fileType], `${basePath}/${filePaths[fileType]}`).catch(() => "");
        const existingLines = fileContent.split('\n').map(line => line.trim()).filter(line => line !== "");

        for (const line of inputLines) {
            if (existingLines.includes(line)) {
                showPrompt(getString(prompt, line), false, 2000);
                continue;
            }
            await exec(`echo "${line}" >> ${basePath}/${filePaths[fileType]}`);
        }
        inputElement.value = ""; // Clear input if add successful
        loadFile(fileType);
    } catch(error) {
        console.error(`Failed to process input for ${fileType}: ${error}`);
    }
}

/**
 * Remove custom hosts file with confirmation
 * @param {string} fileName - Name of the file to remove
 * @returns {Promise<boolean>}
 */
function removeCustomHostsFile(fileName) {
    const dialog = document.getElementById("confirmation-dialog");
    const cancelButton = document.getElementById("dialog-cancel-btn");
    const removeButton = document.getElementById("dialog-remove-btn");

    document.getElementById("confirmation-file-name").textContent = fileName;

    // Show dialog
    dialog.show();

    return new Promise((resolve) => {
        dialog.onclose = () => {
            resolve(dialog.returnValue === 'remove');
            dialog.onclose = null;
        };

        cancelButton.onclick = () => {
            dialog.returnValue = 'cancel';
            dialog.close();
        };
        removeButton.onclick = () => {
            dialog.returnValue = 'remove';
            dialog.close();
        }
    });
}

// Help event listener
export let activeOverlay = null;
/**
 * Setup help menu event listeners to open and close help overlays
 * @returns {void}
 */
function setupHelpMenu() {
    const helpButtons = document.querySelectorAll(".help-btn");
    const overlays = document.querySelectorAll(".overlay");
    helpButtons.forEach(button => {
        button.onclick = () => {
            const type = button.dataset.type;
            const overlay = document.getElementById(`${type}-help`);
            if (overlay) {
                if (overlay.tagName === 'MD-DIALOG') {
                    overlay.show();
                    // Setup close button inside dialog
                    const closeBtn = overlay.querySelector('.close-btn');
                    if (closeBtn) closeBtn.onclick = () => overlay.close();
                } else {
                    openOverlay(overlay);
                }
            }
        };
    });
    overlays.forEach(overlay => {
        const closeButton = overlay.querySelector(".close-btn");
        
        if (closeButton) {
            closeButton.onclick = () => closeOverlay(overlay);
        }
        overlay.onclick = (e) => {
            if (e.target === overlay) closeOverlay(overlay);
        };
    });
    function openOverlay(overlay) {
        if (activeOverlay) closeOverlay(activeOverlay);
        activeOverlay = overlay;
        overlay.style.display = "flex";
        document.body.style.overflow = "hidden";
        setTimeout(() => overlay.style.opacity = "1", 10);
    }
    function closeOverlay(overlay) {
        document.body.style.overflow = "";
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.style.display = "none";
            activeOverlay = null;
        }, 200);
    }
}

/**
 * Handle touch screen textarea experience: force single direction scroll, snap line
 * @returns {void}
 */
function setupInputEvent() {
    const inputBoxes = document.querySelectorAll('.input-box');

    inputBoxes.forEach(inputBox => {
        let startX, startY, isScrollingX, isScrollingY;
        const lineHeight = parseFloat(window.getComputedStyle(inputBox).lineHeight);

        inputBox.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isScrollingX = false;
            isScrollingY = false;
            document.body.style.overflow = "hidden";
        });
        inputBox.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            // Only allow X or Y scroll in a single touchmove event
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (!isScrollingX) {
                    isScrollingX = true;
                    isScrollingY = false;
                }
                if (isScrollingY) event.preventDefault();
            } else {
                if (!isScrollingY) {
                    isScrollingY = true;
                    isScrollingX = false;
                    inputBox.scrollTo({ left: 0, behavior: 'smooth' });
                }
                if (isScrollingX) event.preventDefault();
            }
        });
        inputBox.addEventListener('touchend', () => {
            isScrollingX = false;
            isScrollingY = false;
            document.body.style.overflow = "";
            // Snap to the nearest line
            const scrollTop = inputBox.scrollTop;
            const nearestLine = Math.round(scrollTop / lineHeight) * lineHeight;
            inputBox.scrollTo({ top: nearestLine, behavior: 'smooth' });
        });
        inputBox.addEventListener('focus', () => {
            const wrapper = inputBox.closest('.input-box-wrapper');
            wrapper.classList.add('focus');
            inputBox.style.padding = '0 9px';
        });
        inputBox.addEventListener('blur', () => {
            const wrapper = inputBox.closest('.input-box-wrapper');
            wrapper.classList.remove('focus');
            inputBox.style.paddingLeft = '10px';
        });
    });
}

/**
 * Attach event listeners to the add buttons
 * @returns {void}
 */
function attachAddButtonListeners() {
    // id - input id, type - file type, fail - prompt message
    const elements = [
        { id: "custom-input", type: "custom", fail: "custom_prompt_fail" },
        { id: "sources-input", type: "sources", fail: "source_prompt_fail" },
        { id: "blacklist-input", type: "blacklist", fail: "blacklist_prompt_fail" },
        { id: "whitelist-input", type: "whitelist", fail: "whitelist_prompt_fail" },
        { id: "sources_whitelist-input", type: "sources_whitelist", fail: "sources_whitelist_prompt_fail" }
    ];
    elements.forEach(({ id, type, fail }) => {
        const inputElement = document.getElementById(id);
        const buttonElement = document.getElementById(`${type}-add`);
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === "Enter") {
                handleAdd(type, fail);
                inputElement.blur();
            }
        });
        buttonElement.addEventListener('click', () => handleAdd(type, fail));
    });
}

let actionRunning = false, isTerminalOpen = false;

/**
 * Run bindhosts.sh with and display output in fake terminal
 * @param {String} args - argument for bindhosts.sh
 * @returns {Promise<void>}
 */
function runBindhosts(args) {
    const terminal = document.getElementById('action-terminal');
    const terminalContent = document.getElementById('action-terminal-content');
    const backButton = document.querySelector('.back-button');
    const FabContainer = document.querySelector('.action-container');
    const closeBtn = document.getElementById('close-terminal');

    closeBtn.onclick = () => closeTerminal();
    backButton.onclick = () => closeTerminal();

    if (!actionRunning) {
        actionRunning = true;
        terminalContent.innerHTML = '';
        const output = spawn("sh", [`${moduleDirectory}/bindhosts.sh`, `${args}`]);
        output.stdout.on('data', (data) => appendOutput(data));
        output.stderr.on('data', (data) => appendOutput(data));
        output.on('exit', () => {
            if (isTerminalOpen) {
                closeBtn.classList.add('show');
                FabContainer.classList.add('show');
            }
            actionRunning = false;
        });
    }

    // Append output to terminal
    const appendOutput = (output) => {
        const p = document.createElement('p');
        p.className = 'action-terminal-output';
        p.textContent = output;
        terminalContent.appendChild(p);
        terminal.scrollTo({ top: terminal.scrollHeight, behavior: 'smooth' });
    };

    const closeTerminal = () => {
        if (!isTerminalOpen) return;
        terminal.close();
        setTimeout(() => {
            isTerminalOpen = false;
        }, 100);
    }

    // Open output terminal
    setTimeout(() => {
        isTerminalOpen = true;
        terminal.open();
        backButton.onclick = () => closeTerminal();
    }, 50);
}

/**
 * Find out custom hosts list and display it
 * @returns {void}
 */
function getCustomHostsList() {
    exec(`ls ${basePath} | grep "^custom.*\\.txt$" | grep -vx "custom.txt"`)
        .then(({ stdout, errno }) => {
            if (errno !== 0) return;
            const lines = stdout.split("\n");
            displayHostsList(lines, "import_custom");
        });
}

/**
 * Import custom hosts with file selector
 * @returns {void}
 */
async function importCustomHost() {
    const filePath = await FileSelector.getFilePath("txt");
    if (filePath) {
        const fileName = filePath.split('/').pop().replace(/ /g, '_');
        const destPath = `${basePath}/custom_${fileName}`;
        const result = await exec(`
            cp -f "${filePath}" "${destPath}"
            chmod 644 "${destPath}"
        `);
        if (result.errno === 0) {
            showPrompt(getString('global_saved', destPath));
            await new Promise(resolve => setTimeout(resolve, 100));
            getCustomHostsList();
        } else {
            showPrompt(getString('global_save_fail'), false);
            console.error('Error copying file:', result.stderr);
        }
    }
}

/**
 * Setup dev editor for system files
 * @returns {void}
 */
function setupDevEditor() {
    const header = document.querySelector('.box-header.import');
    const helpBtn = header.querySelector('.help-btn');
    if (!helpBtn) return;

    const editBtn = document.createElement('md-outlined-icon-button');
    editBtn.className = 'dev-edit-btn';
    editBtn.innerHTML = `
        <md-icon><svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg></md-icon>
    `;
    editBtn.onclick = async () => {
        const fileName = "_demo";
        const content = await fetchText(`link/PERSISTENT_DIR/${fileName}`, `${basePath}/${fileName}`).catch(() => "");
        const editorInput = document.getElementById("edit-input");
        const fileNameInput = document.getElementById('file-name-input');
        editorInput.value = content;
        fileNameInput.value = fileName;
        openFileEditor(fileName);
    };
    header.insertBefore(editBtn, helpBtn);
}

/**
 * Open file name editor
 * @param {string} fileName - Current file name
 * @returns {Promise<void>}
 */
async function fileNameEditor(fileName) {
    const editorInput = document.getElementById("edit-input");
    const fileNameInput = document.getElementById('file-name-input');
    const rawFileName = fileName.replace("custom", "").replace(".txt", "");
    fileNameInput.value = rawFileName;
    // Editor support for file smaller than 128KB
    const result = await exec(`[ $(wc -c < ${basePath}/${fileName}) -lt 131072 ] || exit 1`);
    if (result.errno === 0) {
        const content = await fetchText(`link/PERSISTENT_DIR/${fileName}`, `${basePath}/${fileName}`).catch(() => "");
        editorInput.value = content;
        openFileEditor(fileName);
    } else {
        // Only rename is supported for large files
        openFileEditor(fileName, false);
        showPrompt(getString('global_file_too_large'));
    }
}

let setupEditor = false;
/**
 * Open file editor
 * @param {string} lastFileName - Name of the last file edited
 * @param {boolean} openEditor - Whether to open the file editor, false goes to file name editor only
 * @returns {void}
 */
function openFileEditor(lastFileName, openEditor = true) {
    const backButton = document.querySelector('.back-button');
    const saveButton = document.getElementById('save-btn');
    const editor = document.getElementById('edit-content');
    const lineNumbers = document.querySelector('.line-numbers');
    const bodyContent = document.getElementById('page-hosts');
    const editorInput = document.getElementById("edit-input");
    const fileNameInput = document.getElementById('file-name-input');

    if (!setupEditor) {
        setupEditor = true;
        fileNameInput.addEventListener('input', adjustFileNameWidth);
        saveButton.onclick = saveFile;
        editorInput.oninput = () => {
            // Set line numbers
            const lines = editorInput.value.split('\n').length;
            lineNumbers.innerHTML = Array.from({ length: lines }, (_, index) => 
                `<div>${(index + 1).toString().padStart(2, ' ')}</div>`
            ).join('');
            // Sync scroll position
            lineNumbers.scrollTop = editorInput.scrollTop;
        };
        editorInput.onblur = () => {
            editorInput.style.paddingBottom = '30px';
            lineNumbers.style.paddingBottom = '30px';
        };
        editorInput.onscroll = () => {
            lineNumbers.style.top = `-${editorInput.scrollTop}px`;
            lineNumbers.scrollTop = editorInput.scrollTop;
        };

        const updateActiveLine = () => {
            const cursorPosition = editorInput.selectionStart;
            const textBeforeCursor = editorInput.value.substring(0, cursorPosition);
            const currentLine = textBeforeCursor.split('\n').length;
            
            // Highlight line number
            const lines = lineNumbers.children;
            for (let i = 0; i < lines.length; i++) {
                lines[i].classList.toggle('active', i + 1 === currentLine);
            }

            // Move highlight bar
            const activeLineBar = document.getElementById('active-line-bar');
            if (activeLineBar) {
                const lineHeight = parseFloat(window.getComputedStyle(editorInput).lineHeight);
                const top = 5 + (currentLine - 1) * lineHeight - editorInput.scrollTop;
                activeLineBar.style.top = `${top}px`;
            }
        };

        editorInput.addEventListener('scroll', updateActiveLine);
        editorInput.addEventListener('input', updateActiveLine);
        editorInput.addEventListener('click', updateActiveLine);
        editorInput.addEventListener('keyup', updateActiveLine);
    }

    editorInput.dispatchEvent(new Event('input'));

    // Adjust width of fileName dynamically
    function adjustFileNameWidth() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = window.getComputedStyle(fileNameInput).font;
        const textWidth = ctx.measureText(fileNameInput.value).width;
        const maxWidth = window.innerWidth * 0.8 - 150;
        fileNameInput.style.width = `${Math.min(Math.ceil(textWidth) + 2, maxWidth)}px`;
    }
    adjustFileNameWidth();

    // Show editor
    document.body.classList.add('editor-active');
    bodyContent.style.overflowY = 'hidden';
    lineNumbers.style.display = 'block';

    // Open file editor
    if (openEditor) {
        editor.open();
        backButton.onclick = () => closeEditor();

        // Handle system file editor UI
        const isSystemFile = Object.values(filePaths).includes(lastFileName);
        const fileNameEditor = document.querySelector('.file-name-editor');
        const spans = fileNameEditor.querySelectorAll('span');
        if (isSystemFile) {
            spans.forEach(span => span.style.display = 'none');
            fileNameInput.readOnly = true;
            fileNameInput.style.width = 'auto';
        } else {
            spans.forEach(span => span.style.display = 'inline');
            fileNameInput.readOnly = false;
            adjustFileNameWidth();
        }
    } else {
        setTimeout(() => fileNameInput.focus(), 1000);
    }

    // Alternative way to close about docs with back button
    const closeEditor = () => {
        // Check if editor is actually active
        if (!editor.classList.contains('open') && !document.body.classList.contains('editor-active')) return;
        
        const lineNumbers = document.querySelector('.line-numbers');
        if (lineNumbers) lineNumbers.style.display = 'none';
        editor.close();
        document.body.classList.remove('editor-active');
        bodyContent.style.overflowY = 'auto';
        document.querySelectorAll('.box li').forEach(li => {
            li.scrollTo({ left: 0, behavior: 'smooth' });
        });
        editorInput.scrollTo(0, 0);
    }

    // Save file
    async function saveFile() {
        const newFileName = fileNameInput.value;
        const content = editorInput.value.trim();
        if (newFileName === "") {
            showPrompt(getString('global_file_name_empty'), false);
            return;
        }
        let command;
        const isSystemFile = Object.values(filePaths).includes(lastFileName);
        if (isSystemFile) {
            // Save system file directly
            command = `
                cat << 'HostEditorEOF' > ${basePath}/${lastFileName}
${content}
HostEditorEOF
                chmod 644 ${basePath}/${lastFileName}`;
        } else if (openEditor) {
            // Save custom file
            command = `
                [ ! -f ${basePath}/${lastFileName} ] || rm -f ${basePath}/${lastFileName}
                cat << 'HostEditorEOF' > ${basePath}/custom${newFileName}.txt
${content}
HostEditorEOF
                chmod 644 ${basePath}/custom${newFileName}.txt`;
        } else {
            // Rename file
            command = `mv -f ${basePath}/${lastFileName} ${basePath}/custom${newFileName}.txt`;
        }
        const result = await exec(command);
        if (result.errno === 0) {
            showPrompt(getString('global_saved', `${basePath}/custom${newFileName}.txt`));
        } else {
            showPrompt(getString('global_save_fail'), false);
            console.error("Failed to save file:", result.stderr);
        }
        getCustomHostsList();
        closeEditor();
    }
}

// Lifecycle: Initial mount to DOM
export function mount() {
    attachAddButtonListeners();
    setupHelpMenu();
    setupDocsMenu();
    setupInputEvent();
    if (import.meta.env.DEV) setupDevEditor();

    // Event listeners for action buttons
    const actionBtn = document.getElementById("action-btn");
    const forceUpdateButton = document.getElementById('force-update-btn');
    const importBtn = document.getElementById("import-custom-button");

    actionBtn.onclick = () => runBindhosts("--action");
    forceUpdateButton.onclick = () => runBindhosts("--force-update");
    importBtn.onclick = () => importCustomHost();
}

// Lifecycle: Each time page becomes visible
export function onShow() {
    updateUIVisibility();
    ["custom", "sources", "blacklist", "whitelist", "sources_whitelist"].forEach(loadFile);
    getCustomHostsList();
}

// Lifecycle: Each time page is hidden
export function onHide() {
    document.querySelectorAll('.fab-container').forEach(c => c.classList.remove('show', 'inTerminal'));
    document.getElementById('save-btn')?.classList.remove('show');
}

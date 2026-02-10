import { toast } from 'kernelsu-alt';
import { linkRedirect } from './util.js';
import { getString, lang } from './language.js';
import { marked } from "marked";

const main = "https://raw.githubusercontent.com";
const mirror = "https://hub.gitmirror.com/raw.githubusercontent.com";
const repo = "bindhosts/bindhosts";
const branch = "crowdin_docs";

/**
 * Fetch documents from a link and display them in the specified element
 * @param {string} element - ID of the element to display the document content
 * @param {string} link - Primary link to fetch the document
 * @param {string} fallback - Fallback link if the primary link fails
 * @returns {void}
 */
async function getDocuments(element, link, fallback) {
    const urls = [
        `${main}/${repo}/${branch}/${link}`,
        `${main}/${repo}/${branch}/${fallback}`,
        `${mirror}/${repo}/${branch}/${link}`,
        `${mirror}/${repo}/${branch}/${fallback}`
    ];
    let lastError = null;
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.text();
                window.linkRedirect = linkRedirect;
                marked.setOptions({
                    sanitize: true,
                    walkTokens(token) {
                        if (token.type === 'link') {
                            const href = token.href;
                            const text = token.text;
                            if (text === href) {
                                token.type = "html";
                                token.text = `<div class="copy-link">${text}<md-ripple></md-ripple></div>`;
                            } else {
                                token.href = "javascript:void(0);";
                                token.type = "html";
                                token.text = `<a href="javascript:void(0);" onclick="linkRedirect('${href}')">${text}</a>`;
                            }
                        }
                    }
                });
                
                const docsContent = document.getElementById(element);
                if ((i === 1 || i === 3) && link !== fallback) {
                    docsContent.setAttribute('dir', 'ltr');
                } else {
                    docsContent.removeAttribute('dir');
                }
                docsContent.innerHTML = marked.parse(data);
                
                addCopyToClipboardListeners();
                return;
            }
            lastError = `Status ${response.status} from ${url}`;
        } catch (error) {
            lastError = error.message;
            continue;
        }
    }

    // If we get here, all URLs failed
    console.error('Error fetching documents:', lastError);
    document.getElementById(element).textContent = `Failed to load content: ${lastError}`;
}

/**
 * Add event listeners to copy link text to clipboard
 * @returns {void}
 */
export function addCopyToClipboardListeners() {
    const sourceLinks = document.querySelectorAll(".copy-link");
    sourceLinks.forEach((element) => {
        if (element.dataset.copyListener !== "true") {
            element.onclick = () => {
                // Try the modern Clipboard API first
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(element.innerText)
                        .then(() => {
                            toast("Text copied to clipboard: " + element.innerText);
                        })
                        .catch(() => fallbackCopyToClipboard(element));
                } else {
                    fallbackCopyToClipboard(element);
                }
            };
            element.dataset.copyListener = "true";
        }
    });
}

/**
 * Fallback method to copy text to clipboard using document.execCommand
 * Used when the Clipboard API is not supported or fails
 * @param {HTMLElement} element - The element containing the text to copy
 * @returns {void}
 */
function fallbackCopyToClipboard(element) {
    try {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = element.innerText;
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const successful = document.execCommand('copy');
        // Remove the temporary element
        document.body.removeChild(textarea);
        if (successful) toast("Text copied to clipboard: " + element.innerText);
    } catch (err) {
        console.error("Failed to copy text: ", err);
    }
}

/**
 * Setup documents menu event listeners to open and close document overlays
 * @returns {Promise<void>}
 */
export async function setupDocsMenu() {
    let langCode = lang === 'en' ? '' : '_' + lang;
    const docsData = {
        source: {
            link: `Documentation/sources${langCode}.md`,
            fallback: `Documentation/sources.md`,
            element: 'source-content',
        },
        translate: {
            link: `Documentation/localize${langCode}.md`,
            fallback: `Documentation/localize.md`,
            element: 'translate-content',
        },
        modes: {
            link: `Documentation/modes${langCode}.md`,
            fallback: `Documentation/modes.md`,
            element: 'modes-content',
        },
        usage: {
            link: `Documentation/usage${langCode}.md`,
            fallback: `Documentation/usage.md`,
            element: 'usage-content',
        },
        hiding: {
            link: `Documentation/hiding${langCode}.md`,
            fallback: `Documentation/hiding.md`,
            element: 'hiding-content',
        },
        faq: {
            link: `Documentation/faq${langCode}.md`,
            fallback: `Documentation/faq.md`,
            element: 'faq-content',
        },
    };

    // For document overlay
    const docsButtons = document.querySelectorAll(".docs-btn");
    const docsOverlay = document.querySelectorAll(".docs");

    if (docsButtons) {
        docsButtons.forEach(button => {
            button.onclick = () => {
                const type = button.dataset.type;
                const overlay = document.getElementById(`${type}-docs`);

                // Close parent overlay if it exists
                const parentOverlay = button.closest('md-dialog');
                if (parentOverlay) {
                    closeOverlay(parentOverlay);
                }

                openOverlay(overlay);
                const { link, fallback, element } = docsData[type] || {};
                getDocuments(element, link, fallback);
            };
        });
    }

    if (docsOverlay) {
        docsOverlay.forEach(overlay => {
            const closeButton = overlay.querySelector(".close-btn");
            if (closeButton) {
                closeButton.onclick = () => closeOverlay(overlay);
            }
        });
    }

    // For about content
    const aboutContent = document.querySelector('.document-content');
    const backButton = document.querySelector('.back-button');

    if (aboutContent) {
        // Attach click event to all about docs buttons
        document.querySelectorAll('.about-docs').forEach(element => {
            element.onclick = () => {
                document.getElementById('about-document-content').innerHTML = '';
                const { link, fallback } = docsData[element.dataset.type] || {};
                getDocuments('about-document-content', link, fallback);
                aboutContent.open();
                const titleText = element.querySelector('.list-item-content').textContent;
                document.getElementById('title').textContent = titleText;

                backButton.onclick = () => {
                    aboutContent.close();
                    document.getElementById('title').textContent = getString('footer_more');
                };
            };
        });
    }
}

/**
 * Open a document overlay
 * @param {HTMLElement} overlay - Overlay element to open
 * @returns {void}
 */
function openOverlay(overlay) {
    document.querySelectorAll('md-dialog').forEach(dialog => {
        if (dialog.open) dialog.close();
    });
    const closeBtn = overlay.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => closeOverlay(overlay);
    }
    overlay.show();
}

/**
 * Close a document overlay
 * @param {HTMLElement} overlay - Overlay element to close
 * @returns {void}
 */
function closeOverlay(overlay) {
    overlay.close();
}

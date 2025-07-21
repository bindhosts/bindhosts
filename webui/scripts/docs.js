import { linkRedirect, applyRippleEffect, toast, developerOption, learnMore, setupSwipeToClose } from './util.js';
import { translations } from './language.js';

/**
 * Fetch documents from a link and display them in the specified element
 * @param {string} element - ID of the element to display the document content
 * @param {string} link - Primary link to fetch the document
 * @param {string} fallbackLink - Fallback link if the primary link fails
 * @param {string} linkMirror - mirror link of main link
 * @param {string} fallbackLinkMirror - mirror link of fallback link
 * @returns {void}
 */
async function getDocuments(element, link, fallbackLink, linkMirror, fallbackLinkMirror) {
    const urls = [link, fallbackLink, linkMirror, fallbackLinkMirror];
    let lastError = null;
    for (const url of urls) {
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
                                token.text = `<span><p class="ripple-element" id="copy-link">${text}</p></span>`;
                            } else {
                                token.href = "javascript:void(0);";
                                token.type = "html";
                                token.text = `<a href="javascript:void(0);" onclick="linkRedirect('${href}')">${text}</a>`;
                            }
                        }
                    }
                });
                
                const docsContent = document.getElementById(element);
                docsContent.innerHTML = marked.parse(data);
                
                addCopyToClipboardListeners();
                applyRippleEffect();
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
    const sourceLinks = document.querySelectorAll("#copy-link");
    sourceLinks.forEach((element) => {
        if (element.dataset.copyListener !== "true") {
            element.addEventListener("click", function () {
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
            });
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

// Setup documents menu
let activeDocs = null;

/**
 * Setup documents menu event listeners to open and close document overlays
 * @param {string} docsLang - Language code for the documents
 * @returns {Promise<void>}
 */
export async function setupDocsMenu(docsLang) {
    let langCode;
    if (docsLang === 'en') langCode = '';
    else langCode = '_' + docsLang;
    const docsData = {
        source: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/sources${langCode}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/sources.md`,
            linkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/sources${langCode}.md`,
            fallbackLinkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/sources.md`,
            element: 'source-content',
        },
        translate: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/localize${langCode}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/localize.md`,
            linkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/localize${langCode}.md`,
            fallbackLinkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/localize.md`,
            element: 'translate-content',
        },
        modes: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/modes${langCode}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/modes.md`,
            linkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/modes${langCode}.md`,
            fallbackLinkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/modes.md`,
            element: 'modes-content',
        },
        usage: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/usage${langCode}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/usage.md`,
            linkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/usage${langCode}.md`,
            fallbackLinkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/usage.md`,
            element: 'usage-content',
        },
        hiding: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/hiding${langCode}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/hiding.md`,
            linkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/hiding${langCode}.md`,
            fallbackLinkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/hiding.md`,
            element: 'hiding-content',
        },
        faq: {
            link: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/faq${langCode}.md`,
            fallbackLink: `https://raw.githubusercontent.com/bindhosts/bindhosts/master/Documentation/faq.md`,
            linkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/faq${langCode}.md`,
            fallbackLinkMirror: `https://raw.gitmirror.com/bindhosts/bindhosts/master/Documentation/faq.md`,
            element: 'faq-content',
        },
    };

    // For document overlay
    const docsButtons = document.querySelectorAll(".docs-btn");
    const docsOverlay = document.querySelectorAll(".docs");

    docsButtons.forEach(button => {
        button.addEventListener("click", () => {
            const type = button.dataset.type;
            const overlay = document.getElementById(`${type}-docs`);
            if (type === 'modes' && developerOption && !learnMore) return;
            openOverlay(overlay);
            const { link, fallbackLink, linkMirror, fallbackLinkMirror, element } = docsData[type] || {};
            getDocuments(element, link, fallbackLink, linkMirror, fallbackLinkMirror);
        });
    });

    docsOverlay.forEach(overlay => {
        const closeButton = overlay.querySelector(".close-docs-btn");
        if (closeButton) {
            closeButton.addEventListener("click", () => closeOverlay(overlay));
        }
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeOverlay(overlay);
            }
        });
    });

    // For about content
    const aboutContent = document.querySelector('.document-content');
    const documentCover = document.querySelector('.document-cover');
    if (aboutContent) {
        const header = document.querySelector('.title-container');
        const title = document.getElementById('title');
        const backButton = document.getElementById('docs-back-btn');
        const bodyContent = document.querySelector('.content');

        setupSwipeToClose(aboutContent, documentCover, backButton);

        // Attach click event to all about docs buttons
        document.querySelectorAll('.about-docs').forEach(element => {
            /** 
             * Manually listen to touch event to replace click event
             * Fix an issue caused by setupSwipeToClose
             * It could be an issue caused by momentum scrolling but currently I dont have a better workaround
            */
            let touchMoved = false;
            element.addEventListener('mousedown', () => touchMoved = false);
            element.addEventListener('touchstart', () => touchMoved = false);
            element.addEventListener('mousemove', () => touchMoved = true);
            element.addEventListener('touchmove', () => touchMoved = true);
            element.addEventListener('mouseup', () => handleClick());
            element.addEventListener('touchend', () => handleClick());

            function handleClick() {
                if (!touchMoved) {
                    document.getElementById('about-document-content').innerHTML = '';
                    const { link, fallbackLink, linkMirror, fallbackLinkMirror } = docsData[element.dataset.type] || {};
                    getDocuments('about-document-content', link, fallbackLink, linkMirror, fallbackLinkMirror);
                    setTimeout(() => {
                        aboutContent.style.transform = 'translateX(0)';
                        bodyContent.style.transform = 'translateX(-20vw)';
                        documentCover.style.opacity = '1';
                        header.classList.add('back');
                        backButton.style.transform = 'translateX(0)';
                        const titleText = element.querySelector('.document-title').textContent;
                        title.textContent = titleText;
                    }, 100);
                }
            }

            // Alternative way to close about docs with back button
            backButton.addEventListener('click', () => {
                aboutContent.style.transform = 'translateX(100%)';
                bodyContent.style.transform = 'translateX(0)';
                documentCover.style.opacity = '0';
                backButton.style.transform = 'translateX(-100%)';
                header.classList.remove('back');
                title.textContent = translations.footer_more;
            });
        });
    } // End of about docs
}

/**
 * Open a document overlay
 * @param {HTMLElement} overlay - Overlay element to open
 * @returns {void}
 */
function openOverlay(overlay) {
    if (activeDocs) closeOverlay(activeDocs);
    activeDocs = overlay;
    document.body.style.overflow = "hidden";
    overlay.style.display = "flex";
    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 10);
}

/**
 * Close a document overlay
 * @param {HTMLElement} overlay - Overlay element to close
 * @returns {void}
 */
function closeOverlay(overlay) {
    activeDocs = null;
    document.body.style.overflow = "";
    overlay.style.opacity = "0";
    setTimeout(() => {
        overlay.style.display = "none";
    }, 200);
}

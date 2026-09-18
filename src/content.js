const STYLE_ID = 'claude-rtl-style';
let rtlEnabled = true;

function isContextValid() {
    try {
        chrome.runtime.getURL('');
        return true;
    } catch (e) {
        return false;
    }
}

function applyRTL() {
    if (document.getElementById(STYLE_ID)) return;

    const fontURL = chrome.runtime.getURL('src/fonts/Vazirmatn-Regular.woff2');

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        @font-face {
            font-family: 'Vazirmatn';
            src: url('${fontURL}') format('woff2');
            font-weight: normal;
        }

        :is(
            [data-testid="user-message"],
            [data-testid="assistant-message"],
            .font-claude-message,
            .font-claude-response-body,
            .standard-markdown
        ) {
            direction: rtl !important;
            text-align: right !important;
            font-family: 'Vazirmatn', Tahoma, sans-serif !important;
        }

        :is(
            [data-testid="user-message"],
            [data-testid="assistant-message"],
            .font-claude-message,
            .font-claude-response-body,
            .standard-markdown
        ) :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, dd, dt, ul, ol) {
            unicode-bidi: isolate !important;
            font-family: 'Vazirmatn', Tahoma, sans-serif !important;
        }

        :is(
            [data-testid="user-message"],
            [data-testid="assistant-message"],
            .font-claude-message,
            .font-claude-response-body,
            .standard-markdown
        ) :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, dd, dt, ul, ol)[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
        }

        :is(
            [data-testid="user-message"],
            [data-testid="assistant-message"],
            .font-claude-message,
            .font-claude-response-body,
            .standard-markdown
        ) :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, dd, dt, ul, ol)[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }

        .whitespace-pre-wrap {
            direction: rtl !important;
            text-align: right !important;
            unicode-bidi: isolate !important;
            font-family: 'Vazirmatn', Tahoma, sans-serif !important;
        }

        .whitespace-pre-wrap[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
        }

        div[contenteditable="true"], textarea {
            text-align: start !important;
            unicode-bidi: plaintext !important;
            font-family: 'Vazirmatn', Tahoma, sans-serif !important;
        }

        .code-block__code,
        .code-block__code * {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: isolate !important;
            font-family: monospace !important;
        }

        code.whitespace-pre-wrap {
            direction: ltr !important;
            text-align: left !important;
            unicode-bidi: isolate !important;
            display: inline-block !important;
            font-family: monospace !important;
        }

        :is(.katex, .katex-display, mjx-container, math) {
            direction: ltr !important;
            unicode-bidi: isolate !important;
        }

        .katex-display {
            display: block !important;
            text-align: center !important;
            margin: 0.75em 0 !important;
        }

        .katex-display > .katex {
            text-align: center !important;
        }

        bdi {
            unicode-bidi: plaintext !important;
            font-family: 'Vazirmatn', Tahoma, sans-serif !important;
        }

        :is([data-cds="TurnStatus"], [data-testid="TurnStatus"]) {
            direction: rtl !important;
        }

        :is([data-cds="TurnStatus"], [data-testid="TurnStatus"]) :is(bdi, span) {
            text-align: start !important;
            font-family: 'Vazirmatn', Tahoma, sans-serif !important;
        }
    `;
    document.head.appendChild(style);
}

function removeRTL() {
    const style = document.getElementById(STYLE_ID);
    if (style) style.remove();
}

const RTL_CHAR_PATTERN = /[֑-߿יִ-﷿ﹰ-﻿]/;

const DIRECTIONAL_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, li, blockquote, td, th, dd, dt, ul, ol, .whitespace-pre-wrap:not(code)';

function fixMixedDirection(root) {
    if (!isContextValid() || !rtlEnabled || !root || !root.querySelectorAll) return;

    const elements = [];
    if (root.nodeType === 1 && root.matches && root.matches(DIRECTIONAL_SELECTOR)) {
        elements.push(root);
    }
    elements.push(...root.querySelectorAll(DIRECTIONAL_SELECTOR));

    elements.forEach((el) => {
        const text = el.textContent || '';
        if (!text.trim()) return;

        const currentDir = el.getAttribute('dir');
        const wantsRtl = RTL_CHAR_PATTERN.test(text);

        if (wantsRtl && currentDir !== 'rtl') {
            el.setAttribute('dir', 'rtl');
        } else if (!wantsRtl && !currentDir) {
            el.setAttribute('dir', 'ltr');
        }
    });
}

function refresh() {
    applyRTL();
    fixMixedDirection(document.body);
}

if (isContextValid()) {
    chrome.storage.local.get('rtlEnabled', ({ rtlEnabled: val }) => {
        rtlEnabled = val !== false;
        if (rtlEnabled) refresh();
    });
}

chrome.runtime.onMessage.addListener(({ action }) => {
    if (action === 'enable') { rtlEnabled = true; refresh(); }
    if (action === 'disable') { rtlEnabled = false; removeRTL(); }
});

let debounceTimer = null;

function processContentEditable() {
    if (!isContextValid() || !rtlEnabled) return;

    const contentEditableDiv = document.querySelector('div[contenteditable="true"]');
    if (contentEditableDiv && !contentEditableDiv.hasAttribute('dir')) {
        contentEditableDiv.setAttribute('dir', 'auto');
    }
}

const observer = new MutationObserver((mutations) => {
    if (!isContextValid()) {
        // Don't disconnect, just return
        return;
    }

    processContentEditable();

    const hasContentEditableAdded = mutations.some(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'contenteditable') {
            return true;
        }
        if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    if (node.matches && node.matches('div[contenteditable="true"]')) {
                        return true;
                    }
                    if (node.querySelector && node.querySelector('div[contenteditable="true"]')) {
                        return true;
                    }
                }
            }
        }
        return false;
    });

    if (hasContentEditableAdded) {
        processContentEditable();
    }

    if (rtlEnabled) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(refresh, 150);
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['contenteditable', 'dir']
});

let attempts = 0;
const interval = setInterval(() => {
    if (attempts > 5) {
        clearInterval(interval);
        return;
    }
    processContentEditable();
    attempts++;
}, 2000);

setTimeout(processContentEditable, 100);

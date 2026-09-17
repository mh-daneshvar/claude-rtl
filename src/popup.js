const toggle = document.getElementById('rtl-toggle');
const statusPill = document.getElementById('status-pill');
const statusText = document.getElementById('status-text');

function updateStatus(isEnabled) {
    if (isEnabled) {
        statusPill.className = 'status-pill on';
        statusText.textContent = 'فعال و در حال اجرا';
    } else {
        statusPill.className = 'status-pill off';
        statusText.textContent = 'غیرفعال است';
    }
}

chrome.storage.local.get('rtlEnabled', ({ rtlEnabled }) => {
    const isEnabled = rtlEnabled !== false;
    toggle.checked = isEnabled;
    updateStatus(isEnabled);
});

toggle.addEventListener('change', () => {
    const isEnabled = toggle.checked;
    chrome.storage.local.set({ rtlEnabled: isEnabled });
    updateStatus(isEnabled);

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        if (!tab) return;
        chrome.tabs.sendMessage(tab.id, {
            action: isEnabled ? 'enable' : 'disable'
        }).catch(() => {
            // Tab may not have the content script (e.g. not on claude.ai)
        });
    });
});

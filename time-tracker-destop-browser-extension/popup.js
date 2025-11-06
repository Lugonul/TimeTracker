document.addEventListener('DOMContentLoaded', async () => {
    await updateStatus();
    setInterval(updateStatus, 2000);
});

async function updateStatus() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];

        const statusDiv = document.getElementById('status');
        const domainDiv = document.getElementById('currentDomain');
        const timeDiv = document.getElementById('sessionTime');

        if (!activeTab.url.startsWith('http')) {
            statusDiv.textContent = 'Not tracking (system page)';
            statusDiv.className = 'status stopped';
            domainDiv.textContent = '';
            timeDiv.textContent = '';
            return;
        }

        const url = new URL(activeTab.url);
        statusDiv.textContent = 'Tracking active';
        statusDiv.className = 'status tracking';
        domainDiv.textContent = url.hostname;
        timeDiv.textContent = 'Time on site: tracking...';

    } catch (error) {
        document.getElementById('status').textContent = 'Error getting status';
    }
}
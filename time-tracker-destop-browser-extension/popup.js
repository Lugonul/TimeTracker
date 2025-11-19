document.addEventListener('DOMContentLoaded', async () => {
    await updateStatus();

    // Автообновление каждые 1.5 секунды
    setInterval(updateStatus, 1500);
});

async function updateStatus() {
    try {
        const statusDiv = document.getElementById('status');
        const domainDiv = document.getElementById('currentDomain');
        const timeDiv = document.getElementById('sessionTime');

        // Получаем информацию о текущей сессии
        const response = await chrome.runtime.sendMessage({ action: "getSessionInfo" });

        if (response.isActive) {
            // Сессия активна
            domainDiv.textContent = response.domain || 'Unknown';
            statusDiv.textContent = 'Tracking active';
            statusDiv.className = 'status tracking';

            const minutes = Math.floor(response.duration / 60000);
            const seconds = Math.floor((response.duration % 60000) / 1000);
            timeDiv.textContent = `Time: ${minutes}m ${seconds}s`;
        } else {
            // Нет активной сессии
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab || !tab.url || !tab.url.startsWith('http')) {
                statusDiv.textContent = 'Not tracking';
                statusDiv.className = 'status stopped';
                domainDiv.textContent = '';
                timeDiv.textContent = 'System page';
                return;
            }

            const url = new URL(tab.url);
            domainDiv.textContent = url.hostname;

            statusDiv.textContent = 'Ready to track';
            statusDiv.className = 'status stopped';
            timeDiv.textContent = 'Click to start tracking';
        }
    } catch (error) {
        console.error('Popup update error:', error);
        document.getElementById('status').textContent = 'Error loading';
        document.getElementById('status').className = 'status stopped';
    }
}
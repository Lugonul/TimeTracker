console.log("Time Tracker extension loaded");

let currentTab = null;
let startTime = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
    handleTabChange(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        handleTabChange(tabId, tab);
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (currentTab && currentTab.id === tabId) {
        saveCurrentSession();
    }
});

async function handleTabChange(tabId, tab = null) {
    if (!tab) {
        try {
            tab = await chrome.tabs.get(tabId);
        } catch (error) {
            return;
        }
    }

    // Игнорируем не-HTML страницы
    if (!tab.url || !tab.url.startsWith('http')) {
        return;
    }

    const url = new URL(tab.url);

    // Сохраняем предыдущую сессию
    saveCurrentSession();

    // Начинаем новую сессию
    currentTab = {
        id: tab.id,
        domain: url.hostname,
        url: tab.url,
        title: tab.title
    };
    startTime = Date.now();
}

function saveCurrentSession() {
    if (currentTab && startTime) {
        const duration = Date.now() - startTime;

        // Отправляем только если провели больше 5 секунд
        if (duration > 5000) {
            sendTimeData(currentTab, duration);
        }

        currentTab = null;
        startTime = null;
    }
}

async function sendTimeData(tab, duration) {
    const timeData = {
        applicationName: tab.domain,
        applicationType: "BROWSER",
        device: "COMPUTER",
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString()
    };

    try {
        await fetch('http://localhost:8080/time_tracker', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(timeData)
        });
    } catch (error) {
        // В будущем можно добавить сохранение для повторной отправки
        console.log('Failed to send data, will retry later');
    }
}
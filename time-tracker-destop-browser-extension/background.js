// background.js
console.log("Time Tracker extension loaded");

const STORAGE_KEY = 'timeTrackerState';
let state = {
    currentSession: null,
    lastTabId: null,
    lastFocusCheck: 0
};

// Инициализация с восстановлением состояния
initialize();

// Настройка периодической проверки каждую секунду
chrome.alarms.create('focusCheck', { periodInMinutes: 1/60 });

// Обработчики событий
chrome.tabs.onActivated.addListener(handleTabActivated);
chrome.tabs.onUpdated.addListener(handleTabUpdated);
chrome.windows.onFocusChanged.addListener(handleWindowFocus);
chrome.alarms.onAlarm.addListener(handleAlarm);

async function initialize() {
    try {
        const savedState = await chrome.storage.session.get(STORAGE_KEY);
        if (savedState[STORAGE_KEY]) {
            state = savedState[STORAGE_KEY];
            console.log('Restored state:', state);
        }
        await checkAndUpdateSession();
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

async function handleTabActivated(activeInfo) {
    await saveState();
    state.lastTabId = activeInfo.tabId;
    await checkAndUpdateSession();
}

function handleTabUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.active) {
        setTimeout(() => checkAndUpdateSession(), 100);
    }
}

async function handleWindowFocus(windowId) {
    await saveState();
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await endCurrentSession();
    } else {
        setTimeout(checkAndUpdateSession, 300);
    }
}

async function handleAlarm(alarm) {
    if (alarm.name !== 'focusCheck') return;

    await saveState();
    await checkAndUpdateSession();
}

async function checkAndUpdateSession() {
    try {
        const now = Date.now();

        // Проверяем фокус браузера
        const isFocused = await isBrowserFocused();
        if (!isFocused) {
            await endCurrentSession();
            return;
        }

        // Получаем активную вкладку
        const [activeTab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!activeTab || !activeTab.url || !activeTab.url.startsWith('http')) {
            await endCurrentSession();
            return;
        }

        const url = new URL(activeTab.url);
        const domain = url.hostname;

        // Если сессия не начата или вкладка изменилась
        if (!state.currentSession || state.currentSession.tabId !== activeTab.id) {
            await endCurrentSession();

            // Начинаем новую сессию
            state.currentSession = {
                tabId: activeTab.id,
                domain: domain,
                url: activeTab.url,
                title: activeTab.title || domain,
                startTime: now
            };

            console.log(`▶ Started session: ${domain}`);
            await saveState();
        }

    } catch (error) {
        console.error('Session check error:', error);
    }
}

async function isBrowserFocused() {
    try {
        const windows = await chrome.windows.getAll({ populate: false });
        return windows.some(win => win.focused && win.type === 'normal');
    } catch (error) {
        console.error('Focus check failed:', error);
        return false;
    }
}

async function endCurrentSession() {
    if (!state.currentSession) return;

    const now = Date.now();
    const duration = now - state.currentSession.startTime;
    const MIN_DURATION = 1000; // 1 секунда

    if (duration >= MIN_DURATION) {
        await sendSessionData(state.currentSession, now, duration);
        console.log(`✓ Saved session: ${state.currentSession.domain} (${Math.round(duration/1000)}s)`);
    } else {
        console.log(`✗ Skipped short session: ${state.currentSession.domain} (${Math.round(duration/1000)}s)`);
    }

    state.currentSession = null;
    await saveState();
}

// background.js - ИСПРАВЛЕННАЯ ФУНКЦИЯ sendSessionData
async function sendSessionData(session, endTime, duration) {
    // Форматируем время в UTC БЕЗ смещения (как было раньше)
    const formatAsUTC = (timestamp) => {
        const date = new Date(timestamp);

        const pad = (num) => num.toString().padStart(2, '0');
        const padMs = (num) => num.toString().padStart(3, '0');

        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());
        const milliseconds = padMs(date.getUTCMilliseconds());

        // Формат без временной зоны - UTC время
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
    };

    const payload = {
        applicationName: session.domain,
        applicationType: "BROWSER",
        device: "COMPUTER",
        startTime: formatAsUTC(session.startTime),
        endTime: formatAsUTC(endTime),
        duration: duration,
        url: session.url,
        title: session.title
    };

    console.log('Sending payload:', payload);

    try {
        const response = await fetch('http://localhost:8080/time_tracker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Server error (${response.status}):`, await response.text());
        } else {
            console.log('✅ Successfully sent session');
        }
    } catch (error) {
        console.error('❌ Failed to send:', error);
    }
}

async function saveState() {
    try {
        state.lastFocusCheck = Date.now();
        await chrome.storage.session.set({ [STORAGE_KEY]: state });
    } catch (error) {
        console.error('Failed to save state:', error);
    }
}

// Обработчик для popup (ИСПРАВЛЕННЫЙ)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSessionInfo") {
        sendResponse({
            isActive: !!state.currentSession,
            domain: state.currentSession?.domain || null,
            duration: state.currentSession ? Date.now() - state.currentSession.startTime : 0
        });
    }
    return true; // Важно для асинхронных ответов
});
document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll('.main-screen');
    const navItems = document.querySelectorAll('.nav-item');
    const coinAmountSpan = document.querySelector('.coin-amount');
    const characterHer = document.getElementById('character-her');
    const characterHim = document.getElementById('character');
    const upgradeButtons = document.querySelectorAll('.upgrade-button');
    const genderSwitchInputs = document.querySelectorAll('.gender-switch input');
    const contentHer = document.getElementById('content-her');
    const contentHim = document.getElementById('content-him');
    const linkInput = document.getElementById('linkInput');
    const copyButton = document.getElementById('copyButton');
    const timerElement = document.getElementById('tap-timer');

    const languageSwitcher = document.getElementById('language-switch');
    const currentLanguage = document.querySelector('.current-language');
    const languageList = document.querySelector('.language-list');

    const soundControl = document.querySelector('.sound-control');
    const soundOnIcon = document.getElementById('sound-on');
    const soundOffIcon = document.getElementById('sound-off');
    const backgroundMusic = document.getElementById('background-music');

    // Установка базовой громкости на 30%
    backgroundMusic.volume = 0.3;
    backgroundMusic.play();

    soundOnIcon.addEventListener('click', () => {
        backgroundMusic.pause();
        soundOnIcon.style.display = 'none';
        soundOffIcon.style.display = 'block';
    });

    soundOffIcon.addEventListener('click', () => {
        backgroundMusic.play();
        soundOnIcon.style.display = 'block';
        soundOffIcon.style.display = 'none';
    });

    let coins = 0;
    let coinsPerTap = 1;
    let clickCount = 0;
    let rewardGiven = false;
    let tapCount = 0; // Добавлена переменная для отслеживания количества тапов
    let isTapBlocked = false; // Добавлена переменная для блокировки тапов
    let blockStartTime = null; // Время начала блокировки
    let blockTimeout = null; // Таймаут для блокировки тапов
    const autoClickers = {
        gym: { level: 0, basePrice: 50, increment: 1, currentRate: 0, priceFactor: 3, multiplier: 2 },
        aiTap: { level: 0, basePrice: 20000, increment: 2, currentRate: 0, priceFactor: 3, multiplier: 2 },
        airdrop: { level: 0, basePrice: 100000, increment: 6, currentRate: 0, priceFactor: 3, multiplier: 2 },
        defi: { level: 0, basePrice: 10000000, increment: 10, currentRate: 0, priceFactor: 3, multiplier: 2 },
    };

    const saveProgressLocal = () => {
        const progress = {
            coins: coins,
            coinsPerTap: coinsPerTap,
            autoClickers: autoClickers,
            rewardGiven: rewardGiven,
            lastActive: Date.now(),
            tapCount: tapCount, // Сохранение количества тапов
            isTapBlocked: isTapBlocked, // Сохранение состояния блокировки
            blockStartTime: blockStartTime // Сохранение времени начала блокировки
        };
        localStorage.setItem('gameProgress', JSON.stringify(progress));
    };

    const loadProgressLocal = () => {
        const savedProgress = localStorage.getItem('gameProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            coins = progress.coins;
            coinsPerTap = progress.coinsPerTap;
            rewardGiven = progress.rewardGiven;
            tapCount = progress.tapCount || 0; // Загрузка количества тапов
            isTapBlocked = progress.isTapBlocked || false; // Загрузка состояния блокировки
            blockStartTime = progress.blockStartTime || null; // Загрузка времени начала блокировки
            const lastActive = progress.lastActive || Date.now();
            const timeElapsed = Math.floor((Date.now() - lastActive) / 1000);
            Object.keys(autoClickers).forEach(key => {
                autoClickers[key].level = progress.autoClickers[key].level;
                autoClickers[key].currentRate = progress.autoClickers[key].currentRate;
            });
            calculateOfflineEarnings(timeElapsed);
            coinAmountSpan.textContent = coins;
            updateUpgradePrices();
            Object.keys(autoClickers).forEach(key => {
                if (autoClickers[key].level > 0) {
                    startAutoClicker(key);
                }
            });
            if (isTapBlocked) {
                const blockDuration = 15 * 60 * 1000; // 15 минут в миллисекундах
                const timeSinceBlock = Date.now() - blockStartTime;
                if (timeSinceBlock >= blockDuration) {
                    isTapBlocked = false;
                    tapCount = 0;
                    showNotification('Вы снова можете тапать!');
                    timerElement.style.display = 'none'; // Скрыть таймер после разблокировки
                } else {
                    startBlockTimeout(blockDuration - timeSinceBlock);
                }
            }
        }
    };

    const calculateOfflineEarnings = (timeElapsed) => {
        let offlineCoins = 0;
        Object.keys(autoClickers).forEach(key => {
            offlineCoins += autoClickers[key].currentRate * timeElapsed;
        });
        coins += offlineCoins;
    };

    const hideAllPages = () => {
        pages.forEach(page => {
            page.style.display = 'none';
        });
    };

    const showPage = (pageId) => {
        hideAllPages();
        document.getElementById(pageId).style.display = 'flex';
        updateNavigation(pageId);

        // Показать/скрыть значок звука в зависимости от текущей страницы
        if (pageId === 'stats-page') {
            soundControl.style.display = 'block';
        } else {
            soundControl.style.display = 'none';
        }
    };

    const updateNavigation = (activePageId) => {
        navItems.forEach(navItem => {
            navItem.classList.remove('active');
            if (navItem.dataset.page === activePageId) {
                navItem.classList.add('active');
            }
        });
    };

    navItems.forEach(navItem => {
        navItem.addEventListener('click', () => {
            showPage(navItem.dataset.page);
        });
    });

    const getUpgradePrice = (upgradeType) => {
        const basePrice = autoClickers[upgradeType].basePrice;
        const level = autoClickers[upgradeType].level;
        if (level === 0) {
            return basePrice;
        }
        return Math.floor(basePrice * Math.pow(autoClickers[upgradeType].priceFactor, level));
    };

    const startAutoClicker = (upgradeType) => {
        setInterval(() => {
            coins += autoClickers[upgradeType].currentRate;
            coinAmountSpan.textContent = coins;
            updateUpgradePrices();
            saveProgressLocal();
        }, 1000);
    };

    const updateUpgradePrices = () => {
        upgradeButtons.forEach(button => {
            const upgradeType = button.getAttribute('data-type');
            const price = getUpgradePrice(upgradeType);
            const upgradeItem = button.parentElement;
            const priceText = upgradeItem.querySelector('.upgrade-details p');
            const level = autoClickers[upgradeType].level;
            const rate = autoClickers[upgradeType].currentRate;

            if (upgradeType === "gym") {
                priceText.innerHTML = `${price} | level ${level}/6<br>${rate + coinsPerTap} Young coin per tap`;
            } else {
                priceText.innerHTML = `${price} | level ${level}/6<br>${rate} Young coin / sec`;
            }

            if (level >= 6) {
                button.style.backgroundColor = '#ff3b30'; // Кнопка красная, если достигнут максимальный уровень
                button.disabled = true; // Отключаем кнопку
            } else if (coins >= price) {
                button.style.backgroundColor = '#00ff00'; // Кнопка зелёная, если достаточно монет для покупки
                button.disabled = false; // Включаем кнопку
            } else {
                button.style.backgroundColor = '#ff3b30'; // Кнопка красная, если недостаточно монет
                button.disabled = false; // Включаем кнопку
            }
        });
    };

    const handleClick

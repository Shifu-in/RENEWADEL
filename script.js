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

    const airdropPage = document.getElementById('airdrop-page'); // New Airdrop Page
    const friendsSlider = document.getElementById('friends-slider'); // Slider
    const sliderValue = document.getElementById('slider-value'); // Slider value display
    const referralsCountElement = document.getElementById('referrals-count');
    const daysCountElement = document.getElementById('days-count');
    const probabilityValue = document.getElementById('probability-value');
    const rewardProbabilitySlider = document.getElementById('reward-probability-slider');

    let referralsCount = 0;
    let daysCount = 0;

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

    const handleClick = (event) => {
        if (isTapBlocked) {
            showNotification('Достигнут лимит тапов! Подождите 15 минут.');
            return;
        }

        tapCount++;
        if (tapCount > 1000) {
            isTapBlocked = true;
            blockStartTime = Date.now(); // Устанавливаем время начала блокировки
            showNotification('Достигнут лимит тапов! Подождите 15 минут.');
            startBlockTimeout();
            saveProgressLocal();
            return;
        }

        coins += coinsPerTap;
        clickCount++;
        coinAmountSpan.textContent = coins;
        showCoinAnimation(event.clientX, event.clientY, coinsPerTap);
        updateUpgradePrices();

        if (clickCount % 5 === 0) {
            saveProgressLocal();
        }
    };

    const startBlockTimeout = (remainingTime = 15 * 60 * 1000) => {
        blockTimeout = setTimeout(() => {
            isTapBlocked = false;
            tapCount = 0;
            showNotification('Вы снова можете тапать!');
            timerElement.style.display = 'none'; // Скрыть таймер после разблокировки
            saveProgressLocal();
        }, remainingTime);

        updateTimer(remainingTime / 1000);
    };

    const updateTimer = (remainingSeconds) => {
        timerElement.style.display = 'block';

        const interval = setInterval(() => {
            if (remainingSeconds <= 0) {
                clearInterval(interval);
                timerElement.style.display = 'none';
                return;
            }
            remainingSeconds--;
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds % 60;
            timerElement.textContent = `${minutes}м ${seconds}с`;
        }, 1000);
    };

    characterHim.addEventListener('pointerdown', handleClick);
    characterHer.addEventListener('pointerdown', handleClick);

    const showCoinAnimation = (x, y, amount) => {
        const coinAnimation = document.createElement('div');
        coinAnimation.classList.add('coin-animation');
        coinAnimation.innerHTML = `<img src="assets/images/coins.svg" alt="Coin"><span>+${amount}</span>`;
        document.body.appendChild(coinAnimation);

        coinAnimation.style.left = `${x}px`;
        coinAnimation.style.top = `${y}px`;

        coinAnimation.addEventListener('animationend', () => {
            coinAnimation.remove();
        });
    };

    upgradeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const upgradeType = button.getAttribute('data-type');
            const price = getUpgradePrice(upgradeType);

            if (coins >= price && autoClickers[upgradeType].level < 6) { // изменено с 5 на 6
                coins -= price;
                coinAmountSpan.textContent = coins;
                autoClickers[upgradeType].level++;
                if (upgradeType === "gym") {
                    coinsPerTap *= autoClickers[upgradeType].multiplier;
                } else {
                    autoClickers[upgradeType].currentRate += autoClickers[upgradeType].increment * autoClickers[upgradeType].multiplier ** (autoClickers[upgradeType].level - 1);
                }
                if (autoClickers[upgradeType].level === 1) {
                    startAutoClicker(upgradeType);
                }
                updateUpgradePrices();
                saveProgressLocal();
            }
        });
    });

    genderSwitchInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (input.value === 'her') {
                contentHer.style.display = 'flex';
                contentHim.style.display = 'none';
            } else {
                contentHer.style.display = 'none';
                contentHim.style.display = 'flex';
            }
            saveProgressLocal();
        });
    });

    const showNotification = (message) => {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = 1;
        }, 100); // Delay to trigger CSS transition

        setTimeout(() => {
            notification.style.opacity = 0;
            setTimeout(() => {
                notification.remove();
            }, 500); // Wait for transition to complete
        }, 3000); // Duration the notification is visible
    };

    copyButton.addEventListener('click', () => {
        linkInput.select();
        linkInput.setSelectionRange(0, 99999); // Для мобильных устройств

        // Копируем выделенный текст в буфер обмена
        navigator.clipboard.writeText(linkInput.value).then(() => {
            showNotification('Ссылка скопирована!');
            if (!rewardGiven) {
                coins += 5000;
                coinAmountSpan.textContent = coins;
                showNotification('Вам начислено 5,000 монет Young!');
                rewardGiven = true;
                saveProgressLocal();
            }
        });
    });

    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.add.addEventListener('gesturechange', (e) => e.preventDefault());
    document.add.addEventListener('gestureend', (e) => e.preventDefault());
    document.add.addEventListener('dblclick', (e) => e.preventDefault());

    showPage('home-page');
    loadProgressLocal();

    const updateLanguage = (lang) => {
        const elements = document.querySelectorAll('[data-lang-ru], [data-lang-en], [data-lang-fr], [data-lang-uz], [data-lang-ch], [data-lang-sp]');
        elements.forEach(el => {
            el.innerHTML = el.getAttribute(`data-lang-${lang.toLowerCase()}`);
            if (lang.toLowerCase() === 'uz' && el.classList.contains('upgrade-button')) {
                el.innerHTML = 'BUY'; // For Uzbek language, set upgrade button text to "BUY"
            }
        });
    };

    languageSwitcher.addEventListener('click', () => {
        if (languageList.style.display === 'none') {
            languageList.style.display = 'block';
        } else {
            languageList.style.display = 'none';
        }
    });

    languageList.addEventListener('click', (event) => {
        const selectedLang = event.target.getAttribute('data-lang');
        currentLanguage.textContent = selectedLang;
        updateLanguage(selectedLang);
        languageList.style.display = 'none';
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('home-page').style.display = 'flex';
        }, 5000);
    });

    window.addEventListener('beforeunload', saveProgressLocal);

    // New Airdrop Page functionality
    const updateProbabilityValue = (value) => {
        probabilityValue.textContent = `${value}%`;
    };

    rewardProbabilitySlider.addEventListener('input', (e) => {
        updateProbabilityValue(e.target.value);
    });

    document.getElementById('minus-referrals').addEventListener('click', () => {
        if (referralsCount > 0) {
            referralsCount--;
            referralsCountElement.textContent = referralsCount;
        }
    });

    document.getElementById('plus-referrals').addEventListener('click', () => {
        referralsCount++;
        referralsCountElement.textContent = referralsCount;
    });

    document.getElementById('minus-days').addEventListener('click', () => {
        if (daysCount > 0) {
            daysCount--;
            daysCountElement.textContent = daysCount;
        }
    });

    document.getElementById('plus-days').addEventListener('click', () => {
        daysCount++;
        daysCountElement.textContent = daysCount;
    });
});

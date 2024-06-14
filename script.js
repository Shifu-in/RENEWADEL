document.addEventListener('DOMContentLoaded', function () {
    const homePage = document.getElementById('home-page');
    const storePage = document.getElementById('store-page');
    const statsPage = document.getElementById('stats-page');
    const walletPage = document.getElementById('wallet-page');
    const funPage = document.getElementById('fun-page');
    const friendsPage = document.getElementById('friends-page');
    const airdropPage = document.getElementById('airdrop-page'); // New Airdrop Page

    const navItems = document.querySelectorAll('.nav-item');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingGif = document.getElementById('loading-gif');
    const loadingText = document.getElementById('loading-text');
    const coinAmountElement = document.querySelector('.coin-amount');
    const copyButton = document.getElementById('copyButton');
    const linkInput = document.getElementById('linkInput');
    const genderSwitch = document.querySelector('.gender-switch');
    const characterHer = document.getElementById('character-her');
    const characterHim = document.getElementById('character');
    const tapTimer = document.getElementById('tap-timer');
    const languageSwitch = document.getElementById('language-switch');
    const currentLanguage = document.querySelector('.current-language');
    const languageList = document.querySelector('.language-list');
    const friendsSlider = document.getElementById('friends-slider'); // Slider
    const sliderValue = document.getElementById('slider-value'); // Slider value display

    // Coins count
    let coins = 0;

    // Simulate loading process
    setTimeout(function () {
        loadingScreen.style.display = 'none';
        homePage.style.display = 'flex';
    }, 3000); // Simulate 3 seconds loading time

    // Coin animation
    const createCoinAnimation = (x, y, coinValue) => {
        const coin = document.createElement('div');
        coin.className = 'coin-animation';
        coin.style.left = `${x}px`;
        coin.style.top = `${y}px`;
        coin.innerHTML = `<img src="assets/images/coins.svg" alt="Coin">${coinValue}`;
        document.body.appendChild(coin);

        setTimeout(() => {
            document.body.removeChild(coin);
        }, 1000);
    };

    const updateSliderValue = (value) => {
        sliderValue.textContent = `Вы получите: ${value} монет`;
    };

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');

            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            homePage.style.display = 'none';
            storePage.style.display = 'none';
            statsPage.style.display = 'none';
            walletPage.style.display = 'none';
            funPage.style.display = 'none';
            friendsPage.style.display = 'none';
            airdropPage.style.display = 'none'; // Hide other pages

            document.getElementById(pageId).style.display = 'flex';
        });
    });

    // Gender switch
    genderSwitch.addEventListener('change', (event) => {
        if (event.target.value === 'her') {
            document.getElementById('content-her').style.display = 'flex';
            document.getElementById('content-him').style.display = 'none';
        } else {
            document.getElementById('content-her').style.display = 'none';
            document.getElementById('content-him').style.display = 'flex';
        }
    });

    // Tap to earn coins
    homePage.addEventListener('click', function (event) {
        coins++;
        coinAmountElement.textContent = coins;

        const x = event.clientX;
        const y = event.clientY;

        createCoinAnimation(x, y, 1);
    });

    // Language switcher
    languageSwitch.addEventListener('click', function () {
        languageList.style.display = languageList.style.display === 'none' ? 'block' : 'none';
    });

    languageList.addEventListener('click', function (event) {
        const lang = event.target.getAttribute('data-lang');
        if (lang) {
            currentLanguage.textContent = lang;
            languageList.style.display = 'none';
            setLanguage(lang);
        }
    });

    const setLanguage = (lang) => {
        document.querySelectorAll('[data-lang-' + lang.toLowerCase() + ']').forEach(element => {
            element.textContent = element.getAttribute('data-lang-' + lang.toLowerCase());
        });
    };

    // Copy referral link
    copyButton.addEventListener('click', function () {
        linkInput.select();
        document.execCommand('copy');
        alert('Скопировано в буфер обмена');
    });

    // Update slider value display
    friendsSlider.addEventListener('input', function () {
        updateSliderValue(this.value);
    });

    // Timer to track taps
    let tapStartTime = 0;
    let tapTimerInterval;

    const updateTapTimer = () => {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - tapStartTime) / 1000);
        tapTimer.textContent = `Time: ${elapsedSeconds}s`;
    };

    const startTapTimer = () => {
        tapStartTime = Date.now();
        tapTimer.style.display = 'block';
        tapTimerInterval = setInterval(updateTapTimer, 1000);
    };

    const stopTapTimer = () => {
        clearInterval(tapTimerInterval);
        tapTimer.style.display = 'none';
    };

    // Start the timer when the home page is clicked
    homePage.addEventListener('click', function () {
        if (!tapTimerInterval) {
            startTapTimer();
        }
    });

    // Stop the timer when the home page is hidden
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            stopTapTimer();
        });
    });
});

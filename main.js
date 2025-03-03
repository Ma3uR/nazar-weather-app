// Функція оновлення дати
function updateCurrentDate() {
    const dateElement = document.querySelector('.date');
    const now = new Date();
    const months = [
        'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
        'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
    ];
    dateElement.textContent = `Станом на ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// Оновлюємо дату при завантаженні та кожну хвилину
updateCurrentDate();
setInterval(updateCurrentDate, 60000);

// Показ повідомлення подяки при завантаженні
window.addEventListener('load', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.classList.add('show');
    
    // Приховати повідомлення через 3 секунди
    setTimeout(() => {
        welcomeMessage.classList.remove('show');
    }, 3000);
});

// Налаштування
const nameInput = document.getElementById('nameInput');
const themeSelect = document.getElementById('themeSelect');
const unitsSelect = document.getElementById('unitsSelect');

// Завантаження збережених налаштувань
window.addEventListener('load', () => {
    // Завантаження імені
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        nameInput.value = savedName;
    }

    // Завантаження теми
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
        themeSelect.value = savedTheme;
        document.body.className = savedTheme + '-theme';
    }

    // Завантаження одиниць виміру
    const savedUnits = localStorage.getItem('userUnits');
    if (savedUnits) {
        unitsSelect.value = savedUnits;
    }
});

// Збереження налаштувань при зміні
nameInput.addEventListener('input', () => {
    localStorage.setItem('userName', nameInput.value);
});

themeSelect.addEventListener('change', () => {
    const selectedTheme = themeSelect.value;
    localStorage.setItem('userTheme', selectedTheme);
    document.body.className = selectedTheme + '-theme';
});

unitsSelect.addEventListener('change', () => {
    localStorage.setItem('userUnits', unitsSelect.value);
    // Оновлюємо погоду при зміні одиниць виміру
    getCurrentWeather();
    getWeeklyForecast();
});

// Обробка оцінок
const submitRatingBtn = document.querySelector('.submit-rating');
const thankYouMessage = document.querySelector('.thank-you-message');
const ratingSection = document.querySelector('.rating-section');

submitRatingBtn.addEventListener('click', function() {
    if (document.querySelector('input[name="rating"]:checked')) {
        ratingSection.classList.add('submitted');
        thankYouMessage.classList.add('show');
        this.disabled = true;
    }
});

// Меню налаштувань
const settingsBtn = document.querySelector('.settings-btn');
const settingsMenu = document.querySelector('.settings-menu');
const closeSettings = document.querySelector('.close-settings');

settingsBtn.addEventListener('click', () => {
    settingsMenu.classList.add('active');
});

closeSettings.addEventListener('click', () => {
    settingsMenu.classList.remove('active');
});

// Закриття меню при кліку поза ним
document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsMenu.classList.remove('active');
    }
}); 
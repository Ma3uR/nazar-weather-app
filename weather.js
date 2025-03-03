// Змінюємо константи на змінні
let CITY = 'Cherkasy';
let COUNTRY = 'UA';
const WEATHER_API_KEY = '53688d3bf952f07624952c34d4576678';

document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.querySelector('.container');
    const locationSetup = document.getElementById('locationSetup');
    const geoStep = document.getElementById('geoStep');
    const countryStep = document.getElementById('countryStep');
    const cityStep = document.getElementById('cityStep');
    const continueButton = document.getElementById('continueButton');
    
    // Приховуємо основний контент при завантаженні
    mainContent.style.display = 'none';

    // Список популярних країн з містами
    const popularCountries = [
        { 
            code: 'UA', 
            name: 'Україна', 
            flag: '🇺🇦',
            cities: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Львів', 'Черкаси', 'Полтава']
        },
        { 
            code: 'PL', 
            name: 'Польща', 
            flag: '🇵🇱',
            cities: ['Варшава', 'Краків', 'Лодзь', 'Вроцлав', 'Познань']
        },
        // Додайте інші країни за потребою
    ];

    let selectedCountry = null;

    // Обробник для кнопки ручного вибору
    document.getElementById('manualButton').addEventListener('click', () => {
        geoStep.style.display = 'none';
        countryStep.style.display = 'block';
        showCountryList();
    });

    // Функція показу списку країн
    function showCountryList() {
        const countriesList = document.querySelector('.countries-list');
        countriesList.innerHTML = '';
        
        popularCountries.forEach(country => {
            const countryElement = document.createElement('div');
            countryElement.className = 'country-item';
            countryElement.innerHTML = `${country.flag} ${country.name}`;
            
            countryElement.addEventListener('click', () => {
                selectedCountry = country;
                showCityStep(country);
                
                // Видаляємо попередній вибір
                document.querySelectorAll('.country-item').forEach(item => {
                    item.classList.remove('selected');
                });
                countryElement.classList.add('selected');
            });
            
            countriesList.appendChild(countryElement);
        });
    }

    // Функція показу списку міст
    function showCityStep(country) {
        countryStep.style.display = 'none';
        cityStep.style.display = 'block';
        
        const citiesList = document.querySelector('.cities-list');
        citiesList.innerHTML = '';
        
        country.cities.forEach(cityName => {
            const cityElement = document.createElement('div');
            cityElement.className = 'city-item';
            cityElement.textContent = cityName;
            
            cityElement.addEventListener('click', () => {
                CITY = cityName;
                COUNTRY = country.code;
                
                // Видаляємо попередній вибір
                document.querySelectorAll('.city-item').forEach(item => {
                    item.classList.remove('selected');
                });
                cityElement.classList.add('selected');
                continueButton.style.display = 'block';
            });
            
            citiesList.appendChild(cityElement);
        });
    }

    // Пошук по країнах
    document.getElementById('countrySearch').addEventListener('input', function(e) {
        const searchText = e.target.value.toLowerCase();
        const filteredCountries = popularCountries.filter(country => 
            country.name.toLowerCase().includes(searchText)
        );
        
        const countriesList = document.querySelector('.countries-list');
        countriesList.innerHTML = '';
        
        filteredCountries.forEach(country => {
            const countryElement = document.createElement('div');
            countryElement.className = 'country-item';
            countryElement.innerHTML = `${country.flag} ${country.name}`;
            
            countryElement.addEventListener('click', () => {
                selectedCountry = country;
                showCityStep(country);
            });
            
            countriesList.appendChild(countryElement);
        });
    });

    // Пошук по містах
    document.getElementById('citySearch').addEventListener('input', function(e) {
        if (!selectedCountry) return;
        
        const searchText = e.target.value.toLowerCase();
        const filteredCities = selectedCountry.cities.filter(city => 
            city.toLowerCase().includes(searchText)
        );
        
        const citiesList = document.querySelector('.cities-list');
        citiesList.innerHTML = '';
        
        filteredCities.forEach(cityName => {
            const cityElement = document.createElement('div');
            cityElement.className = 'city-item';
            cityElement.textContent = cityName;
            
            cityElement.addEventListener('click', () => {
                CITY = cityName;
                COUNTRY = selectedCountry.code;
                continueButton.style.display = 'block';
            });
            
            citiesList.appendChild(cityElement);
        });
    });

    // Обробник для кнопки "Далі"
    continueButton.addEventListener('click', () => {
        locationSetup.style.display = 'none';
        mainContent.style.display = 'block';
        getCurrentWeather();
        getWeeklyForecast();
    });

    // Оновлюємо обробник для кнопки геолокації
    document.getElementById('geoButton').addEventListener('click', function() {
        const button = this;
        
        if (navigator.geolocation) {
            // Додаємо клас завантаження
            button.classList.add('loading');
            button.innerHTML = '<i>🔄</i> Визначаємо місцезнаходження...';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Отримуємо місто за координатами
                    fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&limit=1&appid=${WEATHER_API_KEY}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data[0]) {
                                CITY = data[0].name;
                                COUNTRY = data[0].country;
                                showMainContent();
                            }
                        })
                        .catch(() => {
                            button.classList.remove('loading');
                            button.innerHTML = '<i>📍</i> Спробувати ще раз';
                            alert('Не вдалося визначити місто. Будь ласка, оберіть місто вручну.');
                            showCountryStep();
                        });
                },
                (error) => {
                    button.classList.remove('loading');
                    button.innerHTML = '<i>📍</i> Спробувати ще раз';
                    alert('Не вдалося визначити місцезнаходження. Оберіть країну вручну.');
                    showCountryStep();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            alert('Ваш браузер не підтримує геолокацію. Оберіть країну вручну.');
            showCountryStep();
        }
    });
});

// Функція для конвертації температури
function convertTemperature(celsius, unit) {
    if (unit === 'fahrenheit') {
        return Math.round((celsius * 9/5) + 32);
    }
    return Math.round(celsius);
}

// Функція для отримання поточної погоди
async function getCurrentWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=metric&appid=${WEATHER_API_KEY}&lang=ua`);
        const data = await response.json();
        
        const unit = document.getElementById('unitsSelect').value;
        const tempElement = document.querySelector('.degrees');
        const feelsLikeElement = document.querySelector('.temperature p');
        const windElement = document.querySelector('.info-item:nth-child(1) span');
        const humidityElement = document.querySelector('.info-item:nth-child(2) span');
        const pressureElement = document.querySelector('.info-item:nth-child(3) span');

        if (data.main) {
            const temp = convertTemperature(data.main.temp, unit);
            const feelsLike = convertTemperature(data.main.feels_like, unit);
            const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

            tempElement.textContent = `${temp}${unitSymbol}`;
            feelsLikeElement.textContent = `Відчувається як ${feelsLike}${unitSymbol}`;
            windElement.textContent = `${Math.round(data.wind.speed)} м/с`;
            humidityElement.textContent = `${data.main.humidity}%`;
            const pressureInMmHg = Math.round(data.main.pressure * 0.750062);
            pressureElement.textContent = `${pressureInMmHg} мм`;
        }
    } catch (error) {
        console.error('Помилка отримання поточної погоди:', error);
    }
}

// Функція для отримання прогнозу на тиждень
async function getWeeklyForecast() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY}&units=metric&appid=${WEATHER_API_KEY}&lang=ua`);
        const data = await response.json();
        const unit = document.getElementById('unitsSelect').value;
        
        if (data.list) {
            const dailyForecasts = {};
            const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
            const today = new Date().getDay();
            
            const nextDays = [];
            for (let i = 0; i < 5; i++) {
                const dayIndex = (today + i) % 7;
                nextDays.push(days[dayIndex]);
            }
            
            data.list.forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const dayName = days[date.getDay()];
                
                if (nextDays.includes(dayName)) {
                    if (!dailyForecasts[dayName]) {
                        dailyForecasts[dayName] = {
                            temp: forecast.main.temp,
                            count: 1,
                            weather: forecast.weather[0].icon,
                            description: forecast.weather[0].description,
                            pop: forecast.pop // Ймовірність опадів
                        };
                    } else {
                        dailyForecasts[dayName].temp += forecast.main.temp;
                        dailyForecasts[dayName].count += 1;
                        // Беремо максимальну ймовірність опадів за день
                        dailyForecasts[dayName].pop = Math.max(dailyForecasts[dayName].pop, forecast.pop);
                    }
                }
            });

            const forecastContainer = document.querySelector('.forecast-days');
            forecastContainer.innerHTML = '';

            nextDays.forEach((dayName) => {
                const forecast = dailyForecasts[dayName];
                if (forecast) {
                    const avgTemp = forecast.temp / forecast.count;
                    const temp = convertTemperature(avgTemp, unit);
                    const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';
                    const popPercentage = Math.round(forecast.pop * 100);
                    
                    const dayElement = document.createElement('div');
                    dayElement.className = 'day';
                    dayElement.innerHTML = `
                        <p>${dayName}</p>
                        <i>${getWeatherEmoji(forecast.weather)}</i>
                        <span>${temp}${unitSymbol}</span>
                        <div class="pop-info">
                            <span class="pop-icon">☔</span>
                            <span>${popPercentage}%</span>
                        </div>
                    `;
                    forecastContainer.appendChild(dayElement);
                }
            });
        }
    } catch (error) {
        console.error('Помилка отримання прогнозу на тиждень:', error);
    }
}

// Функція для конвертації коду погоди в емодзі
function getWeatherEmoji(iconCode) {
    const weatherIcons = {
        '01d': '☀️', // ясно (день)
        '01n': '🌙', // ясно (ніч)
        '02d': '🌤️', // малохмарно (день)
        '02n': '☁️', // малохмарно (ніч)
        '03d': '☁️', // хмарно
        '03n': '☁️',
        '04d': '☁️', // похмуро
        '04n': '☁️',
        '09d': '🌧️', // дощ
        '09n': '🌧️',
        '10d': '🌦️', // дощ з проясненнями
        '10n': '🌧️',
        '11d': '⛈️', // гроза
        '11n': '⛈️',
        '13d': '🌨️', // сніг
        '13n': '🌨️',
        '50d': '🌫️', // туман
        '50n': '🌫️'
    };
    return weatherIcons[iconCode] || '🌡️';
}

// Додаємо обробник зміни одиниць виміру
document.getElementById('unitsSelect').addEventListener('change', function() {
    getCurrentWeather();
    getWeeklyForecast();
});

// Оновлення погоди при завантаженні та кожні 30 хвилин
window.addEventListener('load', () => {
    getCurrentWeather();
    getWeeklyForecast();
    
    setInterval(() => {
        getCurrentWeather();
        getWeeklyForecast();
    }, 1800000);
});

// Додаємо функцію для створення конфеті
function createConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container active';
    document.body.appendChild(container);

    const emojis = ['🎉', '🎊', '✨', '⭐', '🌟'];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

    // Створюємо 50 елементів конфеті
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
        
        // Випадково обираємо емодзі або кольоровий квадрат
        if (Math.random() > 0.5) {
            confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        } else {
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
        }

        container.appendChild(confetti);
    }

    // Видаляємо контейнер після завершення анімації
    setTimeout(() => {
        container.remove();
    }, 5000);
}

// Додаємо обробник для зірок
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.stars input');
    stars.forEach(star => {
        star.addEventListener('change', (e) => {
            if (e.target.value === '5') {
                createConfetti();
            }
        });
    });
});

// Функція для отримання історичних даних
async function getHistoricalWeather(daysAgo) {
    try {
        const historyData = [];
        for (let i = 1; i <= daysAgo; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const timestamp = Math.floor(date.getTime() / 1000);

            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=metric&appid=${WEATHER_API_KEY}&lang=ua&dt=${timestamp}`);
            const data = await response.json();

            if (data) {
                historyData.push({
                    temp: data.main.temp,
                    weather: data.weather[0].icon,
                    date: date,
                    humidity: data.main.humidity,
                    pressure: data.main.pressure,
                    wind: data.wind.speed,
                    description: data.weather[0].description
                });
            }
        }
        return historyData;
    } catch (error) {
        console.error('Помилка отримання історичних даних:', error);
        throw error;
    }
}

// Функція для відображення історичних даних
function displayHistoricalData(data, container) {
    const dayNames = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
    const dayElement = document.createElement('div');
    dayElement.className = 'historical-day';
    
    const date = new Date(data.date);
    const formattedDate = `${date.getDate()}.${date.getMonth() + 1}`;
    
    dayElement.innerHTML = `
        <div class="historical-date">
            <p>${dayNames[date.getDay()]}</p>
            <span>${formattedDate}</span>
        </div>
        <div class="historical-weather">
            <i>${getWeatherEmoji(data.weather)}</i>
            <span class="temp">${Math.round(data.temp)}°C</span>
            <p class="description">${data.description}</p>
        </div>
        <div class="historical-details">
            <div><i>💨</i> ${Math.round(data.wind)} м/с</div>
            <div><i>💧</i> ${data.humidity}%</div>
            <div><i>📊</i> ${Math.round(data.pressure * 0.750062)} мм</div>
        </div>
    `;
    
    container.appendChild(dayElement);
}

// Додаємо кнопку для перегляду історії
document.querySelector('.weather-card').insertAdjacentHTML('beforeend', `
    <div class="historical-section">
        <h3>Історія погоди</h3>
        <div class="history-buttons">
            <button class="show-history-btn">Показати історію</button>
            <button class="hide-history-btn" style="display: none;">Сховати</button>
        </div>
        <div class="historical-container"></div>
    </div>
`);

// Обробник для кнопки історії
document.querySelector('.show-history-btn').addEventListener('click', async function() {
    const container = document.querySelector('.historical-container');
    const hideBtn = document.querySelector('.hide-history-btn');
    
    try {
        this.style.display = 'none';
        hideBtn.style.display = 'block';
        container.innerHTML = '<div class="loading">Завантаження історії...</div>';
        
        const historyData = await getHistoricalWeather(5);
        
        if (historyData && historyData.length > 0) {
            container.innerHTML = '';
            historyData.forEach(data => displayHistoricalData(data, container));
        } else {
            throw new Error('Немає даних');
        }
    } catch (error) {
        container.innerHTML = '<div class="error">Помилка завантаження даних</div>';
        this.style.display = 'block';
        hideBtn.style.display = 'none';
    }
});

document.querySelector('.hide-history-btn').addEventListener('click', function() {
    const container = document.querySelector('.historical-container');
    const showBtn = document.querySelector('.show-history-btn');
    
    container.innerHTML = '';
    this.style.display = 'none';
    showBtn.style.display = 'block';
});

// Оновлюємо функцію відкриття налаштувань або додаємо новий код
document.querySelector('.settings-btn').addEventListener('click', function() {
    const settingsHtml = `
        <div class="settings-content">
            <h3>Налаштування</h3>
            <div class="settings-group">
                <label for="nameInput">Ім'я:</label>
                <input type="text" id="nameInput" placeholder="Введіть ваше ім'я">
            </div>
            <div class="settings-group">
                <label for="themeSelect">Тема:</label>
                <select id="themeSelect">
                    <option value="light">Світла</option>
                    <option value="dark">Темна</option>
                </select>
            </div>
            <div class="settings-group">
                <label for="unitsSelect">Одиниці виміру:</label>
                <select id="unitsSelect">
                    <option value="celsius">°C</option>
                    <option value="fahrenheit">°F</option>
                </select>
            </div>
            <div class="telegram-link">
                <a href="https://t.me/Vidgyku_na_temy_saita" target="_blank">
                    <i>📱</i> Відгуки сайту
                </a>
            </div>
        </div>
    `;
    
    // Показуємо модальне вікно з налаштуваннями
    showModal(settingsHtml);
});
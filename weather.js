// Конфігурація API
const WEATHER_API_KEY = '53688d3bf952f07624952c34d4576678'; // Потрібно буде замінити на реальний ключ
const CITY = 'Cherkasy';
const COUNTRY = 'UA';

// Функція для отримання поточної погоди
async function getCurrentWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CITY},${COUNTRY}&units=metric&appid=${WEATHER_API_KEY}&lang=ua`);
        const data = await response.json();
        
        // Оновлення поточної температури та інших показників
        const tempElement = document.querySelector('.degrees');
        const feelsLikeElement = document.querySelector('.temperature p');
        const windElement = document.querySelector('.info-item:nth-child(1) span');
        const humidityElement = document.querySelector('.info-item:nth-child(2) span');
        const pressureElement = document.querySelector('.info-item:nth-child(3) span');

        if (data.main) {
            tempElement.textContent = `${Math.round(data.main.temp)}°C`;
            feelsLikeElement.textContent = `Відчувається як ${Math.round(data.main.feels_like)}°C`;
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
                    const popPercentage = Math.round(forecast.pop * 100); // Конвертуємо в відсотки
                    const dayElement = document.createElement('div');
                    dayElement.className = 'day';
                    dayElement.innerHTML = `
                        <p>${dayName}</p>
                        <i>${getWeatherEmoji(forecast.weather)}</i>
                        <span>${Math.round(avgTemp)}°C</span>
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
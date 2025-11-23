const API_KEY = '660be1c8d50bca9e3b8abf2c6048ce8b'; 
const INPUT_ELEMENT = document.getElementById('city-input');
const BUTTON_ELEMENT = document.getElementById('SPR');

const CURRENT_OUTPUT = document.getElementById('pogoda-biezaca');
const JUTRO_OUTPUT = document.getElementById('jutro');
const POJUTRZE_OUTPUT = document.getElementById('pojutrze');

// ----------------------------------------------------------------------
// A. Bieżąca pogoda (XMLHttpRequest)
// ----------------------------------------------------------------------
function getCurrentWeather(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;
    
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                console.log('Current Weather Data (XMLHttpRequest):', data);
                displayCurrentWeather(data);
            } else {
                CURRENT_OUTPUT.innerHTML = `<p class="error-msg">Błąd XHR: Nie udało się pobrać bieżącej pogody. Status: ${xhr.status}</p>`;
            }
        }
    };

    xhr.open('GET', url, true); 
    xhr.send();
}

function displayCurrentWeather(data) {
    if (data.cod !== 200) {
        CURRENT_OUTPUT.innerHTML = `<p class="error-msg">Nie znaleziono miejscowości: ${data.message}</p>`;
        return;
    }

    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; 

    const html = `
        <div class="weather-box-current">
            <h2>Aktualna pogoda w ${data.name}</h2>
            <div class="current-details">
                <img src="${iconUrl}" alt="${data.weather[0].description}" style="width:70px;height:70px;">
                <p><strong>${Math.round(data.main.temp)}°C</strong></p>
                <p> ${data.weather[0].description}</p>
            </div>
        </div>
    `;
    CURRENT_OUTPUT.innerHTML = html;
}

// ----------------------------------------------------------------------
// B. Prognoza na jutro i pojutrze (Fetch API)
// ----------------------------------------------------------------------
function getForecast(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;

    JUTRO_OUTPUT.innerHTML = '<h2>Prognoza na jutro</h2><p>Ładowanie danych...</p>';
    POJUTRZE_OUTPUT.innerHTML = '<h2>Prognoza na pojutrze</h2><p>Ładowanie danych...</p>';

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Błąd HTTP: ${response.status}. Sprawdź nazwę miasta.`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Forecast Data (Fetch API):', data);
            displayForecastDays(data);
        })
        .catch(error => {
            JUTRO_OUTPUT.innerHTML = `<p class="error-msg">Nie udało się pobrać prognozy. ${error.message}</p>`;
            POJUTRZE_OUTPUT.innerHTML = '';
        });
}

function generateHourlyHtml(forecastArray, filterHours) {
    if (forecastArray.length === 0) {
        return '<p>Brak danych prognozy na ten okres.</p>';
    }
    
    const filteredArray = forecastArray.filter((item, index) => index % filterHours === 0 || index === 0);

    return filteredArray.map(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`; 
        
        return `
            <div class="hourly-item">
                <p><strong>${time}</strong></p>
                <img src="${iconUrl}" alt="${item.weather[0].description}" style="width:40px;height:40px;">
                <p><strong>${Math.round(item.main.temp)}°C</strong></p>
                <p class="description">${item.weather[0].description}</p>
            </div>
        `;
    }).join('');
}

function displayForecastDays(data) {
    if (data.cod !== "200") {
        JUTRO_OUTPUT.innerHTML = `<p class="error-msg">Błąd API: ${data.message}</p>`;
        POJUTRZE_OUTPUT.innerHTML = '';
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const jutro = new Date(today);
    jutro.setDate(jutro.getDate() + 1);
    
    const pojutrze = new Date(jutro);
    pojutrze.setDate(pojutrze.getDate() + 1);

    const dzien3 = new Date(pojutrze);
    dzien3.setDate(dzien3.getDate() + 1); 

    const forecastList = data.list;

    // 1. Filtrowanie na jutro
    const jutroForecast = forecastList.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= jutro && itemDate < pojutrze;
    });

    // 2. Filtrowanie na pojutrze
    const pojutrzeForecast = forecastList.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= pojutrze && itemDate < dzien3;
    });

    const filterHours = 1; 

    JUTRO_OUTPUT.innerHTML = `
        <h2>Prognoza godzinowa na jutro (${jutro.toLocaleDateString('pl-PL')})</h2>
        <div class="hourly-grid">
            ${generateHourlyHtml(jutroForecast, filterHours)}
        </div>
    `;

    POJUTRZE_OUTPUT.innerHTML = `
        <h2>Prognoza godzinowa na pojutrze (${pojutrze.toLocaleDateString('pl-PL')})</h2>
        <div class="hourly-grid">
            ${generateHourlyHtml(pojutrzeForecast, filterHours)}
        </div>
    `;
}

// ----------------------------------------------------------------------
// C. Główna funkcja wywoływana po kliknięciu przycisku
// ----------------------------------------------------------------------
function handleSearch() {
    const cityName = INPUT_ELEMENT.value.trim();

    if (cityName.length === 0) {
        alert('Proszę wpisać nazwę miejscowości!');
        return;
    }

    CURRENT_OUTPUT.innerHTML = '<p>Ładowanie bieżącej pogody...</p>';
    JUTRO_OUTPUT.innerHTML = '<h2>Prognoza na jutro</h2><p>Ładowanie danych...</p>';
    POJUTRZE_OUTPUT.innerHTML = '<h2>Prognoza na pojutrze</h2><p>Ładowanie danych...</p>';

    // Wykonanie obu żądań
    getCurrentWeather(cityName);
    getForecast(cityName);
}

// ----------------------------------------------------------------------
// D. Rejestracja zdarzenia
// ----------------------------------------------------------------------
BUTTON_ELEMENT.addEventListener('click', handleSearch);
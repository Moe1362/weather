let searchForWeather = [];
const weatherBase = "https://api.openweathermap.org";
const apiKey = "5bfa6b53d9ce074ff8c14f7144f1c1c3";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const todayContainer = document.querySelector("#today");
const forecastContainer = document.querySelector("#forecast");
const weatherHistoryContainer = document.querySelector("#weather-history");

const displayCurrentWeather = (city, weatherData) => {
    const date = dayjs().format("M/D/YYYY");
    const tempF = weatherData.main.temp;
    const windMph = weatherData.wind.speed;
    const humidity = weatherData.main.humidity;
    const iconUrl = `https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`;
    const iconDescription = weatherData.weather[0].description || "No Description";


    const card = document.createElement("section");
    const cardBody = document.createElement("section");
    const heading = document.createElement("h1");
    const weatherIcon = document.createElement("img");
    const temperatureEl = document.createElement("p");
    const windEl = document.createElement("p");
    const humidityEl = document.createElement("p");


    card.setAttribute("class", "card bg-secondary p-2 text-dark text-opacity-10  rounded-end mb-3 fw-semibold ");
    cardBody.setAttribute("class", "card-body fs-3 text-dark text-opacity-50 ");
    card.append(cardBody);

    heading.setAttribute("class", "h1 card-title text-dark ");
    temperatureEl.setAttribute("class", "card-text");
    windEl.setAttribute("class", "card-text");
    humidityEl.setAttribute("class", "card-text");

    heading.textContent = `${city} (${date})`;
    weatherIcon.setAttribute("src", iconUrl);
    weatherIcon.setAttribute("alt", iconDescription);
    heading.append(weatherIcon);
    temperatureEl.textContent = `Tempreture 🌡️: ${tempF} °F`;
    windEl.textContent = `Wind 🌬️: ${windMph} MPH`;
    humidityEl.textContent = `Humidity 💦: ${humidity} %`;
    cardBody.append(heading, temperatureEl, windEl, humidityEl);

    todayContainer.innerHTML = "";
    todayContainer.append(card);

}

const createForecastCard = (forecastData) => {
    const iconUrl = `https://openweathermap.org/img/w/${forecastData.weather[0].icon}.png`;
    const iconDescription = forecastData.weather[0].description || "No description";
    const temperature = forecastData.main.temp;
    const wind = forecastData.wind.speed;
    const humidity = forecastData.main.humidity;

    const column = document.createElement("section");
    const card = document.createElement("section");
    const cardBody = document.createElement("section");
    const cardTitle = document.createElement("h5");
    const weatherIcon = document.createElement("img");
    const temperatureElement = document.createElement("p");
    const windElement = document.createElement("p");
    const humidityElement = document.createElement("p");

    column.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, temperatureElement, windElement, humidityElement);

    column.setAttribute("class", "col-md");
    column.classList.add("five-day-card");
    card.setAttribute("class", "card bg-secondary text-dark");
    cardBody.setAttribute("class", "card-body");
    temperatureElement.setAttribute("class", "card-text");
    humidityElement.setAttribute("class", "card-text");
    windElement.setAttribute("class", "card-text");

    cardTitle.textContent = dayjs(forecastData.dt_txt).format("M/D/YYYY");
    weatherIcon.setAttribute("src", iconUrl);
    weatherIcon.setAttribute("alt", iconDescription);

    temperatureElement.textContent = `Temp 🌡️: ${temperature} °F`;
    windElement.textContent = `Wind 🌬️: ${wind} MPH`;
    humidityElement.textContent = `Humidity 💦: ${humidity} %`;


    forecastContainer.append(column);







}

const displayForecast = (weatherData) => {
    const startDate = dayjs().add(1, "day").startOf("day").unix();
    const endDate = dayjs().add(6, "day").startOf("day").unix();

    const headingCol = document.createElement("section");
    const heading = document.createElement("h3");
    headingCol.setAttribute("class", "col-12");
    heading.textContent = "5-Day Forecast:";
    headingCol.append(heading);

    forecastContainer.innerHTML = "";
    forecastContainer.append(headingCol);

    for(let i=0;i<weatherData.length;i++){
        if(weatherData[i].dt >= startDate && weatherData[i].dt < endDate) {
            if(weatherData[i].dt_txt.slice(11,13) === "12"){
                

                createForecastCard(weatherData[i]);
                
            }
        }
    }


}   






const fetchWeather = (location) => {
    const latitude = location.lat;
    const longitude = location.lon;

    const city = location.name;
    //https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
    const apiURL = `${weatherBase}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
    fetch(apiURL).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        displayCurrentWeather(city, data.list[0]);
        displayForecast(data.list);
    }).catch(function (error) {
        console.log(error);
    });
}

const createSearchHistory = () => {
    weatherHistoryContainer.innerHTML = "";
    for (let i = 0; i < searchForWeather.length; i++) {
        const buttonEl = document.createElement("button");
        buttonEl.setAttribute("id", "city-button");
        buttonEl.setAttribute("type", "button");
        buttonEl.setAttribute("class", "btn btn-secondary btn-lg text-dark");
        buttonEl.setAttribute("aria-controls", "today forecast");
        buttonEl.classList.add("history-button");
        buttonEl.setAttribute("data-search", searchForWeather[i]);
        buttonEl.textContent = searchForWeather[i];
        weatherHistoryContainer.append(buttonEl);

    }

}

const appendWeatherHistory = (search) => {
    if (searchForWeather.indexOf(search) !== -1) {
        return;
    }
    searchForWeather.push(search);
    localStorage.setItem("weatherHistory", JSON.stringify(searchForWeather));
    createSearchHistory();
}

const fetchCoordinates = (search) => {
    //http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
    const url = `${weatherBase}/geo/1.0/direct?q=${search}&appid=${apiKey}`;
    fetch(url).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (!data[0]) {
            alert("City not found");
        } else {
            console.log(data);
            appendWeatherHistory(search);
            fetchWeather(data[0]);
        }


    }).catch(function (error) {
        console.log(error);
    });
}



const handleSearchFormSubmit = (event) => {
    event.preventDefault();

    const search = searchInput.value.trim();
    if (search) {
        fetchCoordinates(search);
    }
    searchInput.value = "";
}

const initializeSearchHistory = () => {
    const storedWeatherHistory = JSON.parse(localStorage.getItem("weatherHistory"));
    if (storedWeatherHistory) {
        searchForWeather = storedWeatherHistory;
    }
    createSearchHistory();
}

const handleSearchHistoryClick = (event) => {
    if (!event.target.matches(".history-button")) {
        return;
    }
    const buttonEl = event.target;

    const search = buttonEl.getAttribute("data-search");
    fetchCoordinates(search);
}

initializeSearchHistory();

searchForm.addEventListener("submit", handleSearchFormSubmit);
weatherHistoryContainer.addEventListener("click", handleSearchHistoryClick);




const form = document.querySelector("form");
const input = document.querySelector("input");
const weatherDiv = document.querySelector(".weather");
var isCelsius = true;
const apiKey = "ca8e21b89659e03af9b59c2ba194cd4d";

const songsDiv = document.querySelector(".songRecs");
// Define your Spotify API credentials
const clientId = "63d784ca405b4e9fbdbd1917d04c5624";
const clientSecret = "00b59682ec1d4145a36b8bc73c3fc086";

// Fetch access token from Spotify's API using client credentials flow
async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  return data.access_token;
}

// Call the main function after fetching weather data
// form.addEventListener("submit", async (event) => {
// 	event.preventDefault();
// 	const cityName = input.value.trim();
// 	const weatherData = await getWeather(cityName);
// 	main(weatherData);
//   });
// Call the main function after fetching weather data
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const cityName = event.target.elements["city"].value.trim(); // Adjust "city" to match the name attribute of your input field
  console.log(cityName)
  const weatherData = await getWeather(cityName);
  main(weatherData);
});

 
  async function getWeather(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      showWeather(data);
      // mapWeatherToMood(data);
      return data; // Return weather data
    } catch (error) {
      console.log("Error:", error);
    }
    }

    function showWeather(data) {
      console.log("in showWeather")
      if (!data || !data.main || !data.main.temp || !data.weather || !data.weather[0] || !data.weather[0].description) {
        console.error("Invalid weather data:", data);
        return; // Exit early if data is invalid or missing properties
      }
    
      if (data.cod === "404") {
        // show error message and hide weather data
        weatherDiv.innerHTML = `
      <div class="weather-content">
      <p id="error-message" style="display: block;">404 ERROR<br>City not found</p>
      </div`;
      } else {
        const cityName = data.name;
    
        // Check if 'isCelsius' is defined before using it
        let temperature;
        let feels_like;
        if (isCelsius) {
          temperature = data.main.temp + "°C";
          feels_like = data.main.feels_like + "°C";
        } else {
          temperature = (data.main.temp * 9) / 5 + 32 + "°F";
          feels_like = (data.main.feels_like * 9) / 5 + 32 + "°F";
        }
    
        const description = data.weather[0].description;
        console.log(description + " in showWeather ")
        const humidity = data.main.humidity;
        const imgsrc = "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    
        weatherDiv.innerHTML = `
      <h2 class="mb-3"><svg class="loc-icon"  xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-fill" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4 4a4 4 0 1 1 4.5 3.969V13.5a.5.5 0 0 1-1 0V7.97A4 4 0 0 1 4 3.999zm2.493 8.574a.5.5 0 0 1-.411.575c-.712.118-1.28.295-1.655.493a1.319 1.319 0 0 0-.37.265.301.301 0 0 0-.057.09V14l.002.008a.147.147 0 0 0 .016.033.617.617 0 0 0 .145.15c.165.13.435.27.813.395.751.25 1.82.414 3.024.414s2.273-.163 3.024-.414c.378-.126.648-.265.813-.395a.619.619 0 0 0 .146-.15.148.148 0 0 0 .015-.033L12 14v-.004a.301.301 0 0 0-.057-.09 1.318 1.318 0 0 0-.37-.264c-.376-.198-.943-.375-1.655-.493a.5.5 0 1 1 .164-.986c.77.127 1.452.328 1.957.594C12.5 13 13 13.4 13 14c0 .426-.26.752-.544.977-.29.228-.68.413-1.116.558-.878.293-2.059.465-3.34.465s-2.462-.172-3.34-.465c-.436-.145-.826-.33-1.116-.558C3.26 14.752 3 14.426 3 14c0-.599.5-1 .961-1.243.505-.266 1.187-.467 1.957-.594a.5.5 0 0 1 .575.411z"/>
      </svg> ${cityName}</h2>
      <img class="weather-icon style="width: 50px; margin-bottom: 10px;"" src="${imgsrc}">
      <div class="weather-content">
      <p>${temperature} with ${description} </p>
      <p>feels like ${feels_like} </p>
      <p>${humidity}% humidity</p>
      </div>
      `;
    
        weatherDiv.style.display = "block";
      }
    }
    

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  getWeatherLatLon(latitude, longitude);
}

async function getWeatherLatLon(lat, lon) {
  console.log(" in getWeatherLatLon");
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    showWeather(data);

    main(data);
  } catch (error) {
    console.log("Error:", error);
  }
}

// Fetch music recommendations from Spotify's recommendation API
async function fetchSpotifyRecommendations(accessToken, mood) {
  const response = await fetch(
    `https://api.spotify.com/v1/recommendations?limit=1&seed_genres=${mood}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }
  );

  const data = await response.json();
  return data.tracks; // Return recommended tracks
}

// Function to map weather conditions to Spotify moods
function mapWeatherToMood(weatherData) {
  const weatherDescription = weatherData.weather[0].description.toLowerCase();
  console.log(weatherDescription + " in mapWeatherToMood ")

  if (
    weatherDescription.includes("rain") ||
    weatherDescription.includes("thunderstorm")
  ) {
    return "sad"; // Rainy weather
  } else if (weatherDescription.includes("snow")) {
    return "serene"; // Snowy weather
  } else if (
    weatherDescription.includes("clear") ||
    weatherDescription.includes("sunny")
  
  ) {
    return "happy"; // Sunny/clear weather
  } else if (weatherDescription.includes("wind")) {
    return "dynamic"; // Windy weather
  } else if (
    weatherDescription.includes("fog") ||
	weatherDescription.includes("clouds") ||

    weatherDescription.includes("mist")
  ) {
    return "sad"; // Foggy/misty weather
  } else {
    return "chill"; // Default mood for other weather conditions
  }
}

// Example usage
async function main(weatherData) {
  const accessToken = await getAccessToken();
  const mood = mapWeatherToMood(weatherData);
  console.log(mood);
  const recommendations = await fetchSpotifyRecommendations(accessToken, mood);
  console.log(recommendations[0].album.images[0].url);
  const songImg = document.getElementById("cover");
  songImg.src = recommendations[0].album.images[0].url;
  songImg.alt = `Album art for ${recommendations[0].name}`;
  const songTitle = document.getElementById("title");
  songTitle.textContent = ` ${recommendations[0].name}`;
  const songArtist = document.getElementById("artist");
  songArtist.textContent = `by ${recommendations[0].artists[0].name}`;
  const duration = document.getElementById("time");
  duration.textContent =
    Math.floor((recommendations[0].duration_ms / 1000 / 60) % 60) + `:00`;
  const audioPlayer = document.getElementById("audio-player");
  console.log(recommendations[0].external_urls);
  const pauseButton = document.getElementById("pause-btn");
  audioPlayer.src = recommendations[0].preview_url;
  const spotLink=document.getElementById("spotify-btn")
  spotLink.href= recommendations[0].external_urls.spotify;
  const text=document.getElementById("song-text");
  text.textContent=`a ${mood} song to match a ${weatherData.weather[0].description.toLowerCase()} day..`;
  if (audioPlayer.src == null) {
    document.querySelector("error-text").textContent =
      "Sorry! There is no preview available";
  }
  pauseButton.addEventListener("click", function () {
    audioPlayer.paused ? audioPlayer.play() : audioPlayer.pause();
  });
}

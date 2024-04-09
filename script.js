document.addEventListener("DOMContentLoaded", function () {
    function fetchWeatherData(location) {
        const apiKey = '2cf28692fff4463e29fc09f122a35d33'; 
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch weather data');
                }
                return response.json();
            })
            .then(data => {
                const locationName = data.name;
                const temperature = Math.round(data.main.temp - 273.15); 
                const condition = data.weather[0].description;

                // Display data on the webpage
                document.querySelector('.location').textContent = `Location: ${locationName}`;
                document.querySelector('.temperature').textContent = `Temperature: ${temperature}°C`;
                document.querySelector('.condition').textContent = `Condition: ${condition}`;

                // Save data to a JSON file
                const weatherData = { locationName, temperature, condition };
                const jsonData = JSON.stringify(weatherData);
                saveJsonToFile(jsonData);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Failed to fetch weather data. Please try again.');
            });
    }

    function saveJsonToFile(jsonData) {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'weather_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Upload the file to S3
        uploadToS3(blob);
    }

    function uploadToS3(blob) {
        const bucketName = 'gayatri-weather-bucket'; 
        const region = 'ap-south-1'; 

        AWS.config.update({ region: region });
        const s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        const params = {
            Bucket: bucketName,
            Key: 'weather_data.json',
            Body: blob,
            ContentType: 'application/json',
            ACL: 'public-read'
        };

        /*s3.upload(params, function (err, data) {
            if (err) {
                console.error('Error uploading to S3:', err);
                alert('Failed to upload weather data to S3. Please try again.');
            } else {
                console.log('Upload successful:', data.Location);
                alert('Weather data uploaded to S3 successfully.');
            }
        });
        */
    }

    document.getElementById('searchButton').addEventListener('click', function () {
        const locationInput = document.getElementById('locationInput').value.trim();
        if (locationInput !== '') {
            fetchWeatherData(locationInput);
        } else {
            alert('Please enter a location.');
        }
    });
});

import express from "express"
import axios from "axios"
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.render("index.ejs");
});





app.post("/weather", async (req, res) => {

  try {
        const geoResult = await axios.get("https://nominatim.openstreetmap.org/search",
          {
          params: {
          q: req.body.location,
          format: "json",
          limit: 1,
          },

          headers: { 
            "User-Agent": "PeterWeatherApp/1.0 peteropeyemijohn@gmail.com"
          }
          
        },
        );

        console.log(geoResult.data); // to monitor API response in the console
        
  
        if (geoResult.data.length === 0) {
         return res.render("index.ejs", {result: "Location not found"});
        }


        const lat = Number( Number(geoResult.data[0].lat).toFixed(4) );
        const lon = Number( Number(geoResult.data[0].lon).toFixed(4) );

        console.log(lat, lon);


        const weatherResult = await axios.get("https://api.met.no/weatherapi/locationforecast/2.0/compact", {

          params: {lat, lon},

          headers: { 
            "User-Agent": "PeterWeatherApp/1.0 peteropeyemijohn@gmail.com"
          }
        });



        const timeZone = await axios.get("https://api.open-meteo.com/v1/forecast", {

        params: {
          latitude: lat,
          longitude: lon,
          timezone: "auto",
        },

        headers: {
          "User-Agent": "PeterWeatherApp/1.0 peteropeyemijohn@gmail.com"
        }
      });

      console.log(timeZone.data.timezone);


        

      // Weather result interpretation logic 


        const groupedByDay = {};
        const todayDate = new Date().toDateString();
        const locationTimeZone = timeZone.data.timezone;
        
        const localHour = new Date().toLocaleString("en-US", {
          timeZone: locationTimeZone,
          hour: "numeric",
          hour12: false
        });

        const isNight = localHour >= 18 || localHour < 6;




        let nowAssigned = false;
        let lastKnownSymbol = "cloudy"; 
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);



        weatherResult.data.properties.timeseries =
        weatherResult.data.properties.timeseries.map(entry => {     //".map" is used to add extra properties needed for a Java Script object by tapping into the existing properties values//

        const date = new Date(entry.time);
        const entryDateString = date.toDateString();

        // Default formatted time
        entry.displayTime = date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: locationTimeZone,
        });



        // Date Normalized
        const entryDate = new Date(entry.time);
        entryDate.setHours(0, 0, 0, 0);


        // Day label

        let dayLabel;

        if (entryDate.getTime() === today.getTime()) {
          dayLabel = "Today";
        } else if (entryDate.getTime() === tomorrow.getTime()) {
          dayLabel = "Tomorrow";
        } else {
          dayLabel = entryDate.toLocaleDateString([], {
            weekday: "long",
          });
        }

        entry.dayLabel = dayLabel;



        // Assign "Now" ONLY for today and ONLY once
        if (entryDateString === todayDate && !nowAssigned) {
          entry.displayTime = "Now";
          nowAssigned = true;
        }

        // Weather symbol fallback
        const symbol =
          entry.data.next_1_hours?.summary?.symbol_code ||
          entry.data.next_6_hours?.summary?.symbol_code ||
          entry.data.next_12_hours?.summary?.symbol_code;

        entry.symbol = symbol || lastKnownSymbol;
        if (symbol) lastKnownSymbol = symbol;

        // Group by day
        if (!groupedByDay[entry.dayLabel]) {
          groupedByDay[entry.dayLabel] = [];
        }

        groupedByDay[entry.dayLabel].push(entry);


        return entry;
      });



        res.render("index.ejs", {
          weather: weatherResult.data,
          location: geoResult.data[0].display_name,
          groupedByDay,
          isNight,

        });

        console.log(weatherResult.data);
        console.log(weatherResult.data.properties.timeseries[0]);
        console.log(weatherResult.data.properties.timeseries[0].data.instant); // to monitor API response in the console
        console.log(weatherResult.data.properties.timeseries[0].data.next_1_hours);
      



  } catch(error) {
    console.error(error.message);
    res.render("index.ejs", {result: "Unable to fetch weather data." });
  }

});



app.listen(port, () =>{
  console.log(`Server is running on port ${port}`);
});
import express from "express"
import axios from "axios"
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit"






const app = express();
app.set("trust proxy", 1); //enables express to see the real user IP for ratelimit//

const PORT =  3000;


const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 requests per IP per minute
  message: {
    error: "Too many requests. Please slow down."
  }
});


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(limiter);





const axiosConfig = {
      headers: { 
            "User-Agent": "Skycast/1.0 peteropeyemijohn@gmail.com"
          }
};




let cache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes




app.get("/", (req, res) => {
  res.render("index.ejs");
});




app.get("/suggest", async (req, res) => {
  const query = req.query.q?.trim();

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const response = await axios.get(
      "https://geocoding-api.open-meteo.com/v1/search",
      {
        params: {
          name: query,
          count: 30,
          language: "en",
          format: "json"
        }
      }
    );

    const results = response.data.results || [];

    const suggestions = results.map(r => ({
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude
    }));

    res.json(suggestions);

  } catch (error) {
    console.error("Suggestion error:", error.message);
    res.json([]);
  }
});





app.post("/weather", async (req, res) => {

  try {

    const lat = Number(req.body.lat);
    const lon = Number(req.body.lon);
    const locationName = req.body.displayName;

    if (!lat || !lon) {
      return res.render("index.ejs", {
        noLocation: "Location not found, try suggestions."
      });
    }

    const cacheKey = `${lat},${lon}`;
    const now = Date.now();

    if (cache[cacheKey] &&
        now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log("Serving from cache");
      return res.render("index.ejs", cache[cacheKey].data);
    }

    const weatherResult = await axios.get(
      "https://api.met.no/weatherapi/locationforecast/2.0/compact",
      {
        params: { lat, lon },
        ...axiosConfig
      }
    );

    const timeZone = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: lat,
          longitude: lon,
          timezone: "auto",
        },
        ...axiosConfig
      }
    );



        

      // Data processing layer


        const groupedByDay = {};
        const todayDate = new Date().toDateString();
        const locationTimeZone = timeZone.data.timezone;
        
        const localHour = new Date().toLocaleString("en-US", {
          timeZone: locationTimeZone,
          hour: "numeric",
          hour12: false
        });

        const isNight = localHour >= 19 || localHour < 7;




        let nowAssigned = false;
        let lastKnownSymbol = "cloudy"; 
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);


        //Add extra properties needed for a Java Script object by tapping into existing values//
        weatherResult.data.properties.timeseries =
        weatherResult.data.properties.timeseries.map(entry => { 
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


      const renderData = {
        weather: weatherResult.data,
        location: locationName,
        groupedByDay,
        isNight
      };

      //save cache
      cache[cacheKey] = {
        data: renderData,
        timestamp: now
      };

      //final render
      res.render("index.ejs", renderData);



  } catch(error) {
      console.error("------ API ERROR ------");
      console.error("Status:", error.response?.status);
      console.error("URL:", error.config?.url);
      console.error("Message:", error.message);
      console.error("-----------------------");

      res.render("index.ejs", {result: "Unable to fetch weather data. Please try again.",});
    }
});



app.listen(PORT, () =>{
  console.log(`Server is running on port ${PORT}`);
});
# 🌦️ Skycast - Weather Application

A production-ready backend-driven weather application that integrates multiple external APIs to dynamically process geolocation, timezone, and real-time weather forecast data based on user input.

🔗 **Live Demo:**  
https://skycast-fez0.onrender.com

---

## ✨ Key Features

- 🌍 Global city search with precise geocoding
- ⏰ Timezone-aware local time display
- 📊 Grouped multi-day forcast
- 🌓 Day/Night UI logic
- 🚀 Intelligent caching for instant responses
- 🛡️ Rate limiting & API protection
- 📱 Responsive design for all devices
- ☄️ Fully deployed cloud application



---

## 🧠 Project Architecture

This application follows a structured backend request lifecycle:

### 1️⃣ User Input
- User submits a city through the frontend form.

### 2️⃣ Geocoding Layer
- The server sends a request to the **Open-Meteo API**.
- Retrieves precise latitude and longitude coordinates.

### 3️⃣ Cache & Rate Control Layer
- The server checks for cached results using coordinate-based keys.
- If valid cached data exists (within 10 minutes), the response is served instantly.
- If not, fresh API calls are triggered.

### 4️⃣ Timezone Resolution
- Coordinates are sent to the **Open-Meteo API**.
- Returns timezone information for accurate local time processing.

### 5️⃣ Weather Data Retrieval
- Coordinates are sent to the **MET Weather API (api.met.no)**.
- Real-time weather forecast data is retrieved.

### 6️⃣ Data Processing Layer
- Forecast entries are:
  - Grouped by day
  - Labelled (Today, Tomorrow, etc.)
  - Assigned dynamic time formatting
  - Enhanced with symbol fallbacks
  - Processed for night/day UI logic

### 7️⃣ Response Rendering
- The fully processed dataset is rendered server-side using EJS templates.

---

## 🛠️ Technologies Used

**Backend:**
- Node.js
- Express.js
- Axios (API requests)
- EJS (Server-side templating)

**APIs:**
- Open-Meteo (Geocoding)
- Open-Meteo (Timezone)
- MET Norway Weather API (Forecast data)

**Performance:**
- In-memory caching
- Express rate limiting
- API request optimization

---

## ⚡ Performance & API Protection

This application is built with production considerations:

- ✅ **In-memory per-location caching (10 minutes)**
- ✅ **Express rate limiting (30 requests per minute per IP)**
- ✅ **Reverse proxy configuration (`trust proxy`) for deployment**
- ✅ **Server-side API proxy to protect external APIs**
- ✅ **Compliance with MET API 20 req/sec limitation**

This ensures:
- Reduced external API load
- Improved performance
- Protection against abuse
- Scalable backend design

---

## 🔐 API Configuration

### MET Weather API User-Agent Requirement

The MET Weather API requires a valid `User-Agent` header to comply with their terms of service and prevent `403 Forbidden` errors.

**Implementation:**
```javascript
headers: {
  "User-Agent": "Skycast/1.0 peteropeyemijohn@gmail.com"
}
```

This ensures:
- Compliance with MET API guidelines
- Proper identification of requests
- Reliable API access

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/peteropeyemijohn/Weather-Web-Application-Use-a-public-API-.git
cd Weather-Web-Application-Use-a-public-API-
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open your browser**
```
http://localhost:3000
```

### Deployment

This app is deployed on Render with automatic deployments from the main branch.

---

## 🧗 Challenges & Solutions

**Challenge:** MET API returning 403 errors  
**Solution:** Implemented proper User-Agent headers as per API documentation

**Challenge:** Excessive API calls degrading performance  
**Solution:** Implemented coordinate-based caching with 10-minute TTL

**Challenge:** Handling different timezones accurately  
**Solution:** Integrated Open-Meteo timezone API for precise local time

**Challenge:** Rate limiting external APIs  
**Solution:** Combined in-memory caching with Express rate limiting middleware

---

## 👤 About

Built by **Peter Opeyemi John**  
📧 peteropeyemijohn@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/peter-opeyemi-john-41a924280/) | [GitHub](https://github.com/peteropeyemijohn)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**⭐ If you found this project helpful, please consider giving it a star!**

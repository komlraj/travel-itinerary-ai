import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import Fuse from "fuse.js";
import rawCityList from "../city.list.json"; // Preloaded list of known cities

const cityList = rawCityList as Array<{
  id: number;
  name: string;
  state: string;
  country: string;
  coord: {
    lon: number;
    lat: number;
  };
}>;

const cityAliases: Record<string, string> = {
  "spiti valley": "Kaza",
  "spiti": "Kaza",
  "leh ladakh": "Leh",
  "monali": "Manali",
  "delhi ncr": "Delhi",
};

export class SmartWeatherTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "get_current_weather",
      description: "Get the current weather for any city, with typo correction",
      schema: z.object({
        city: z.string().describe("City name to get weather for"),
      }),
      func: async ({ city }: { city: string }) => {
        console.log("🌐 Received weather request for city:", city);

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
          console.error("❌ Missing OpenWeatherMap API key");
          return "❌ Missing API key for OpenWeatherMap";
        }

        // 🔍 Fuzzy match city
        const normalizedCity = city.toLowerCase().trim();
        const resolvedCity = cityAliases[normalizedCity] || city;

        console.log("📍 Original input:", city);
        console.log("🔁 Resolved to:", resolvedCity);

        const fuse = new Fuse(cityList, { threshold: 0.3, keys: ["name"] });
        const matchedCity = fuse.search(resolvedCity)[0]?.item;
        const correctedCityName = matchedCity?.name || city;

        console.log("🔍 Fuzzy matched city:", correctedCityName);

        // 🌍 Get coordinates
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          correctedCityName
        )}&limit=1&appid=${apiKey}`;
        console.log("📡 Geocoding API URL:", geoUrl);

        const geoRes = await fetch(geoUrl);
        console.log("📦 Geocode response status:", geoRes.status);

        if (!geoRes.ok) {
          const text = await geoRes.text();
          console.error("❌ Geocoding failed:", text);
          return `❌ Failed to find "${correctedCityName}": ${geoRes.statusText}`;
        }

        const geoData = await geoRes.json();
        console.log("📍 Geocode result:", geoData);

        if (!geoData.length) {
          console.warn(`⚠️ No results for "${correctedCityName}"`);
          return `❌ Could not find any city matching "${city}"`;
        }

        const { lat, lon, name, country } = geoData[0];
        console.log(
          `📌 Final location: ${name}, ${country} (lat: ${lat}, lon: ${lon})`
        );

        // 🌤 Get weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        console.log("🌤️ Weather API URL:", weatherUrl);

        const weatherRes = await fetch(weatherUrl);
        console.log("📦 Weather response status:", weatherRes.status);

        if (!weatherRes.ok) {
          const text = await weatherRes.text();
          console.error("❌ Weather fetch failed:", text);
          return `❌ Failed to get weather for ${name}, ${country}`;
        }

        const data = await weatherRes.json();
        console.log("🌦️ Weather data:", data);

        const temp = data.main?.temp;
        const desc = data.weather?.[0]?.description;
        const humidity = data.main?.humidity;
        const wind = data.wind?.speed;

        const report =
          city.toLowerCase() !== correctedCityName.toLowerCase()
            ? `You asked for "${city}", but I found "${name}, ${country}".\n\nCurrent weather: ${temp}°C, ${desc}. Humidity: ${humidity}%. Wind: ${wind} m/s.`
            : `Current weather in ${name}, ${country}: ${temp}°C, ${desc}. Humidity: ${humidity}%. Wind: ${wind} m/s.`;

        console.log("✅ Final weather report:", report);
        return report;
      },
    });
  }
}

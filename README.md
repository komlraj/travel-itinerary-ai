# 🌍 AI-Powered Travel Itinerary Planner

A smart and conversational travel planner powered by **Next.js**, **LangChain**, and **LangGraph** that helps users organize trips with weather insights, hotel suggestions, packing checklists, and more — all powered by real-time APIs and LLM agents.

---

## ✨ Features

- 🗣️ Natural conversation interface to plan trips
- 🏙️ Understands city names (even with typos)
- 📅 Weather forecast based on travel dates
- 🧳 Generates personalized packing checklists
- 🏨 Suggests budget-friendly hotels, homestays, or Airbnbs
- 💰 Automatically calculates a travel budget plan
- 🚨 Provides local emergency contact info
- 🎒 Supports clothing suggestions based on season
- 📦 Card-based UI for visual response blocks (weather, hotel, budget, etc.)

---

## 🚀 Tech Stack

| Layer        | Technology                                  |
|--------------|----------------------------------------------|
| Frontend     | Next.js (App Router) + Tailwind CSS          |
| AI Agent     | LangChain JS + LangGraph + OpenAI GPT-4o     |
| State/Streaming | `ai` SDK (`readStreamableValue`)         |
| Tools        | Custom LangChain Tools (get_current_weather, suggest_clothing, get_budget_accommodation, get_packing_checklist, get_emergency_contacts, generate_trip_budget_plan) |
| Data Sources | OpenWeatherMap API, Booking.com API (via RapidAPI) |
| Hosting      | Vercel (Recommended)                         |

---

## 🛠️ Installation & Setup

### 1. 📦 Clone the repository

\`\`\`bash
git clone https://github.com/your-username/travel-itinerary-ai.git
cd travel-itinerary-ai
\`\`\`

### 2. 📚 Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. 🔐 Create environment variables

Create a `.env.local` file in the root directory and add:

\`\`\`env
OPENAI_API_KEY=your-openai-key
RAPIDAPI_KEY=your-rapidapi-key
SERPAPI_API_KEY=your-serpapi-key (optional)
\`\`\`

### 4. ▶️ Run the development server

\`\`\`bash
npm run dev
\`\`\`

> The app will be running at `http://localhost:3000`

### 5. 🏗️ Build for production

\`\`\`bash
npm run build
npm start
\`\`\`



## 📌 To Be Improved / Work in Progress

1. 🔄 Provide weather details for all days of the trip
2. 🧠 Add persistent memory across user sessions
3. 📦 Set up API and DB to store trips and history
4. 🏨 Improve hotel search logic based on total budget and stay duration
5. 💰 Refine budget planning with actual cost data (food, transport, sightseeing)
6. 🗺️ Add map view for hotels and travel path (optional)
7. 📄 Export trip plan as a downloadable PDF
8. 🔗 Add location-based filters (e.g., beach, mountains, offbeat)
9. 🔔 Add alerts for peak seasons, strikes, monsoon, etc.

---

## 🤝 Open to Contributions

This project is actively evolving. If you’re a developer, designer, or data contributor interested in travel or AI:

> ✨ **Feel free to fork, suggest improvements, or open a PR!**

---

## 👩‍💻 Created by

**Komal Raj**  
Senior Frontend & AI Engineer
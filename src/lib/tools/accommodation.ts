import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { normalizeDate } from "../helper";

export class BudgetAccommodationTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "get_budget_accommodation",
      description:
        "Find cheap hotels, homestays, or Airbnbs based on city, dates, and optional budget",
      schema: z.object({
        city: z.string(),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        budget: z.number().optional(),
      }),
      func: async ({ city, checkIn, checkOut, budget }) => {
        console.log("🏨 Fetching hotels for:", city, checkIn, checkOut, budget);

        const options = {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
            "X-RapidAPI-Host": "booking-com15.p.rapidapi.com",
          },
        };

        // Step 1: Get destination ID
        const locUrl = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(
          city
        )}&locale=en-gb`;
        console.log("🌍 Location lookup URL:", locUrl);

        const locRes = await fetch(locUrl, options);
        if (!locRes.ok) {
          console.error(
            "❌ Failed to fetch destination ID:",
            locRes.statusText
          );
          return `⚠️ Unable to get location data for "${city}".`;
        }

        const locJson = await locRes.json();
        const first = locJson?.data?.[0];
        if (!first) {
          return `⚠️ Sorry, I couldn’t find "${city}" on Booking.com.`;
        }

        const { dest_id, search_type } = first;
        console.log("✅ Destination resolved:", { dest_id, search_type });

        // Step 2: Normalize and log both check-in and check-out dates
        const normalizedArrival = normalizeDate(checkIn);
        const normalizedDeparture = normalizeDate(
          checkOut || normalizedArrival.corrected
        );

        let departure_date = normalizedDeparture.corrected;
        if (!checkOut) {
          const dep = new Date(normalizedArrival.corrected);
          dep.setDate(dep.getDate() + 1);
          departure_date = dep.toISOString().slice(0, 10);
        }

        console.log("📅 Provided checkIn:", normalizedArrival.original);
        console.log("📅 Corrected arrival_date:", normalizedArrival.corrected);
        console.log(
          "📅 Provided checkOut:",
          normalizedDeparture.original || "not given"
        );
        console.log("📅 Final departure_date:", departure_date);

        // Step 3: Build hotel search query
        const params = new URLSearchParams({
          dest_id,
          search_type,
          adults: "1",
          room_qty: "1",
          sort_by: "price",
          currency_code: "INR",
          page_number: "1",
          languagecode: "en-us",
          arrival_date: normalizedArrival.corrected,
          departure_date: departure_date,
        });

        const hotelUrl = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?${params}`;
        console.log("🏨 Final Hotel Search URL:", hotelUrl);

        const hotelRes = await fetch(hotelUrl, options);
        if (!hotelRes.ok) {
          console.error("❌ Failed to fetch hotels:", hotelRes.statusText);
          return `⚠️ Something went wrong while fetching hotels for "${city}".`;
        }

        const hotelJson = await hotelRes.json();
        console.log("🧾 Hotels priceBreakdown:", hotelJson?.[0])


        const hotels = hotelJson?.data?.hotels || [];

        console.log("🧾 Raw Hotels:", hotels?.[0])


        const filtered = budget
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? hotels.filter((h: any) => h?.property?.priceBreakdown?.grossPrice?.value <= budget)
          : hotels;


        const topResults = filtered
          .slice(0, 5)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((h: any, index: number) => ({
            index: index + 1,
            name: h.property.name,
            reviewScore: h.property?.reviewScore,
            reviewScoreWord: h.property.reviewScoreWord,
            reviewCount: h.property?.reviewCount,
            price: h?.property?.priceBreakdown?.grossPrice?.value,
            rating: h.property.reviewScore?.rating,
            photoUrls: h.property?.photoUrls,
            accessibilityLabel: h.accessibilityLabel
          }));

        return JSON.stringify(topResults, null, 2);
      },
    });
  }
}

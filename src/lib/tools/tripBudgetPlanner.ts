import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { normalizeDate } from "../helper";

export class TripBudgetPlannerTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "generate_trip_budget_plan",
      description:
        "Generate a budget plan including hotel, food, and transport costs based on total budget, city, and travel duration. Also fetch weather and recommend packing.",
      schema: z.object({
        city: z.string(),
        totalBudget: z.number(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        days: z.number().optional(),
      }),
      func: async ({ city, totalBudget, startDate, endDate, days }) => {
        console.log("📌 Trip Planning Input:", {
          city,
          totalBudget,
          startDate,
          endDate,
          days,
        });

        // Normalize dates
        const start = normalizeDate(startDate);
        const end = normalizeDate(endDate);

        let tripDays = days;
        if (!tripDays && start.corrected && end.corrected) {
          const from = new Date(start.corrected);
          const to = new Date(end.corrected);
          const diff = Math.round(
            (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
          );
          tripDays = diff > 0 ? diff : 1;
        }

        if (!tripDays) {
          return `❓ Please specify number of days or provide travel dates.`;
        }

        // Split the budget
        const hotelBudget = totalBudget * 0.45;
        const foodBudget = totalBudget * 0.3;
        const transportBudget = totalBudget * 0.2;
        const miscBudget = totalBudget * 0.05;

        // Simulate weather and packing call (replace with actual tool calls in agent)
        const weatherText = `Fetching weather for ${city}...`;
        const packingText = `Packing list for ${tripDays} days based on ${city}'s weather...`;

        // Response
        return `🧳 **Trip Budget Plan for ${city}**\n
📅 Duration: ${tripDays} days\n💰 Total Budget: ₹${totalBudget.toLocaleString()}\n
---
🏨 **Hotel**: ₹${hotelBudget.toFixed(0)}\n🍽️ **Food**: ₹${foodBudget.toFixed(
          0
        )}\n🚕 **Transport**: ₹${transportBudget.toFixed(
          0
        )}\n🧻 **Miscellaneous**: ₹${miscBudget.toFixed(0)}\n
---
🌦️ **Weather Info**: ${weatherText}\n🎒 **Packing Suggestions**: ${packingText}\n
Would you like me to search for hotels in ${city} within ₹${hotelBudget.toFixed(
          0
        )} hotel budget?`;
      },
    });
  }
}

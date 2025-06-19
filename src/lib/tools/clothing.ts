import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export class ClothingSuggestionTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "suggest_clothing",
      description:
        "Suggest clothes based on city weather and number of travel days",
      schema: z.object({
        city: z.string().describe("City where user is going"),
        days: z.number().describe("Number of days of the trip"),
        weather: z
          .object({
            temp: z.number(),
            desc: z.string(),
          })
          .describe("Weather data with temperature and condition"),
      }),
      func: async ({ city, days, weather }) => {
        console.log("🧳 Suggesting clothing for:", { city, days, weather });

        const suggestions: string[] = [];

        // Base on temperature
        if (weather.temp >= 30) {
          suggestions.push(
            "Light cotton clothes",
            "T-shirts",
            "Shorts",
            "Sunglasses",
            "Cap"
          );
        } else if (weather.temp >= 20) {
          suggestions.push(
            "Light jacket",
            "Full-sleeve shirts",
            "Jeans",
            "Sneakers"
          );
        } else if (weather.temp >= 10) {
          suggestions.push("Warm jacket", "Sweaters", "Boots", "Woolen socks");
        } else {
          suggestions.push(
            "Heavy woolen clothes",
            "Thermals",
            "Gloves",
            "Beanie",
            "Warm boots"
          );
        }

        // Extra items based on description
        if (weather.desc.toLowerCase().includes("rain")) {
          suggestions.push("Umbrella", "Raincoat", "Waterproof shoes");
        }
        if (weather.desc.toLowerCase().includes("sun")) {
          suggestions.push("Sunscreen", "Hat");
        }

        // Adjust for number of days
        if (days > 5) {
          suggestions.push("Extra pair of shoes", "Laundry bag");
        }

        const result = `Based on current weather in ${city} (${
          weather.temp
        }°C, ${
          weather.desc
        }) and ${days} day(s) of travel, you should pack:\n- ${suggestions.join(
          "\n- "
        )}`;

        console.log("✅ Clothing Suggestion:", result);
        return result;
      },
    });
  }
}

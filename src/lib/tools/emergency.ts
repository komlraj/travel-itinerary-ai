import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export class EmergencyContactTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: "get_emergency_contacts",
      description:
        "Get emergency helpline numbers for a given country (ambulance, police, fire, etc.)",
      schema: z.object({
        country: z
          .string()
          .describe("The country to get emergency contacts for"),
      }),
      func: async ({ country }) => {
        console.log("🚨 Looking up emergency contacts for:", country);

        const contacts: Record<string, string> = {
          India: `
						📞 Emergency Contacts for India:
						- 🚓 Police: 100
						- 🚑 Ambulance: 102
						- 🔥 Fire: 101
						- 🆘 All-in-one emergency: 112
					`,
          USA: `
						📞 Emergency Contacts for the United States:
						- 🚨 Universal emergency number: 911
					`,
          UK: `
						📞 Emergency Contacts for the United Kingdom:
						- 🚨 Universal emergency number: 999
					`,
        };

        const result =
          contacts[country] ||
          `⚠️ Sorry, I couldn’t find emergency contacts for "${country}". Try asking for a more common country.`;

        console.log("✅ Emergency contact response:", result);
        return result;
      },
    });
  }
}

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class PackingChecklistTool extends DynamicStructuredTool {
  constructor() {
    super({
      name: 'get_packing_checklist',
      description: 'Generate a packing checklist based on weather, trip duration, and trip type',
      schema: z.object({
        days: z.number().describe('Number of days of the trip'),
        weather: z.object({
          temp: z.number(),
          desc: z.string(),
        }).describe('Weather at the destination'),
        tripType: z.enum(['beach', 'mountain', 'business', 'solo', 'family']).optional(),
      }),
      func: async ({ days, weather, tripType }) => {
        console.log("📦 Generating packing checklist for:", { days, weather, tripType });

        const checklist: Record<string, string[]> = {
          Toiletries: ['Toothbrush', 'Toothpaste', 'Comb', 'Sanitizer', 'Sunscreen', 'Tissue Pack', 'Soap/Shampoo'],
          Electronics: ['Phone', 'Charger', 'Power Bank', 'Headphones'],
          Documents: ['ID Proof', 'Travel Tickets', 'Hotel Bookings', 'Emergency Contacts'],
          Medications: ['Basic first-aid kit', 'Personal medicines'],
          Clothing: [],
          Extras: [],
        };

        // 👕 Clothing logic
        if (weather.temp > 30) {
          checklist.Clothing.push('Cotton T-shirts', 'Shorts', 'Flip-flops');
        } else if (weather.temp > 20) {
          checklist.Clothing.push('Full-sleeve shirts', 'Light jacket', 'Comfortable pants');
        } else if (weather.temp > 10) {
          checklist.Clothing.push('Sweaters', 'Warm jacket', 'Wool socks');
        } else {
          checklist.Clothing.push('Thermals', 'Heavy jacket', 'Gloves', 'Wool cap');
        }

        // 🌧️ Rain handling
        if (weather.desc.toLowerCase().includes('rain')) {
          checklist.Clothing.push('Raincoat', 'Umbrella');
        }

        // 🏝️ Trip type adjustments
        if (tripType === 'beach') {
          checklist.Extras.push('Swimsuit', 'Beach towel', 'Flip-flops', 'Beach bag');
        } else if (tripType === 'mountain') {
          checklist.Extras.push('Trekking shoes', 'Thermal flask', 'Torch');
        } else if (tripType === 'business') {
          checklist.Clothing.push('Formal wear');
          checklist.Extras.push('Laptop', 'Notepad', 'Pen');
        } else if (tripType === 'solo') {
          checklist.Extras.push('Journal', 'Pepper spray', 'SIM card');
        } else if (tripType === 'family') {
          checklist.Extras.push('Kids meds', 'Extra snacks', 'Cards or board games');
        }

        // 📦 Add extra items for long trips
        if (days > 5) {
          checklist.Extras.push('Laundry bag', 'Extra pair of shoes');
        }

        console.log("✅ Final packing checklist:", checklist);
        return checklist;
      },
    });
  }
}
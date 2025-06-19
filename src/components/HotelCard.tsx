import React from "react";
import Image from "next/image";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function HotelCard({ hotel }: { hotel: any }) {
  const {
    name,
    reviewScore,
    reviewScoreWord,
    reviewCount,
    photoUrls,
    accessibilityLabel,
  } = hotel.property;

  const distanceMatch = accessibilityLabel.match(/([\d.]+ km from downtown)/);
  const distance = distanceMatch ? distanceMatch[1] : "";

  const priceMatch = accessibilityLabel.match(/([\d,]+ INR)/);
  const price = priceMatch ? priceMatch[1] : "N/A";

  const bedMatch = accessibilityLabel.match(/Bed in dorm : (.+?)\./);
  const bedInfo = bedMatch ? bedMatch[1] : "";

  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden flex flex-col md:flex-row max-w-2xl mx-auto">
      <Image
        src={photoUrls?.[0]}
        alt={name}
        className="w-full md:w-1/3 h-64 object-cover"
      />

      <div className="p-4 flex-1">
        <h2 className="text-lg font-semibold text-gray-800">{name}</h2>

        <div className="text-sm text-gray-500 mb-1">
          {bedInfo && <span>🛏️ {bedInfo}</span>}
        </div>

        {distance && (
          <div className="text-sm text-gray-500 mb-1">📍 {distance}</div>
        )}

        <div className="flex items-center gap-2 text-sm text-yellow-600 font-medium mb-1">
          ⭐ {reviewScore} {reviewScoreWord} ({reviewCount} reviews)
        </div>

        <div className="text-green-700 font-semibold text-lg mb-2">
          ₹ {price}
        </div>

        <div className="text-xs text-gray-400">
          {accessibilityLabel.includes("No prepayment needed")
            ? "✅ No prepayment needed"
            : ""}
        </div>

        <button
          onClick={() =>
            window.open(
              `https://www.booking.com/hotel/in/${name
                .toLowerCase()
                .replace(/ /g, "-")}`,
              "_blank"
            )
          }
          className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

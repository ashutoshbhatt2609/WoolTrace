export const insightLocations = {
  chitradurga: { name: "Chitradurga, Karnataka", district: "Chitradurga", latitude: 14.2251, longitude: 76.398 },
  tumakuru: { name: "Tumakuru, Karnataka", district: "Tumakuru", latitude: 13.3379, longitude: 77.1173 },
  ballari: { name: "Ballari, Karnataka", district: "Ballari", latitude: 15.1394, longitude: 76.9214 },
  koppal: { name: "Koppal, Karnataka", district: "Koppal", latitude: 15.3505, longitude: 76.156 },
  raichur: { name: "Raichur, Karnataka", district: "Raichur", latitude: 16.212, longitude: 77.3439 },
  belagavi: { name: "Belagavi, Karnataka", district: "Belagavi", latitude: 15.8497, longitude: 74.4977 },
  bengaluru: { name: "Bengaluru, Karnataka", district: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
} as const;
export type InsightArea = keyof typeof insightLocations;
export function isInsightArea(area: string): area is InsightArea { return Object.hasOwn(insightLocations, area); }

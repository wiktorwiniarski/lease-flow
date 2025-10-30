import type { EntityConfig } from "../hooks/useEntity";

export const apartmentEntityConfig: EntityConfig = {
  name: "Apartment",
  orderBy: "created_at DESC",
  properties: {
    name: { type: "string", description: "Apartment name or identifier" },
    address: { type: "string", description: "Full address" },
    building_entrance: { type: "string", description: "Building entrance number/letter" },
    apartment_number: { type: "string", description: "Apartment number" },
    floor: { type: "string", description: "Floor number" },
    size: { type: "number", description: "Apartment size in m²" },
    parking_space: { type: "string", description: "Parking space number" },
    entrance_code: { type: "string", description: "Door entrance code" },
    land_register_number: { type: "string", description: "Land and mortgage register number" },
    notes: { type: "string", description: "Additional notes" },
  },
  required: ["name", "address", "apartment_number"],
};

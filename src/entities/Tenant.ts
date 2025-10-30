import type { EntityConfig } from "../hooks/useEntity";

export const tenantEntityConfig: EntityConfig = {
  name: "Tenant",
  orderBy: "created_at DESC",
  properties: {
    first_name: { type: "string", description: "Tenant first name" },
    last_name: { type: "string", description: "Tenant last name" },
    email: { type: "string", description: "Email address" },
    phone: { type: "string", description: "Phone number" },
    date_of_birth: { type: "string", description: "Date of birth (ISO format)" },
    residential_address: { type: "string", description: "Residential address" },
    country_of_residence: { type: "string", description: "Country of residence" },
    apartment_id: { type: "integer", description: "Associated apartment ID" },
    rent_amount: { type: "number", description: "Monthly rent in PLN" },
    contract_start_date: { type: "string", description: "Contract start date (ISO format)" },
    contract_end_date: { type: "string", description: "Contract end date (ISO format)" },
    deposit_amount: { type: "number", description: "Deposit amount in PLN" },
    notes: { type: "string", description: "Additional notes" },
  },
  required: ["first_name", "last_name", "apartment_id", "contract_start_date", "contract_end_date"],
};

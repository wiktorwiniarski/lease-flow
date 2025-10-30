import type { EntityConfig } from "../hooks/useEntity";

export const userEntityConfig: EntityConfig = {
  name: "User",
  orderBy: "created_at DESC",
  properties: {
    email: { type: "string", description: "User email address" },
    password: { type: "string", description: "Hashed password" },
    first_name: { type: "string", description: "User first name" },
    last_name: { type: "string", description: "User last name" },
    provider: { type: "string", description: "Auth provider (email, google, facebook)" },
    provider_id: { type: "string", description: "OAuth provider ID" },
    avatar_url: { type: "string", description: "User avatar URL" },
  },
  required: ["email"],
};

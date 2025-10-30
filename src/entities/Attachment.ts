import type { EntityConfig } from "../hooks/useEntity";

export const attachmentEntityConfig: EntityConfig = {
  name: "Attachment",
  orderBy: "created_at DESC",
  properties: {
    tenant_id: { type: "integer", description: "Associated tenant ID" },
    type: {
      type: "string",
      enum: ["passport_id", "lease_agreement", "contract_annex", "handover_protocol", "other"],
      description: "Type of attachment"
    },
    file_name: { type: "string", description: "File name" },
    file_url: { type: "string", description: "File URL or path" },
    file_size: { type: "number", description: "File size in bytes" },
    notes: { type: "string", description: "Additional notes" },
  },
  required: ["tenant_id", "type", "file_name"],
};

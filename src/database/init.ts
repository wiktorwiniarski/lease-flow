import { db } from "./Database";

/**
 * Initialize the flexible entities table
 * This only needs to be run once when the app starts
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Create main entities table
    await db.run(`
      CREATE TABLE IF NOT EXISTS entities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Index on entity_type for faster queries
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_entity_type
      ON entities(entity_type);
    `);

    // Index on created_at for ordering
    await db.run(`
      CREATE INDEX IF NOT EXISTS idx_created_at
      ON entities(created_at);
    `);

    console.log("[Database] Initialized successfully");
  } catch (error) {
    console.error("[Database] Initialization error:", error);
    throw error;
  }
}

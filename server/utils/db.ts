import { sql } from "@vercel/postgres";

export { sql };

// Create a pool-like interface wrapper
export const pool = {
  query: sql,
  connect: async () => ({
    query: sql,
    release: () => {}, // No-op since @vercel/postgres manages connections
  }),
};

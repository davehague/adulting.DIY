import { defineEventHandler, getQuery } from "h3";
import { sql } from "../utils/db";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email as string;
  const name = query.name as string;
  const picture = query.picture as string;

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  try {
    // Try to fetch the user
    let result =
      await sql`SELECT id, name, email, picture, organization_id FROM users WHERE email = ${email}`;

    if (result.rowCount === 0) {
      // If the user doesn't exist, create a new user
      // TODO: Use the organization_id from the organization the user belongs to
      result = await sql`
        INSERT INTO users (organization_id, name, email, picture) 
        VALUES (1, ${name}, ${email}, ${picture}) 
        RETURNING id, name, email, picture, organization_id
      `;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching or creating user:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});

import { defineEventHandler, readBody } from "h3";
import jwt from "jsonwebtoken";
import { sql } from "../utils/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (
    event.node.req.method === "POST" &&
    event.node.req.url === "/api/auth/google"
  ) {
    const { name, email, picture } = body;

    try {
      // Check if user exists
      let result = await sql`SELECT * FROM users WHERE email = ${email}`;
      let user = result.rows[0];

      if (!user) {
        // If user doesn't exist, create a new user
        result = await sql`
          INSERT INTO users (name, email, picture)
          VALUES (${name}, ${email}, ${picture})
          RETURNING *
        `;
        user = result.rows[0];
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return { success: true, token, user };
    } catch (error) {
      console.error("Error in Google authentication:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error during authentication",
      });
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Not found",
  });
});

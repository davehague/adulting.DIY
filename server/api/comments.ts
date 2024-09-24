import { defineEventHandler, getQuery, readBody } from "h3";
import { sql } from "../utils/db";

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const query = getQuery(event);

  // GET all comments
  if (method === 'GET' && !query.id) {
    try {
      const result = await sql`SELECT * FROM comments`;
      return result.rows;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // GET comment by ID
  if (method === 'GET' && query.id) {
    const id = parseInt(query.id as string, 10);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid ID",
      });
    }
    try {
      const result = await sql`SELECT * FROM comments WHERE id = ${id}`;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Comment not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching comment:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // POST new comment
  if (method === 'POST') {
    const body = await readBody(event);
    try {
      const result = await sql`
        INSERT INTO comments (organization_id, occurrence_id, user_id, text)
        VALUES (${body.organization_id}, ${body.occurrence_id}, ${body.user_id}, ${body.text})
        RETURNING *
      `;
      return result.rows[0];
    } catch (error) {
      console.error("Error creating comment:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // PUT (update) comment
  if (method === 'PUT') {
    const body = await readBody(event);
    const id = parseInt(body.id as string, 10);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid ID",
      });
    }
    try {
      const result = await sql`
        UPDATE comments SET
          text = ${body.text},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Comment not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error updating comment:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed",
  });
});

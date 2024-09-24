import { defineEventHandler, getQuery, readBody } from "h3";
import { sql } from "../utils/db";

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const query = getQuery(event);

  // GET all categories
  if (method === 'GET' && !query.id) {
    try {
      const result = await sql`SELECT * FROM categories`;
      return result.rows;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // GET category by ID
  if (method === 'GET' && query.id) {
    const id = parseInt(query.id as string, 10);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid ID",
      });
    }
    try {
      const result = await sql`SELECT * FROM categories WHERE id = ${id}`;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Category not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching category:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // POST new category
  if (method === 'POST') {
    const body = await readBody(event);
    try {
      const result = await sql`
        INSERT INTO categories (organization_id, name, options)
        VALUES (${body.organization_id}, ${body.name}, ${JSON.stringify(body.options)})
        RETURNING *
      `;
      return result.rows[0];
    } catch (error) {
      console.error("Error creating category:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // PUT (update) category
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
        UPDATE categories SET
          name = ${body.name},
          options = ${JSON.stringify(body.options)},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Category not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error updating category:", error);
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

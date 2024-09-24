import { defineEventHandler, getQuery, readBody } from "h3";
import { sql } from "../utils/db";

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const query = getQuery(event);

  // GET all occurrences
  if (method === 'GET' && !query.id) {
    try {
      const result = await sql`SELECT * FROM occurrences`;
      return result.rows;
    } catch (error) {
      console.error("Error fetching occurrences:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // GET occurrence by ID
  if (method === 'GET' && query.id) {
    const id = parseInt(query.id as string, 10);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid ID",
      });
    }
    try {
      const result = await sql`SELECT * FROM occurrences WHERE id = ${id}`;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Occurrence not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching occurrence:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // POST new occurrence
  if (method === 'POST') {
    const body = await readBody(event);
    try {
      const result = await sql`
        INSERT INTO occurrences (
          task_id, status, due_date, assigned_to, executed_by, completed_at, is_deleted
        ) VALUES (
          ${body.task_id}, ${body.status}, ${body.due_date}, ${body.assigned_to}, 
          ${body.executed_by}, ${body.completed_at}, ${body.is_deleted}
        ) RETURNING *
      `;
      return result.rows[0];
    } catch (error) {
      console.error("Error creating occurrence:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // PUT (update) occurrence
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
        UPDATE occurrences SET
          status = ${body.status},
          due_date = ${body.due_date},
          assigned_to = ${body.assigned_to},
          executed_by = ${body.executed_by},
          completed_at = ${body.completed_at},
          is_deleted = ${body.is_deleted},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Occurrence not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error updating occurrence:", error);
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
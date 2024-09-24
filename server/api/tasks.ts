import { defineEventHandler, getQuery, readBody } from "h3";
import { sql } from "../utils/db";

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;
  const query = getQuery(event);

  // GET all tasks
  if (method === 'GET' && !query.id) {
    try {
      const result = await sql`SELECT * FROM tasks`;
      return result.rows;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // GET task by ID
  if (method === 'GET' && query.id) {
    const id = parseInt(query.id as string, 10);
    if (isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid ID",
      });
    }
    try {
      const result = await sql`SELECT * FROM tasks WHERE id = ${id}`;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Task not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching task:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // POST new task
  if (method === 'POST') {
    const body = await readBody(event);
    try {
      const result = await sql`
        INSERT INTO tasks (
          organization_id, title, description, created_by, is_recurring, 
          recurrence_type, recurrence_interval, category_id, notification_settings
        ) VALUES (
          ${body.organization_id}, ${body.title}, ${body.description}, ${body.created_by}, 
          ${body.is_recurring}, ${body.recurrence_type}, ${body.recurrence_interval}, 
          ${body.category_id}, ${JSON.stringify(body.notification_settings)}
        ) RETURNING *
      `;
      return result.rows[0];
    } catch (error) {
      console.error("Error creating task:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Internal server error",
      });
    }
  }

  // PUT (update) task
  if (method === 'PUT') {
    const body = await readBody(event);
    try {
      const result = await sql`
        UPDATE tasks SET
          title = ${body.title},
          description = ${body.description},
          is_recurring = ${body.is_recurring},
          recurrence_type = ${body.recurrence_type},
          recurrence_interval = ${body.recurrence_interval},
          category_id = ${body.category_id},
          notification_settings = ${JSON.stringify(body.notification_settings)},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${body.id}
        RETURNING *
      `;
      if (result.rowCount === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Task not found",
        });
      }
      return result.rows[0];
    } catch (error) {
      console.error("Error updating task:", error);
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
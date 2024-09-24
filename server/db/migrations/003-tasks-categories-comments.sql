-- Create categories table
   CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER NOT NULL,
          name VARCHAR(50) NOT NULL,
          options JSONB,
          created_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (organization_id) REFERENCES organizations (id)
          );

-- Create tasks table
   CREATE TABLE tasks (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER NOT NULL,
          title VARCHAR(200) NOT NULL,
          description TEXT,
          created_by INTEGER NOT NULL,
          is_recurring BOOLEAN NOT NULL,
          recurrence_type VARCHAR(10) CHECK (recurrence_type IN ('Fixed', 'Variable')),
          recurrence_interval VARCHAR(50),
          last_occurrence TIMESTAMP
               WITH TIME ZONE,
                    category_id INTEGER,
                    notification_settings JSONB,
                    created_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (organization_id) REFERENCES organizations (id),
                    FOREIGN KEY (created_by) REFERENCES users (id),
                    FOREIGN KEY (category_id) REFERENCES categories (id)
          );

-- Create task_dependencies table
   CREATE TABLE task_dependencies (
          id SERIAL PRIMARY KEY,
          task_id INTEGER NOT NULL,
          dependency_id INTEGER NOT NULL,
          FOREIGN KEY (task_id) REFERENCES tasks (id),
          FOREIGN KEY (dependency_id) REFERENCES tasks (id)
          );

-- Create occurrences table
   CREATE TABLE occurrences (
          id SERIAL PRIMARY KEY,
          task_id INTEGER NOT NULL,
          status VARCHAR(20) NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'On Hold')),
          due_date TIMESTAMP
               WITH TIME ZONE,
                    assigned_to INTEGER,
                    executed_by INTEGER,
                    completed_at TIMESTAMP
               WITH TIME ZONE,
                    is_deleted BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (task_id) REFERENCES tasks (id),
                    FOREIGN KEY (assigned_to) REFERENCES users (id),
                    FOREIGN KEY (executed_by) REFERENCES users (id)
          );

-- Create comments table
   CREATE TABLE comments (
          id SERIAL PRIMARY KEY,
          organization_id INTEGER NOT NULL,
          occurrence_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          created_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP
               WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (organization_id) REFERENCES organizations (id),
                    FOREIGN KEY (occurrence_id) REFERENCES occurrences (id),
                    FOREIGN KEY (user_id) REFERENCES users (id)
          );

-- Create indexes for improved query performance
CREATE INDEX idx_tasks_organization ON tasks (organization_id);

CREATE INDEX idx_occurrences_task ON occurrences (task_id);

CREATE INDEX idx_comments_occurrence ON comments (occurrence_id);

CREATE INDEX idx_categories_organization ON categories (organization_id);
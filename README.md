# adulting.diy Task Management System

This project is a multi-tenant task management system built with Vue.js, Nuxt 3, and Vercel Postgres. It's designed to help organizations manage recurring and non-recurring tasks efficiently.

## Features

- Multi-tenant architecture supporting multiple organizations
- Recurring and non-recurring task management
- Custom categorization system for tasks
- Task dependencies for non-recurring tasks
- Flexible notification system for upcoming and overdue tasks
- Soft deletion for exception handling in recurring tasks
- Google Sign-In authentication
- Persistent authentication state across page reloads and server-side rendering

## Tech Stack

- Vue.js (latest version)
- Nuxt 3
- Pinia for state management
- Pinia Plugin Persisted State for persistent storage
- Tailwind CSS for utility-first styling
- Lucide Vue Next for icons
- Vercel Postgres for primary data storage
- Vercel KV (optional) for caching
- Vercel Edge Config (optional) for global settings
- Google Sign-In for authentication

## Prerequisites

- Node.js (version compatible with Nuxt 3)
- npm or yarn
- Vercel account for deploying and managing Vercel Postgres
- Google Cloud Platform account for Google Sign-In

## Getting Started

1. Clone the repository:

   ```
   git clone [your-repo-url]
   cd adulting-diy
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   NUXT_PUBLIC_SITE_URL=your_site_url
   POSTGRES_URL=your_vercel_postgres_url
   POSTGRES_PRISMA_URL=your_vercel_postgres_prisma_url
   POSTGRES_URL_NON_POOLING=your_vercel_postgres_non_pooling_url
   POSTGRES_USER=your_postgres_user
   POSTGRES_HOST=your_postgres_host
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DATABASE=your_postgres_database
   ```

4. Run database migrations:

   ```
   npm run migrate
   ```

5. Run the development server:

   ```
   npm run dev
   ```

   Or, to run migrations before starting the dev server:

   ```
   npm run dev:with-migrations
   ```

6. Open your browser and navigate to `https://localhost:3000`

## Project Structure

- `components/`: Reusable Vue components
- `layouts/`: Application layouts
- `pages/`: Route pages of the application
- `public/`: Static assets
- `server/`: Server-side code and API routes
- `stores/`: Pinia store files for state management
- `types/`: TypeScript type definitions and interfaces
- `utils/`: Utility functions, including database client setup
- `app.vue`: Main application component
- `nuxt.config.ts`: Nuxt configuration file
- `middleware/`: Nuxt middleware, including authentication middleware

## Key Configuration Files

- `nuxt.config.ts`: Nuxt 3 configuration, including modules, app metadata, and authentication settings
- `package.json`: Project dependencies and scripts
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration (if customized)

## Styling

This project uses Tailwind CSS for styling. Customize your Tailwind setup by modifying `tailwind.config.js` or adding Tailwind-specific configuration to `nuxt.config.ts`.

## Icons

[Lucide](https://lucide.dev/) is included for icons. Use these icons in your Vue components as needed.

## Authentication

This project uses Google Sign-In for authentication. The authentication flow is managed using Pinia and Pinia Plugin Persisted State for persistent storage across page reloads and server-side rendering.

## State Management and Persistence

This project uses Pinia for state management and Pinia Plugin Persisted State for persistent storage.

## Database Setup and Management

This project uses Vercel Postgres as the primary database. To set up and manage your database:

1. Create a new Postgres database in your Vercel account.
2. Use the provided connection details to set up your environment variables.
3. Run the initial migration using the command in step 4 of the Getting Started section.

### Migrations

Database migrations are managed using a custom script. The migration files are located in `server/db/migrations/`.

To create a new migration:

1. Create a new SQL file in the `server/db/migrations/` directory.
2. Name it with an ascending numerical prefix (e.g., `002_add_user_roles.sql`).
3. Write your SQL statements for the schema changes.

To run migrations:

- In development: Use `npm run migrate`
- Before starting the dev server with migrations: Use `npm run dev:with-migrations`
- In production: Migrations are automatically run after each deployment (see Deployment section)

## Deployment

This project is designed to be deployed on Vercel:

1. Connect your GitHub repository to Vercel.
2. Configure your environment variables in the Vercel project settings.
3. Deploy your project.

The `package.json` includes a `postbuild` script that runs migrations after each deployment:

```json
{
  "scripts": {
    "build": "nuxt build",
    "postbuild": "tsx server/db/run-migrations.ts"
  }
}
```

## Additional Vercel Storage Options

While Vercel Postgres is the primary storage solution, consider using these additional Vercel storage options to optimize your application:

- Vercel KV: For caching frequently accessed data
- Vercel Edge Config: For storing global configuration settings
- Vercel Blob: If you decide to add file attachment features in the future

---

For more detailed information on Nuxt 3, Vue.js, Vercel Postgres, or any other technologies used in this project, please refer to their official documentation.

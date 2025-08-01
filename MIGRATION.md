# Migration to Vercel Postgres

This guide will help you migrate from SQLite to Vercel Postgres to fix the 500 error on Vercel deployment.

## Prerequisites

1. A Vercel account with your project deployed
2. Access to your Vercel dashboard

## Step 1: Create Vercel Postgres Database

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to the "Storage" tab
4. Click "Create Database"
5. Select "Postgres"
6. Choose your preferred region
7. Click "Create"

## Step 2: Set Environment Variables

Vercel will automatically add the following environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_HOST`
- `POSTGRES_DATABASE`
- `POSTGRES_USERNAME`
- `POSTGRES_PASSWORD`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

## Step 3: Run the Migration

1. Make sure you have the latest code with the migration script
2. Run the migration locally (you'll need the environment variables):

```bash
npm run migrate
```

Or run it directly:

```bash
node scripts/migrate-to-postgres.js
```

## Step 4: Deploy to Vercel

1. Commit and push your changes
2. Vercel will automatically deploy with the new Postgres implementation

## Step 5: Verify the Migration

1. Check your Vercel deployment logs for any errors
2. Test your API endpoint: `/api/properties`
3. Verify that the data is being returned correctly

## Troubleshooting

### If you get connection errors:
- Make sure all environment variables are set in Vercel
- Check that your database is in the same region as your deployment

### If the migration fails:
- Check the console output for specific error messages
- Ensure your SQLite database file is accessible
- Verify that the Postgres database was created successfully

### If queries are slow:
- The migration script creates indexes for better performance
- Consider adding additional indexes based on your query patterns

## Rollback Plan

If you need to rollback:
1. Revert the API route changes
2. Remove the `@vercel/postgres` dependency
3. Redeploy to Vercel

The SQLite database file remains unchanged, so you can always go back to the original implementation. 
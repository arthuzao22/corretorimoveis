# Database Migration Guide

## Before Running in Production

After merging this PR, you'll need to create and apply the Prisma migration for the new EventoCalendario table.

## Step 1: Create Migration

Run the following command to create the migration:

```bash
npx prisma migrate dev --name add_evento_calendario
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your development database
3. Regenerate the Prisma Client

## Step 2: Review Migration

The migration will create:
- A new table `eventos_calendario` with columns:
  - `id` (TEXT PRIMARY KEY)
  - `lead_id` (TEXT NOT NULL)
  - `imovel_id` (TEXT NOT NULL)
  - `data_hora` (TIMESTAMP NOT NULL)
  - `observacao` (TEXT)
  - `created_at` (TIMESTAMP DEFAULT NOW())
  - `updated_at` (TIMESTAMP)

- Foreign key constraints:
  - `lead_id` → `leads(id)` ON DELETE CASCADE
  - `imovel_id` → `imoveis(id)` ON DELETE CASCADE

- Indexes on:
  - `data_hora`
  - `lead_id`
  - `imovel_id`
  - `created_at`

## Step 3: Apply to Production

When deploying to production:

```bash
npx prisma migrate deploy
```

Or if using a deployment platform that runs migrations automatically, just ensure the schema is pushed.

## Alternative: Using Prisma DB Push (Development Only)

For quick development without migration history:

```bash
npx prisma db push
```

⚠️ **Warning**: This skips migration history and should only be used in development.

## Rollback (if needed)

If you need to rollback:

1. Find the migration file in `prisma/migrations/`
2. Run: `npx prisma migrate resolve --rolled-back <migration-name>`
3. Manually drop the table if needed:
   ```sql
   DROP TABLE eventos_calendario;
   ```

## Verification

After migration, verify the table exists:

```bash
npx prisma studio
```

Or check directly in your database:

```sql
SELECT * FROM eventos_calendario LIMIT 1;
```

## Notes

- The table uses cascade deletion, so deleting a lead or property will also delete associated events
- All fields use proper indexes for query optimization
- The schema is already in `prisma/schema.prisma` and ready for migration

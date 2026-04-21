# MySQL Database

This folder contains the MySQL database files for the Location-Aware AI Audio Travel Companion backend.

## Files

- `schema.sql` creates the database and all tables.
- `seed.sql` inserts starter cities, places, interests, and walks.
- `init.sql` resets the database, then runs schema and seed files.

## Import

From this folder, run:

```powershell
mysql -u root -p < init.sql
```

Or import files separately:

```powershell
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```

## Database Name

```sql
travel_companion
```

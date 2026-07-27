/**
 * Local TypeScript enum definitions for values stored as JSON in MySQL.
 *
 * In PostgreSQL, UserRole was a native Prisma enum (UserRole[]) on the User
 * model. In MySQL, the roles field is stored as a Json column (no native
 * array/enum column type), so Prisma does not generate UserRole in
 * @prisma/client for MySQL. This file provides the equivalent TypeScript
 * enum for use throughout the application.
 *
 * Values must match exactly what is stored in the JSON column — these
 * strings are what gets written to and read from the database.
 */
export enum UserRole {
  PARTICIPANT = 'PARTICIPANT',
  MODERATOR   = 'MODERATOR',
  ADMIN       = 'ADMIN',
}

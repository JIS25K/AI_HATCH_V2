import {sqliteTable,text,integer,index,uniqueIndex,primaryKey,check} from 'drizzle-orm/sqlite-core';
import {sql} from 'drizzle-orm';
const timestamp=()=>text().notNull().default(sql`CURRENT_TIMESTAMP`);
export const visitors=sqliteTable('visitors',{id:text().primaryKey(),first_seen:timestamp()});
export const adminAccount=sqliteTable('admin_account',{id:integer().primaryKey(),password_hash:text().notNull(),salt:text().notNull(),created_at:integer().notNull()});
export const adminSessions=sqliteTable('admin_sessions',{token_hash:text().primaryKey(),expires_at:integer().notNull()});
export const adminAttempts=sqliteTable('admin_attempts',{key:text().notNull(),bucket:integer().notNull(),attempts:integer().notNull()},t=>[primaryKey({columns:[t.key,t.bucket]})]);
export const v2Runs=sqliteTable('v2_runs',{id:text().primaryKey(),visitor_id:text().notNull().references(()=>visitors.id),version:text().notNull(),source:text().notNull(),utm_source:text(),utm_campaign:text(),is_qa:integer().notNull().default(0),task:text(),blocker:text(),practice:text(),created_at:timestamp(),started_at:text(),result_at:text()},t=>[index('v2_runs_cohort').on(t.created_at,t.is_qa),index('v2_runs_visitor').on(t.visitor_id,t.created_at)]);
export const v2Events=sqliteTable('v2_events',{run_id:text().notNull().references(()=>v2Runs.id),name:text().notNull(),detail:text(),created_at:timestamp(),updated_at:timestamp()},t=>[primaryKey({columns:[t.run_id,t.name]})]);

import {sql} from 'drizzle-orm';
import {boolean, check, doublePrecision, integer, pgTable, serial, text, timestamp, uniqueIndex} from 'drizzle-orm/pg-core';

export const assessments = pgTable('assessments', {
    id: text('id').primaryKey(),
    date: text('date').notNull(),
    type: text('type', {enum: ['practice', 'official', 'mock']}).notNull(),
    score: integer('score').notNull(),
    maxScore: integer('max_score').notNull(),
    percentage: doublePrecision('percentage').notNull(),
    timeTaken: integer('time_taken').notNull(),
    domain: text('domain').notNull(),
    notes: text('notes').notNull().default(''),
    passed: boolean('passed').notNull(),
    createdAt: text('created_at').notNull(),
}, (table) => [
    check('assessments_score_non_negative', sql`${table.score} >= 0`),
    check('assessments_max_score_positive', sql`${table.maxScore} >= 1`),
    check('assessments_score_lte_max_score', sql`${table.score} <= ${table.maxScore}`),
    check('assessments_percentage_between_0_and_100', sql`${table.percentage} >= 0 AND ${table.percentage} <= 100`),
    check('assessments_time_taken_non_negative', sql`${table.timeTaken} >= 0`),
]);

export const settings = pgTable('settings', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().default('Alex Chen'),
    targetScore: integer('target_score').notNull().default(85),
    examDate: text('exam_date').notNull().default(''),
    theme: text('theme', {enum: ['dark', 'light']}).notNull().default('dark'),
}, (table) => [
    check('settings_target_score_between_0_and_100', sql`${table.targetScore} >= 0 AND ${table.targetScore} <= 100`),
]);

export const pollResults = pgTable('poll_results', {
    id: serial('id').primaryKey(),
    pollId: text('poll_id').notNull(),
    pollQuestion: text('poll_question').notNull(),
    optionText: text('option_text').notNull(),
    voteCount: integer('vote_count').notNull().default(0),
    userId: text('user_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
    pollIdOptionTextIdx: uniqueIndex('poll_id_option_text_idx').on(table.pollId, table.optionText),
    voteCountNonNegative: check('poll_results_vote_count_non_negative', sql`${table.voteCount} >= 0`),
}));

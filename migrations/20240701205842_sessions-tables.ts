import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('session', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table.integer('user_id').unsigned().notNullable().references('user.id');
      table.integer('status').unsigned().defaultTo(1).notNullable();
      table.string('title').notNullable();
      table.string('context', 320).notNullable();
      table.integer('lessons').unsigned().notNullable();
      table.integer('level').unsigned().notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at');
      table.timestamp('deleted_at');
    })
    .createTable('session_feedback', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('session_id')
        .unsigned()
        .notNullable()
        .references('session.id');
      table.text('feedback').notNullable();
      table.decimal('rating', 10, 2).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    })
    .createTable('session_lesson', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('session_id')
        .unsigned()
        .notNullable()
        .references('session.id');
      table.string('phrase', 320).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    })
    .createTable('session_lesson_response', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('lesson_id')
        .unsigned()
        .notNullable()
        .references('session_lesson.id');
      table.string('response_url', 2048).notNullable();
      table.text('feedback').notNullable();
      table.decimal('rating', 10, 2).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('session_lesson_response')
    .dropTable('session_lesson')
    .dropTable('session_feedback')
    .dropTable('session');
}

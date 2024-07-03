import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const transaction = await knex.transaction();
  return transaction.schema
    .createTable('session', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table.integer('user_id').unsigned().notNullable().references('user.id');
      table.enum('status', ['started', 'finished']).notNullable();
      table.string('context', 320).notNullable();
      table.integer('lessons').notNullable();
      table.integer('level').notNullable();
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
      table.string('feedback').notNullable();
      table.integer('rating').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    })
    .createTable('session_report', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('session_id')
        .unsigned()
        .notNullable()
        .references('session.id');
      table.text('feedback').notNullable();
      table.integer('rating').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('auth');
}

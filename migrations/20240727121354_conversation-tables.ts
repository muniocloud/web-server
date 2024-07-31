import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('conversation', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table.integer('user_id').unsigned().notNullable().references('user.id');
      table.integer('status').unsigned().defaultTo(1).notNullable();
      table.string('title', 320).notNullable();
      table.string('context', 320).notNullable();
      table.integer('level').unsigned().notNullable();
      table.integer('duration').unsigned();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at');
      table.timestamp('deleted_at');
    })
    .createTable('conversation_feedback', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('conversation_id')
        .unsigned()
        .notNullable()
        .references('conversation.id');
      table.text('feedback').notNullable();
      table.integer('rating').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    })
    .createTable('conversation_message', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('conversation_id')
        .unsigned()
        .notNullable()
        .references('conversation.id');
      table.string('message', 320).notNullable();
      table.boolean('is_user').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    })
    .createTable('conversation_message_response', function (table) {
      table.increments('id', {
        primaryKey: true,
      });
      table
        .integer('conversation_message_id')
        .unsigned()
        .notNullable()
        .references('conversation_message.id');
      table.string('audio_response_url', 2048).notNullable();
      table.text('feedback').notNullable();
      table.integer('rating').notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('conversation_message_response')
    .dropTable('conversation_message')
    .dropTable('conversation');
}

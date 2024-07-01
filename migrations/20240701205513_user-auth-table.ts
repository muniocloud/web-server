import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('auth', function (table) {
    table.increments('id', {
      primaryKey: true,
    });
    table.integer('user_id').unsigned().notNullable().references('user.id');
    table.string('email', 320).notNullable();
    table.enum('provider', ['local', 'google']).notNullable();
    table.string('provider_id', 255);
    table.string('password', 255);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('auth');
}

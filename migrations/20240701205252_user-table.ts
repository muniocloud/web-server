import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user', function (table) {
    table.increments('id', {
      primaryKey: true,
    });

    table.string('name', 255);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('user');
}

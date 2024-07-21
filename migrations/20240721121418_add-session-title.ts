import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('session', function (table) {
    table.string('title').notNullable().after('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('session', function (table) {
    table.dropColumn('title');
  });
}

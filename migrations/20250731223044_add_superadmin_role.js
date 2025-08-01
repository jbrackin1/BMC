/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex('roles').insert({
    id: '00000000-0000-0000-0000-000000000003',
    role_name: 'SuperAdmin'
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex('roles')
    .where('id', '00000000-0000-0000-0000-000000000003')
    .del();
};

exports.up = function(knex) {
    return knex.schema.createTable('Question', function(table) {
        table.increments('id');
        table.string('text').notNullable();
        table.bigInteger('sample').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('Question');
};

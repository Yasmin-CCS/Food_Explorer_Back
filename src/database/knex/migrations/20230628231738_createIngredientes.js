
exports.up = knex => knex.schema.createTable("ingredientes", table => {
  table.increments("id");
  table.text("nome").notNullable();

  table.integer("pratos_id").references("id").inTable("pratos").onDelete("CASCADE");
  table.integer("user_id").references("id").inTable("users");

});

exports.down = knex => knex.schema.dropTable("ingredientes");



exports.up = knex => knex.schema.createTable("categorias", table => {
  table.increments("id");
  table.text("nome").notNullable();

  table.integer("pratos_id").references("id").inTable("pratos").onDelete("CASCADE");
  table.timestamp("created_at").default(knex.fn.now());


});

exports.down = knex => knex.schema.dropTable("categorias");


const knex = require("../database/knex");


class PratosController {
  async create(request, response) {
    const { nome, description, categorias, ingredientes, preco, foto } = request.body;
    const user_id = request.user.id;

    const [pratos_id] = await knex("pratos").insert({
      nome,
      description,
      foto,
      preco,
      user_id
    });

    const categoriasInsert = categorias.map(categoria => {
      return {
        pratos_id,
        url: categoria,
      }
    });

    await knex("categorias").insert(categoriasInsert);

    const ingredientesInsert = ingredientes.map(nome => {
      return {
        pratos_id,
        nome,
        user_id
      }
    });

    await knex("ingredientes").insert(ingredientesInsert);

    return response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const prato = await knex("pratos").where({ id }).first();
    const ingredientes = await knex("ingredientes").where({ pratos_id: id }).orderBy("nome");
    const categorias = await knex("categorias").where({ pratos_id: id }).orderBy("created_at");

    return response.json({
      ...prato,
      ingredientes,
      categorias
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex("pratos")
      .where({ id }).delete();

    return response.json();
  }

  async index(request, response) {
    const { nome, ingredientes, categorias } = request.query;

    const user_id = request.user.id;

    let pratos;

    if (ingredientes) {
      const filterIngredientes = ingredientes.split(',').map(ingrediente => ingrediente.trim());

      pratos = await knex("ingredientes")
        .select([
          "pratos.id",
          "pratos.nome",
          "pratos.user_id",
        ])
        .where("pratos.user_id", user_id)
        .whereLike("pratos.nome", `%${nome}%`)
        .whereIn("nome", filterIngredientes)
        .innerJoin("pratos", "pratos.id", "ingrdientes.pratos_id")
        .groupBy("pratos.id")
        .orderBy("pratos.nome");

    } else if (categorias) {
      const filterCategorias = categorias.split(',').map(categoria => categoria.trim());

      pratos = await knex("categorias")
        .select([
          "pratos.id",
          "pratos.nome",
          "pratos.user_id",
        ])
        .where("pratos.user_id", user_id)
        .whereLike("pratos.nome", `%${nome}%`)
        .whereIn("url", filterCategorias)
        .innerJoin("pratos", "pratos.id", "categorias.pratos_id")
        .groupBy("pratos.id")
        .orderBy("pratos.nome");

    } else {
      pratos = await knex("pratos")
        .where({ user_id })
        .whereLike("nome", `%${nome}%`)
        .orderBy("nome");
    }

    const userIngredientes = await knex("ingredientes").where({ user_id });
    const pratosWithIngredientes = pratos.map(prato => {
      const pratoIngredientes = userIngredientes.filter(ingrediente => ingrediente.pratos_id === prato.id);
    
      return {
        ...prato,
        ingredientes: pratoIngredientes
      }
    
    })


    return response.json(pratosWithIngredientes);
  }
}

module.exports = PratosController
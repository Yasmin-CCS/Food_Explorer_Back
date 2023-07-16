const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");

const diskStorage = new DiskStorage()

class IngredientesController {
  async show(request, response) {
    const { nome } = request.params;
    const { pratos_id } = request.params;
    const ingredientes = await knex("ingredientes").where({ pratos: nome });

    return response.json({
      ...ingredientes
    });


  }
}

module.exports = IngredientesController
const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");

const diskStorage = new DiskStorage()

class PratosController {
  async create(request, response) {
    const { nome, description, categorias, ingredientes, preco } = request.body;
    const { filename: foto } = request.file;
    console.log(request.file)
    const fotoFile = await diskStorage.saveFile(foto)

    const categoria = await knex("categorias").where({ nome: categorias }).first();


    const [pratos_id] = await knex("pratos").insert({
      nome,
      description,
      preco,
      foto: fotoFile,
      categorias_id: categoria.id,
    });



    const ingredientesArray = ingredientes.split(",");

    const ingredientesInsert = ingredientesArray.map(ingrediente => {
      return {
        pratos_id,
        nome: ingrediente,
      }
    });

    await knex("ingredientes").insert(ingredientesInsert);

    return response.json();

  }

  async update(request, response) {
    const { nome, description, categorias, ingredientes, preco } = request.body;
    const pratos_id = request.body.id;
    console.log(request.body)
    const prato = await knex("pratos")
    .where({ id: pratos_id }).first();
  
    if(request.file){
      const { filename: foto } = request.file;
          if (prato.foto) {
      await diskStorage.deleteFile(prato.foto);
    }
      const fotoFile = await diskStorage.saveFile(foto)
      prato.foto = fotoFile ?? prato.foto;
    }
    

    if (!prato) {
      throw new AppError("Prato não encontrado");
    }





    const categoria = await knex("categorias").where({ id: categorias }).first();

    const ingredientesArray = ingredientes.split(",");

    const ingredientesFromFront = await Promise.all(
      ingredientesArray.map(async (ingrediente) => {
        const ingredienteBanco = await knex("ingredientes")
          .where({ nome: ingrediente, pratos_id })
          .first();
  
        if (!ingredienteBanco) {
          return {
            pratos_id,
            nome: ingrediente,
          };
        }
  
        return null;
      })
    );
    // const ingredientesExistente = await knex("ingredientes").where({ nome: ingredientesFromFront }).first();
    // const ingredienteExistente = pratos.ingredientes.find(ingrediente => ingrediente.nome === novoIngrediente.nome);


    async function adicionarIngrediente() {
      try {
        const ingredientesInsert = ingredientesFromFront.filter(
          (ingrediente) => ingrediente !== null
        );
        // Adicionar o novo ingrediente ao banco de dados
        await knex("ingredientes").insert(ingredientesInsert);
      } catch (error) {
        // Trate a exceção aqui, por exemplo:
        console.error("sem ingredientes novos", error);
      }
    }

    prato.nome = nome ?? prato.nome;
    prato.preco = preco ?? prato.preco;
    prato.description = description ?? prato.description;
    prato.categorias_id = categoria.id ?? prato.categorias_id;

    // if (ingredientesFromFront.length > 0) {
    adicionarIngrediente();
    // } else {
    //   console.log("Nenhum ingrediente para adicionar!");
    // }

    await knex("pratos").update(prato).where({ id: pratos_id });

    // await database.run(`
    // UPDATE produtos SET
    // nome = ?,
    // preco = ?,
    // description = ?,
    // categoria = ?,
    // foto = ?,
    // updated_at = DATETIME('now'),
    // WHERE id = ?`,
    // [prato.nome, prato.preco, prato.description, prato.categoria_id, prato.foto, prato.id]
    // );

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
    const { nome, categorias } = request.query;
    
    // let pratos;

    // if (ingredientes) {
    //   const filterIngredientes = ingredientes.split(',').map(ingrediente => ingrediente.trim());

    // pratos = await knex("ingredientes")
    //   .select([
    //     "pratos.id",
    //     "pratos.nome",
    //   ])
    //   .whereLike("pratos.nome", `%${nome}%`)
    //   .whereIn("nome", filterIngredientes)
    //   .innerJoin("pratos", "pratos.id", "ingredientes.pratos_id")
    //   .groupBy("pratos.id")

    // } else {
    const pratos = await knex("pratos")
    // .where({ nome: ingredientes})
    // }
    const ingredientes = await knex("ingredientes").select('*')
    const pratosWithIngredientes = pratos.map(prato => {
      const pratoIngredientes = ingredientes.filter(ingrediente => ingrediente.pratos_id === prato.id);

      return {
        ...prato,
        ingredientes: pratoIngredientes
      }

    })

    //     .where({ nome: ingredientes})
    // }

    return response.json(pratosWithIngredientes);



    // if (nome) {
    //   const filterNomePratos = await knex("pratos")
    //   .where( {nome})      
    //   return response.json(filterNomePratos)
    // }

    // if (categorias){
    //   pratos = await knex("pratos")
    //     .where({ categorias_id: categorias})
    // }

    // const userIngredientes = await knex("ingredientes");
 



  }
}

module.exports = PratosController
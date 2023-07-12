const knex = require("../database/knex");
const DiskStorage = require("../providers/DiskStorage");


class PratoFotoController {

  async update(request, response){
    const pratos_id = request.params.id;
    const fotoFilename = request.file.filename;

    const diskStorage = new DiskStorage();

    const prato = await knex("pratos")
    .where({ id: pratos_id }).first();
    

    if(prato.foto) {
      await diskStorage.deleteFile(prato.foto);
    }

    const filename = await diskStorage.saveFile(fotoFilename);
    prato.foto = filename;

    await knex("pratos").update(prato).where({ id: pratos_id });

    return response.json(prato);

  }
}

module.exports = PratoFotoController;
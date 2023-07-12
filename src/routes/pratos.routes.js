const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const PratosController = require("../controllers/PratosController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const PratosFotosController = require("../controllers/PratoFotoController")


const pratosRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const pratosController = new PratosController();
const pratosFotosController = new PratosFotosController();

pratosRoutes.use(ensureAuthenticated);

pratosRoutes.patch("/:id/foto", upload.single("foto"), pratosFotosController.update);
pratosRoutes.post("/", pratosController.create);
pratosRoutes.get("/:id", pratosController.show);
pratosRoutes.get("/", pratosController.index);
pratosRoutes.delete("/:id", pratosController.delete);

module.exports = pratosRoutes;
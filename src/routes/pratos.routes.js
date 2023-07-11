const { Router } = require("express");

const PratosController = require("../controllers/PratosController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");


const pratosRoutes = Router();

const pratosController = new PratosController();

pratosRoutes.use(ensureAuthenticated);

pratosRoutes.post("/", pratosController.create);
pratosRoutes.get("/:id", pratosController.show);
pratosRoutes.get("/", pratosController.index);
pratosRoutes.delete("/:id", pratosController.delete);

module.exports = pratosRoutes;
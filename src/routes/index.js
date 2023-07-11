const { Router } = require("express");

const usersRouter = require("./users.routes");
const pratosRouter = require("./pratos.routes");
const sessionsRouter = require("./sessions.routes");

const routes = Router();

routes.use("/users", usersRouter);
routes.use("/pratos", pratosRouter);
routes.use("/sessions", sessionsRouter);

module.exports = routes;
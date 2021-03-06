const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const usersController = require("../controllers/usersController");
const horsesController = require("../controllers/horsesController");
const lessonsController = require("../controllers/lessonsController");
const usersHorsesLessonsController = require("../controllers/usersHorsesLessonsController");
const Roles = require("../models/roles");
const config = require("../config/config")

checkAuth = function (roles) {
    return async (req, res, next) => {
        jwt.verify(req.headers['authorization'], config.secret, function(err, decoded) {
            if (err) {
                res.status(401).send({ returnCode: 401, message: "Token non valide" });
            } else if (!roles.includes(decoded.role)) {
                res.status(403).send({ returnCode: 403, message: "Vous n'êtes pas autorisé à faire cette action" });
            } else {
                next();
            }
        })
    }
}

router
    .post("/auth/login", usersController.login)
    .post("/auth/register", usersController.registerUser)
    .post("/auth/change_password", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersController.changePassword)
    .post("/auth/reset_password", usersController.resetPassword)

router
    .post("/users", checkAuth([Roles.Admin]), usersController.createUser)
    .get("/users", checkAuth([Roles.Admin]), usersController.findAllUsers)
    .get("/users/:id", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersController.getUser)
    .put("/users/:id", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersController.updateUser)
    .delete("/users/:id", checkAuth([Roles.Admin]), usersController.deleteUser)

router
    .get("/horses", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), horsesController.findAllHorses)
    .post("/horses", checkAuth([Roles.Admin, Roles.Teacher]), horsesController.createHorse)
    .put("/horses/:id", checkAuth([Roles.Admin, Roles.Teacher]), horsesController.updateHorse)
    .delete("/horses/:id", checkAuth([Roles.Admin, Roles.Teacher]), horsesController.deleteHorse)

router
    .get("/lessons", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), lessonsController.findAllLessons)
    .get("/lessons/teacher/:teacherId", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), lessonsController.findAllLessonsByTeacher)
    .get("/lessons/:id", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), lessonsController.findLesson)
    .post("/lessons", checkAuth([Roles.Admin, Roles.Teacher]), lessonsController.createLesson)
    .put("/lessons/:id", checkAuth([Roles.Admin, Roles.Teacher]), lessonsController.updateLesson)
    .delete("/lessons/:id", checkAuth([Roles.Admin, Roles.Teacher]), lessonsController.deleteLesson)

router
    .get("/uhl", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.findAllUHL)
    .get("/uhl/user/:userId", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.findAllUHLByUser)
    .get("/uhl/lesson/:lessonId", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.findAllUHLByLesson)
    .get("/uhl/:id", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.findUHL)
    .post("/uhl", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.createUHL)
    .put("/uhl/:id", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.updateUHL)
    .delete("/uhl/:id", checkAuth([Roles.Admin, Roles.Teacher, Roles.User]), usersHorsesLessonsController.deleteUHL)

module.exports = router;
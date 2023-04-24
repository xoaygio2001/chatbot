import express from "express";
import chatbotController from "../controllers/chatbotController"

let router = express.Router();

let initWebRoutes = (app) => {
    router.get("/", chatbotController.getHomePage);

    router.get("/webhook", chatbotController.getWebhook);
    router.post("/webhook", chatbotController.postWebhook);

    router.post("/chatbot", chatbotController.chatbotfake);



    return app.use("/", router)
};

module.exports = initWebRoutes;
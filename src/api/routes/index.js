import express from "express";
import EventController from "../event/event.controller.js";
import MPController from "../mercadopago/mp.controller.js";

const router = express.Router();

router.route("/block/events").post(EventController.CreateBlockedEvents);
router.route("/block/events/:eventId").delete(EventController.DeleteBlockedEvent);
router.route("/events/filter").get(EventController.GetEventsByFilters);
router.route("/events").patch(EventController.UpdateEvents);
router.route("/mercadopago/create_preference").post(MPController.CreatePreference);
router.route("/mercadopago/events").post(MPController.UpdateEvents);

export default router;

import express from "express";
import EventController from "../event/event.controller.js";
import MPController from "../mercadopago/mp.controller.js";
import AuthController from "../auth/auth.controller.js";
import OrderController from "../order/order.controller.js";

const router = express.Router();

router.route("/block/events").post(EventController.CreateBlockedEvents);
router.route("/block/events/:eventId").delete(EventController.DeleteBlockedEvent);
router.route("/events/month").get(EventController.GetEventsByMonth);
router.route("/events/filter").get(EventController.GetEventsByFilters);
router.route("/events").patch(EventController.UpdateEvents);
router.route("/mercadopago/create_preference").post(MPController.CreatePreference);
router.route("/mercadopago/events").post(MPController.UpdateEvents);
router.route("/mercadopago/events/:preferenceId").delete(MPController.DeleteEvents);
router.route('/auth/login').post(AuthController.Login);
router.route('/auth/current').get(AuthController.CurrentUser);
router.route('/orders').get(OrderController.GetOrders);

export default router;

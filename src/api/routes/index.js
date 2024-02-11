import express from "express";
import EventController from "../event/event.controller.js";
import AuthController from "../auth/auth.controller.js";
import OrderController from "../order/order.controller.js";
import RoomController from "../room/room.controller.js";
import MPController from "../payment/mercadopago/mp.controller.js";
import TBController from "../payment/transbank/tb.controller.js";

const router = express.Router();

// Events
router.route("/block/events").post(EventController.CreateBlockedEvents);
router.route("/block/events/:eventId").delete(EventController.DeleteBlockedEvent);
router.route("/events/month").get(EventController.GetEventsByMonth);
router.route("/events/filter").get(EventController.GetEventsByFilters);
router.route("/events").patch(EventController.UpdateEvents);
// Mercadopago
router.route("/mercadopago/create_preference").post(MPController.CreatePreference);
router.route("/mercadopago/events").post(MPController.UpdateEvents);
router.route("/mercadopago/events/:preferenceId").delete(MPController.DeleteEvents);
// Transbank
router.route("/transbank/create_transaction").post(TBController.CreateTransaction);
router.route("/transbank/confirm_transaction").post(TBController.ConfirmTransaction);
// Auth
router.route('/auth/login').post(AuthController.Login);
router.route('/auth/current').get(AuthController.CurrentUser);
// Orders
router.route('/orders').get(OrderController.GetOrders);
router.route('/order/:orderId').get(OrderController.GetOrder);
// Rooms
router.route('/rooms').get(RoomController.GetRooms)

export default router;

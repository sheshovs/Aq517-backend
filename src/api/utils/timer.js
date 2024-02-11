import cron from "cron";
import EventService from "../event/event.service.js";
import { EventStatuses, OrderStatuses, mp_url } from "./constants.js";
import { socketio, socketsUser } from "../../../index.js";
import axios from "axios";
import OrderService from "../order/order.service.js";

const access_token = process.env.MP_ACCESS_TOKEN;

export const configurarTemporizador = (eventUuids, expirationDate) => {
  const taskCron = new cron.CronJob(
    expirationDate,
    async () => {
      console.log(`Eliminando hora bloqueada que ha expirado.`);
      const events = await EventService.getEventsByUUID(eventUuids);

      if (events.length === 0) {
        return taskCron.stop();
      }
      const eventId = events[0].uuid;

      const paymentIdByEventId = await OrderService.getPaymentByEventId(eventId);
      const paymentId = paymentIdByEventId.paymentId;

      const mercadoPagoUrl = `${mp_url}v1/payments/${paymentId}?access_token=${access_token}`;

      try {
        const response = await axios.get(mercadoPagoUrl, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const status = response.data.status;
      
        if(status === "in_process") {
          await OrderService.updateOrder(paymentIdByEventId.uuid, { status: OrderStatuses.FAILURE });
        }
      } catch (error) {
        console.log(error);
      }

      const eventsToDelete = events.filter(
        (event) => event.status === EventStatuses.BLOCKED,
      );
      const eventUuidsToDelete = eventsToDelete.map((event) => event.uuid);
      await EventService.deleteEvents(eventUuidsToDelete);
      socketsUser.forEach((socket) => {
        socketio.to(socket).emit("deleteEvent", eventUuidsToDelete);
      });
      taskCron.stop();
    },
    false,
  );

  taskCron.start();
};

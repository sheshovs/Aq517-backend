import cron from "cron";
import EventService from "../event/event.service.js";
import { EventStatuses } from "./constants.js";
import { socketio, socketsUser } from "../../../index.js";

export const configurarTemporizador = (eventUuids, expirationDate) => {
  const taskCron = new cron.CronJob(
    expirationDate,
    async () => {
      console.log(`Eliminando hora bloqueada que ha expirado.`);
      const events = await EventService.getEventsByUUID(eventUuids);
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

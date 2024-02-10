import { StatusCodes } from "http-status-codes";
import EventService from "./event.service.js";
import { v4 as uuidv4 } from "uuid";
import { EventStatuses } from "../utils/constants.js";
import { configurarTemporizador } from "../utils/timer.js";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
dayjs.locale("es");

const EventController = {
  CreateBlockedEvents: async (req, res) => {
    const { events } = req.body;

    if (!events || events.length < 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No hay eventos para crear" });
    }

    const createdAt = dayjs().format();

    const formattedEvents = events.map((event) => {
      const formattedEvent = {
        uuid: uuidv4(),
        ...event,
        status: EventStatuses.BLOCKED,
        expirationDate: dayjs(createdAt).add("10", "minutes").format(),
        createdAt,
        roomId: event.room.uuid,
      }
      delete formattedEvent.room
      return formattedEvent
    });

    const eventsToCheck = formattedEvents.map((event) => {
      return {
        date: event.date,
        startTime: event.startTime,
        roomId: event.roomId,
      };
    });

    const eventsAlreadyCreated = await EventService.checkIfEventExist(eventsToCheck)

    if (eventsAlreadyCreated.some((event) => event === true)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Una o más horas ya se encuentran reservadas" });
    }
    const createdEvents = await EventService.createEvents(formattedEvents);

    if (createdEvents.length !== formattedEvents.length) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error creando eventos" });
    }

    const eventUuids = createdEvents.map((event) => event.uuid);
    const expirationDate = createdEvents[0].expirationDate;
    configurarTemporizador(eventUuids, expirationDate);

    return res
      .status(StatusCodes.OK)
      .json({ message: "Eventos creados correctamente", events: createdEvents });
  },
  DeleteBlockedEvent: async (req, res) => {
    const { eventId } = req.params;

    if (!eventId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No hay evento para eliminar" });
    }

    const deletedEvent = await EventService.deleteEvents([eventId]);

    if (!deletedEvent) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error eliminando evento" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Evento eliminado correctamente" });
  },
  UpdateEvents: async (req, res) => {
    const { eventsUUIDs } = req.body;

    if (!eventsUUIDs || eventsUUIDs.length < 0) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No hay eventos para actualizar" });
    }

    const updateData = {
      status: EventStatuses.SCHEDULED,
      expirationDate: null,
    };

    const updatedEvents = await EventService.updateEvents(
      eventsUUIDs,
      updateData,
    );

    if (updatedEvents.length !== eventsUUIDs.length) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Error actualizando eventos" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Eventos actualizados correctamente" });
  },
  GetEventsByFilters: async (req, res) => {
    const { date, roomId } = req.query;

    if (!date) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No hay fecha para buscar eventos" });
    }
    if (!roomId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No hay sala para buscar eventos" });
    }

    const events = await EventService.getEventsByFilters(date, roomId);

    if (!events) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ events: [] });
    }

    return res.status(StatusCodes.OK).json(events);
  },
  GetEventsByMonth: async (req, res) => {
    const { month } = req.query;

    if (!month) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "No hay mes para buscar eventos" });
    }

    const events = await EventService.getEventsByMonth(month);

    if (!events) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ events: [] });
    }

    return res.status(StatusCodes.OK).json(events);
  }
};

export default EventController;

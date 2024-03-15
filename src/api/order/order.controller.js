import { StatusCodes } from "http-status-codes";
import OrderService from "./order.service.js";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import "dayjs/locale/es.js";
import { EventStatuses, OrderStatuses } from "../utils/constants.js";
import EventService from "../event/event.service.js";
dayjs.locale("es");

const OrderController = {
  GetOrders: async (req, res) => {
    try {
      const orders = await OrderService.getAllOrders();

      if (!orders) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error obteniendo ordenes" });
      }

      return res.status(StatusCodes.OK).json(orders);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  },
  GetOrder: async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await OrderService.getOrder(orderId);

      if (!order) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error obteniendo orden" });
      }

      return res.status(StatusCodes.OK).json(order);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  },
  CreateOrderWithEvents: async (req, res) => {
    const order = req.body;
    const { events } = order

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
        status: EventStatuses.SCHEDULED,
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

    try {
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

      const payloadOrder = {
        uuid: uuidv4(),
        total_price: order.totalPrice,
        status: OrderStatuses.APPROVED,
        paymentMethod: order.paymentMethod,
        attendant: order.attendant,
        email: order.email,
        phone: order.phone,
        createdAt,
      }
      
      const [createOrder] = await OrderService.createOrder(payloadOrder)

      if(!createOrder) {
        return res.status(400).json({ message: "Error creando orden" });
      }
      const eventUuids = createdEvents.map((event) => event.uuid);
      const createOrderItems = await OrderService.createOrderItems(eventUuids, createOrder.uuid)

      if(!createOrderItems) {
        return res.status(400).json({ message: "Error creando items de orden" });
      }

      const roomId = formattedEvents[0].roomId
      const date = formattedEvents[0].date

      res.status(200).json({
        date, 
      });
    } catch (error) {
      res.status(400).json(error);
      console.log(error);
    }
  }
}

export default OrderController;
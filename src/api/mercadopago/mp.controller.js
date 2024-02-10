import axios from "axios";
import MPService from "./mp.service.js";
import { EventStatuses, OrderStatuses, mp_url } from "../utils/constants.js";
import EventService from "../event/event.service.js";

const access_token = process.env.MP_ACCESS_TOKEN;



const MPController = {
  CreatePreference: async (req, res) => {
    const { attendant, email, phone, items, paymentMethod } = req.body;
    const mercadoPagoUrl = `${mp_url}checkout/preferences?access_token=${access_token}`;
  
    const preferenceData = {
      items: items,
      auto_return: "approved",
      back_urls: {
        success: `${process.env.APP_URL}/`,
        failure: `${process.env.APP_URL}/`,
        pending: `${process.env.APP_URL}/`,
      },
    };
  
    try {
      const response = await axios.post(mercadoPagoUrl, preferenceData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      let total_price = 0
      let eventIds = []
      response.data.items.map((item) => {
        total_price += item.unit_price * item.quantity
        if(item.id){
          eventIds.push(item.id)
        }
      })

      const payload = {
        uuid: response.data.id,
        total_price,
        status: OrderStatuses.PENDING,
        paymentMethod,
        attendant,
        email,
        phone,
        createdAt: new Date(),
      }
      
      const [createOrder] = await MPService.createOrder(payload)

      if(!createOrder) {
        return res.status(400).json({ message: "Error creando orden" });
      }

      const createOrderItems = await MPService.createOrderItems(eventIds, createOrder.uuid)

      if(!createOrderItems) {
        return res.status(400).json({ message: "Error creando items de orden" });
      }

      res.status(200).json({
        url: response.data.init_point,
      });
    } catch (error) {
      res.status(400).json(error);
      console.log(error);
    }
  },
  UpdateEvents: async (req, res) => {
    const { preferenceId } = req.body;
    const { status, paymentId } = req.query;
    
    if(!preferenceId) {
      return res.status(400).json({ message: "No se recibió el id de la preferencia" });
    }

    const isInProcess = status === "in_process"

    const orderPayload = isInProcess ? {
      status: OrderStatuses.PENDING,
      paymentId,
    }: {
      status: OrderStatuses.APPROVED,
      paymentId,
    }

    const updateOrder = await MPService.updateOrder(preferenceId, orderPayload)

    if(!updateOrder) {
      return res.status(400).json({ message: "Error actualizando orden" });
    }

    if (isInProcess) {
      return res.status(200).json({ message: "Pago en proceso" });
    }

    const itemsByOrder = await MPService.getItemsByOrder(preferenceId)

    if(!itemsByOrder) {
      return res.status(400).json({ message: "Error obteniendo items de la preferencia" });
    }
    const eventIsScheduled = itemsByOrder.some((item) => {
      if(item.status === EventStatuses.SCHEDULED) {
        return true
      }
    })

    if(eventIsScheduled) {
      return res.status(200).json({ message: "Los eventos ya han sido agendados" });
    }

    const eventIds = itemsByOrder.map((item) => item.uuid)

    const updateData = {
      status: EventStatuses.SCHEDULED,
      expirationDate: null,
    }

    const updatedEvents = await EventService.updateEvents(eventIds, updateData);

    if (updatedEvents.length !== eventIds.length) {
      return res
        .status(500)
        .json({ message: "Error actualizando eventos" });
    }

    return res.status(200).json({ message: "Pago realizado correctamente" });
  },
  DeleteEvents: async (req, res) => {
    const { preferenceId } = req.params;
    const { status } = req.query;

    if(!preferenceId) {
      return res.status(400).json({ message: "No se recibió el id de la preferencia" });
    }

    const orderPayload = {
      status: status === "null" ? OrderStatuses.FAILURE : OrderStatuses.REJECTED,
    }

    const updateOrder = await MPService.updateOrder(preferenceId, orderPayload)

    if(!updateOrder) {
      return res.status(400).json({ message: "Error actualizando orden" });
    }

    const itemsByOrder = await MPService.getItemsByOrder(preferenceId)

    if(!itemsByOrder) {
      return res.status(400).json({ message: "Error obteniendo items de la preferencia" });
    }

    if(itemsByOrder.length === 0) {
      return res.status(200).json({ message: "Pago cancelado" });
    }

    const eventIds = itemsByOrder.map((item) => item.uuid)

    await EventService.deleteEvents(eventIds);

    return res.status(200).json({ message: "Pago cancelado" });
  }
};

export default MPController;

import axios from "axios";
import MPService from "./mp.service.js";
import { EventStatuses } from "../utils/constants.js";
import EventService from "../event/event.service.js";

const MPController = {
  CreatePreference: async (req, res) => {
    const mercadoPagoUrl = `https://api.mercadopago.com/checkout/preferences?access_token=TEST-5849597827836358-101417-23c615c14370e68bfa7a84053ea4e2c2-62109829`;
  
    const preferenceData = {
      items: req.body.items,
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
        total_price += item.unit_price
        eventIds.push(item.id)
      })
      
      const payload = {
        uuid: response.data.id,
        total_price,
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
    
    if(!preferenceId) {
      return res.status(400).json({ message: "No se recibió el id de la preferencia" });
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

    return res.status(200).json({ message: "Eventos actualizados correctamente" });
  }
};

export default MPController;

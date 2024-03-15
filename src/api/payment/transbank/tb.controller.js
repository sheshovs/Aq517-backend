import transbank from 'transbank-sdk'; // ES6 Modules
const { WebpayPlus, Options } = transbank
import OrderService from '../../order/order.service.js';
import { EventStatuses, OrderStatuses } from '../../utils/constants.js';
import EventService from '../../event/event.service.js';
import { socketio, socketsUser } from '../../../../index.js';

const commerceCode = process.env.TBK_API_KEY_ID
const apiKey = process.env.TBK_API_KEY_SECRET

const TBController = {
  CreateTransaction: async (req, res) => {
    const { items, paymentMethod, attendant, email, phone } = req.body;

    let total_price = 0
    let eventIds = []
    items.map((item) => {
      total_price += item.unit_price * item.quantity
      if(item.id){
        eventIds.push(item.id)
      }
    })

    let buyOrder = "AQ" + Math.floor(Math.random() * 10000) + 1;
    let sessionId = "S" + Math.floor(Math.random() * 10000) + 1;
    let amount = total_price;
    let returnUrl = `${process.env.APP_URL}/transaction/tb?orderId=${buyOrder}`;

    try {
      const createResponse = await (new WebpayPlus.Transaction(new Options(commerceCode, apiKey))).create(
        buyOrder,
        sessionId,
        amount,
        returnUrl
      );

      const payload = {
        uuid: buyOrder,
        total_price,
        status: OrderStatuses.PENDING,
        paymentMethod,
        attendant,
        email,
        phone,
        createdAt: new Date(),
      }
      
      const [createOrder] = await OrderService.createOrder(payload)

      if(!createOrder) {
        return res.status(400).json({ message: "Error creando orden" });
      }

      const createOrderItems = await OrderService.createOrderItems(eventIds, createOrder.uuid)

      if(!createOrderItems) {
        return res.status(400).json({ message: "Error creando items de orden" });
      }
    
      res.status(200).json({
        url: createResponse.url,
        token: createResponse.token
      });
    } catch (error) {
      res.status(400).json(error);
      console.log(error);
    }
  },
  ConfirmTransaction: async (req, res) => {
    const { token } = req.body;

    try {
      const commitResponse = await (new WebpayPlus.Transaction(new Options(commerceCode, apiKey))).commit(token);
      const orderId = commitResponse.buy_order

      const orderPayload = {}
      if(commitResponse.response_code === 0) {
        orderPayload.status = OrderStatuses.APPROVED
      }

      if(commitResponse.response_code === -1) {
        orderPayload.status = OrderStatuses.REJECTED
      }

      const updateOrder = await OrderService.updateOrder(orderId, orderPayload)

      if(!updateOrder) {
        return res.status(400).json({ message: "Error actualizando orden" });
      }

      const itemsByOrder = await OrderService.getItemsByOrder(orderId)

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

      if(orderPayload.status === OrderStatuses.REJECTED) {
        await EventService.deleteEvents(eventIds);
        socketsUser.forEach((socket) => {
          socketio.to(socket).emit("deleteEvent", eventIds);
        });
      }

      if(orderPayload.status === OrderStatuses.APPROVED) {
        const updateData = {
          status: EventStatuses.SCHEDULED,
          expirationDate: null,
        }
        await EventService.updateEvents(eventIds, updateData);
      }

      res.status(200).json(commitResponse);
    } catch (error) {
      res.status(400).json(error);
      console.log(error);
    }
  }
};

export default TBController;
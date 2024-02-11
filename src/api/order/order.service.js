import pg from "../../config/knex-config.js";

const OrderService = {
  getAllOrders: async () => {
    try {
      const orders = await pg("aqviles.Order").select("*").orderBy("createdAt", "desc");

      const orderWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await pg("aqviles.OrderItem").where("orderId", order.uuid).select("eventId").pluck("eventId");
          const events = await pg("aqviles.Event").whereIn("uuid", orderItems).select("*");
          const eventWithRoomAndAccesories = await Promise.all(
            events.map(async (event) => {
              const [room] = await pg("aqviles.Room").where("uuid", event.roomId);
              const accesoriesIds = await pg("aqviles.EventItem").where("eventId", event.uuid).select("itemId").pluck("itemId");
              const accesories = await pg("aqviles.Item").whereIn("uuid", accesoriesIds).select("*");
              const eventWithAccesories = {
                ...event,
                room,
                accesories,
              }
              return eventWithAccesories
            })
          
          )
          return {
            ...order,
            events: eventWithRoomAndAccesories,
          }
        })
      )
      
      return orderWithItems
    } catch (error) {
      return error;
    }
  },
  createOrder: async (order) => {
    try {
      return await pg("aqviles.Order").insert(order).returning("*");
    } catch (error) {
      return error;
    }
  },
  getOrder: async (preferenceId) => {
    try {
      const [order] = await pg("aqviles.Order").where("uuid", preferenceId).select("*");
      const orderItems = await pg("aqviles.OrderItem").where("orderId", order.uuid).select("eventId").pluck("eventId");
      const events = await pg("aqviles.Event").whereIn("uuid", orderItems).select("*");
      const eventWithRoomAndAccesories = await Promise.all(
        events.map(async (event) => {
          const [room] = await pg("aqviles.Room").where("uuid", event.roomId);
          const accesoriesIds = await pg("aqviles.EventItem").where("eventId", event.uuid).select("itemId").pluck("itemId");
          const accesories = await pg("aqviles.Item").whereIn("uuid", accesoriesIds).select("*");
          const eventWithAccesories = {
            ...event,
            room,
            accesories,
          }
          return eventWithAccesories
        })
      
      )
      return {
        ...order,
        events: eventWithRoomAndAccesories,
      }
      
    } catch (error) {
      return error;
    }
  },
  updateOrder: async (preferenceId, orderPayload) => {
    try {
      return await pg("aqviles.Order").where("uuid", preferenceId).update(orderPayload).returning("*");
    } catch (error) {
      return error;
    }
  },
  getPaymentByEventId: async (eventId) => {
    try {
      const [event] = await pg("aqviles.OrderItem").where("eventId", eventId).select("*");
      const preferenceId = event.orderId;
      const [order] = await pg("aqviles.Order").where("uuid", preferenceId).select("*");
      return order
    } catch (error) {
      return error;
    }
  },
  createOrderItems: async (eventIds, orderId) => {
    try {
      const insertData = eventIds.map((eventId) => {
        return {
          eventId,
          orderId,
        }
      })
      return await pg("aqviles.OrderItem").insert(insertData).returning("*");
    } catch (error) {
      return error;
    }
  },
  getItemsByOrder: async (preferenceId) => {
    try {
      const events = await pg("aqviles.OrderItem").where("orderId", preferenceId).select("eventId").pluck("eventId");
      const eventsData = await pg("aqviles.Event").whereIn("uuid", events).select("*");

      return eventsData
    } catch (error) {
      return error;
    }
  },
  deleteItemsByOrder: async (preferenceId) => {
    try {
      return await pg("aqviles.OrderItem").where("orderId", preferenceId).del();
    } catch (error) {
      return error;
    }
  }
}

export default OrderService;
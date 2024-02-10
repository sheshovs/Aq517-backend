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
  }
}

export default OrderService;
import pg from "../../config/knex-config.js";

const OrderService = {
  getAllOrders: async () => {
    try {
      const orders = await pg("Order").select("*").orderBy("createdAt", "desc");

      const orderWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await pg("OrderItem").where("orderId", order.uuid).select("eventId").pluck("eventId");
          const events = await pg("Event").whereIn("uuid", orderItems).select("*");

          return {
            ...order,
            events,
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
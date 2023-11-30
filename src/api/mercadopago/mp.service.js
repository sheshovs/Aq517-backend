import pg from "../../config/knex-config.js";

const MPService = {
  createOrder: async (order) => {
    try {
      return await pg("Order").insert(order).returning("*");
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
      return await pg("OrderItem").insert(insertData).returning("*");
    } catch (error) {
      return error;
    }
  },
  getItemsByOrder: async (preferenceId) => {
    try {
      const events = await pg("OrderItem").where("orderId", preferenceId).select("eventId").pluck("eventId");
      const eventsData = await pg("Event").whereIn("uuid", events).select("*");

      return eventsData
    } catch (error) {
      return error;
    }
  }
}

export default MPService
import pg from "../../config/knex-config.js";

const MPService = {
  createOrder: async (order) => {
    try {
      return await pg("aqviles.Order").insert(order).returning("*");
    } catch (error) {
      return error;
    }
  },
  getOrder: async (preferenceId) => {
    try {
      return await pg("aqviles.Order").where("uuid", preferenceId).select("*");
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

export default MPService
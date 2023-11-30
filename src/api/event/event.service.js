import pg from "../../config/knex-config.js";

const EventService = {
  createEvents: async (events) => {
    try {
      return await pg("Event").insert(events).returning("*");
    } catch (error) {
      return error;
    }
  },
  deleteEvents: async (eventUuids) => {
    try {
      return await pg("Event").whereIn("uuid", eventUuids).del();
    } catch (error) {
      return error;
    }
  },
  getEvents: async () => {
    try {
      return await pg("Event").select("*");
    } catch (error) {
      return error;
    }
  },
  getEventsByUUID: async (eventUuids) => {
    try {
      return await pg("Event").whereIn("uuid", eventUuids).select("*");
    } catch (error) {
      return error;
    }
  },
  updateEvents: async (eventUuids, updateData) => {
    try {
      return await pg("Event")
        .whereIn("uuid", eventUuids)
        .update(updateData)
        .returning("*");
    } catch (error) {
      return error;
    }
  },
  getEventsByFilters: async (searchFilters) => {
    try {
      return await pg("Event").where(searchFilters).select("*");
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  checkIfEventExist: async (events) => {
    try {
      return await Promise.all(
        events.map(async (event) => {
          const [eventExist] = await pg("Event")
            .where(event)
            .select("*");
          return eventExist !== undefined
        }
      ));
    } catch (error) {
      return error;
    }
  }
};

export default EventService;

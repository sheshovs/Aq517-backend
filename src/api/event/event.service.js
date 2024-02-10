import pg from "../../config/knex-config.js";

const EventService = {
  createEvents: async (events) => {
    try {
      const createdEvents = await Promise.all(
        events.map(async event => {
          const [createdEvent] = await pg("aqviles.Event").insert({
            uuid: event.uuid,
            title: event.title,
            email: event.email,
            phone: event.phone,
            attendant: event.attendant,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            status: event.status,
            expirationDate: event.expirationDate,
            createdAt: event.createdAt,
            roomId: event.roomId,
          }).returning("*");
          
          const [room] = await pg("aqviles.Room").where("uuid", createdEvent.roomId);

          const accesories = await Promise.all(
            event.accesories.map(async (accesory) => {
              const [createdAccesory] = await pg('aqviles.EventItem').insert({
                eventId: createdEvent.uuid,
                itemId: accesory.uuid,
              }).returning("*");
              return createdAccesory
            })
          )

          if(accesories.length !== event.accesories.length) {
            await pg("aqviles.Event").where("uuid", createdEvent.uuid).del();
            return null;
          }

          delete createdEvent.roomId
          return {
            ...createdEvent,
            room,
            accesories: event.accesories,
          }
        })
      )
      return createdEvents
    } catch (error) {
      return error;
    }
  },
  deleteEvents: async (eventUuids) => {
    try {
      return await pg("aqviles.Event").whereIn("uuid", eventUuids).del();
    } catch (error) {
      return error;
    }
  },
  getEvents: async () => {
    try {
      return await pg("aqviles.Event").select("*");
    } catch (error) {
      return error;
    }
  },
  getEventsByUUID: async (eventUuids) => {
    try {
      return await pg("aqviles.Event").whereIn("uuid", eventUuids).select("*");
    } catch (error) {
      return error;
    }
  },
  updateEvents: async (eventUuids, updateData) => {
    try {
      return await pg("aqviles.Event")
        .whereIn("uuid", eventUuids)
        .update(updateData)
        .returning("*");
    } catch (error) {
      return error;
    }
  },
  getEventsByFilters: async (date, roomId) => {
    try {
      return await pg("aqviles.Event").where({roomId}).whereRaw('??::text LIKE ?', ['date', `${date}%`]).select("*");
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  checkIfEventExist: async (events) => {
    try {
      return await Promise.all(
        events.map(async (event) => {
          const [eventExist] = await pg("aqviles.Event")
            .where(event)
            .select("*");
          return eventExist !== undefined
        }
      ));
    } catch (error) {
      return error;
    }
  },
  getEventsByMonth: async (month) => {
    try {
      return await pg("aqviles.Event").whereRaw('??::text LIKE ?', ['date', `${month}%`]).select("*");
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};

export default EventService;

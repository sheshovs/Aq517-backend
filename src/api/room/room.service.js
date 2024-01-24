import pg from "../../config/knex-config.js";

const RoomService = {
  getAllRooms: async () => {
    try {
      const rooms = await pg("aqviles.Room").select("*");

      const roomWithItems = await Promise.all(
        rooms.map(async (room) => {
          const roomItems = await pg("aqviles.RoomItem").where("roomId", room.uuid).select("itemId").pluck("itemId");
          const items = await pg("aqviles.Item").whereIn("uuid", roomItems).select("*");

          return {
            ...room,
            items,
          }
        })
      )
      
      return roomWithItems
    } catch (error) {
      return error;
    }
  }
}

export default RoomService;
import { StatusCodes } from "http-status-codes";
import RoomService from "./room.service.js";

const RoomController = {
  GetRooms: async (req, res) => {
    try {
      const rooms = await RoomService.getAllRooms();

      if (!rooms) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error obteniendo salas" });
      }

      return res.status(StatusCodes.OK).json(rooms);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

export default RoomController;
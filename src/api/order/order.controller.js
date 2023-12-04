import { StatusCodes } from "http-status-codes";
import OrderService from "./order.service.js";

const OrderController = {
  GetOrders: async (req, res) => {
    try {
      const orders = await OrderService.getAllOrders();

      if (!orders) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error obteniendo ordenes" });
      }

      return res.status(StatusCodes.OK).json(orders);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
    }
  }
}

export default OrderController;
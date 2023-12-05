import pg from "../../config/knex-config.js";

const AuthService = {
  getUserByEmail: async (email) => {
    try {
      return await pg("aqviles.User").where("email", email).select("*");
    } catch (error) {
      return error;
    }
  },
  getUserByUUID: async (uuid) => {
    try {
      return await pg("aqviles.User").where("uuid", uuid).select("*");
    } catch (error) {
      return error;
    }
  }
}

export default AuthService;
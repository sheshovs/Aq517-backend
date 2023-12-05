import { StatusCodes } from "http-status-codes";
import { DecodeData, EncodeData } from "../utils/jwtEncoder.js";
import bcrypt from "bcryptjs";
import AuthService from "./auth.service.js";

const AuthController = {
  Login: async (req, res) => {
    const { email, password } = req.body;
    let user = await AuthService.getUserByEmail(email)

    if (user.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "El correo electrónico no se encuentra registrado" });
    }
    console.log(user)

    user = user[0]
    
    console.log(user)
    const passCorrect = await bcrypt.compare(password, user.password)

    if (!passCorrect) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Contraseña incorrecta' })
    }

    const payload = {
      uuid: user.uuid,
      email
    }

    const token = EncodeData(payload, "1h")

    return res.status(StatusCodes.OK).send(token)
  },
  CurrentUser: async (req, res) => {
    const { authorization } = req.headers
    const payload = DecodeData(authorization)
    const { uuid } = payload

    if (!uuid) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'Faltan parámetros' })
    }

    let [user] = await AuthService.getUserByUUID(uuid)

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).send({ error: 'Usuario no encontrado' })
    }

    const userData = {
      ...user,
    }
    delete userData.password

    res.status(StatusCodes.OK).send(userData)
  }
}

export default AuthController;
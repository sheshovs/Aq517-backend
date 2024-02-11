import { StatusCodes } from 'http-status-codes'
import { DecodeData } from '../utils/jwtEncoder.js'

export default async (req, res, next) => {
  const token = req.headers.authorization
  const publicRoute =
    (req.method === 'POST' && req.url.includes("/block/events")) ||
    (req.method === 'POST' && req.url.includes("/auth/login")) ||
    (req.method === 'POST' && req.url.includes("/mercadopago/create_preference")) ||
    (req.method === 'POST' && req.url.includes("/mercadopago/events")) ||
    (req.method === 'POST' && req.url.includes("/transbank/create_transaction")) ||
    (req.method === 'POST' && req.url.includes("/transbank/confirm_transaction")) ||
    (req.method === 'PATCH' && req.url.includes("/events")) ||
    (req.method === 'DELETE' && req.url.includes("/block/events")) ||
    (req.method === 'DELETE' && req.url.includes("/mercadopago/events")) ||
    (req.method === 'GET' && req.url.includes("/events/filter")) ||
    (req.method === 'GET' && req.url.includes("/rooms")) ||
    (req.method === 'GET' && req.url.includes("/order"))
  if (publicRoute) {
    next()
  } else {
    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).send({ error: 'ERROR_NO_TOKEN' })
    }

    const decodedToken = DecodeData(token)
    if (!decodedToken) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'ERROR_INVALID_TOKEN' })
    }

    const { uuid, email } = decodedToken
    if (!uuid || !email) {
      return res.status(StatusCodes.UNAUTHORIZED).send({ error: 'ERROR_INVALID_TOKEN' })
    }

    req.payload = {
      ...req.payload,
      email,
      uuid
    }
    next()
  }
}
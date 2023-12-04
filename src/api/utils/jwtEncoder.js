import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const EncodeData = (payload, expiresIn) => {
  const privateKey = process.env.SECRET
  let signedToken
  if (expiresIn) {
    signedToken = jwt.sign(payload, privateKey, { expiresIn })
  } else {
    signedToken = jwt.sign(payload, privateKey)
  }

  return signedToken
}

export const DecodeData = (token) => {
  try {
    // First verify the token.
    const publicKey = process.env.SECRET
    const verifiedToken = jwt.verify(token, publicKey)
    return verifiedToken
  } catch (error) {
    return undefined
  }
}
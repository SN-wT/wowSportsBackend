// Lambda script for adding external publicKey to wallet address
import { getPrivKey } from './getPrivKey.js'

export const handler = async function (event, context) {
  let userId = ''
  let publicKey = ''

  try {
    userId = event.userId
    publicKey = event.publicKey
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  if ((userId) && (userId.trim() !== '') && (publicKey) && (publicKey.trim() !== '')) {
    try {
      const Response = await getPrivKey(userId, publicKey)
      return Response
    } catch (error) {
      console.log(error)
      return { error: 'Something went wrong' }
    }
  } else {
    return { error: 'Invalid request' }
  }
}

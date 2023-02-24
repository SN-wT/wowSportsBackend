// Lambda script for creating public accounts
import dotenv from 'dotenv'
import { userDataupdate } from './dbUpdate.js'
import { fbGetUserDetails } from './fbGetUserId.js'
import { genAddress } from './genAddress.js'
import { fbUpdateUserDetails } from './fbUpdateUserId.js'
import { sendFlowToken } from './sendFlow.js'
dotenv.config()

export const handler = async function (event, context) {
  let userId = ''

  try {
    userId = event.userId
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  if ((userId) && (userId.trim() !== '')) {
    const useraddress = await fbGetUserDetails(userId)
    if (!useraddress) {
      const { address, publicKey, privateKey } = await genAddress()
      await userDataupdate(userId, address, publicKey, privateKey)
      await fbUpdateUserDetails(userId, address)
      await sendFlowToken(address, '10.0')
      return { body: address }
    } else {
      return { body: useraddress }
    }
  }
  console.log('Some event missing')
  return { error: 'Invalid request' }
}

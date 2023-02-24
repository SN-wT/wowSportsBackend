// Lambda script for voting poll
import { getPrivKey } from './getPrivKey.js'

export const handler = async function (event, context) {
  let userId = ''
  let pollname = ''
  let choice = ''

  try {
    userId = event.userId
    pollname = event.pollname
    choice = event.choice
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  if ((userId) && (userId.trim() !== '') && (pollname) && (pollname.trim() !== '') && (choice) && (choice.trim() !== '')) {
    try {
      const Response = await getPrivKey(userId, pollname, choice)
      console.log(Response)
      return Response
    } catch (error) {
      console.log(error)
      return { error: 'Something went wrong' }
    }
  } else {
    console.log('Some event missing')
    return { error: 'Invalid request' }
  }
}

import dotenv from 'dotenv'
import { fbUserIdCheck } from './fbUserIdCheck.js'
import { getPrivKey } from './getPrivKey.js'
dotenv.config()

export const handler = async function (event) {
  let userId = ''
  let post = ''
  let url = ''

  try {
    userId = event.userId
    post = event.post
    url = event.url
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  if ((userId) && (userId.trim() !== '') && (post) && (post.trim() !== '') && (url) && (url.trim() !== '')) {
    try {
      const { userIdExist } = await fbUserIdCheck(userId)
      if (userIdExist) {
        const Response = await getPrivKey(userId, post, url)
        return { Response }
      } else {
        return { body: 'User ID not availabe' }
      }
    } catch (error) {
      console.log(error)
      return { error: 'Something went wrong' }
    }
  }
  console.log('Some event missing')
  return { error: 'Invalid request' }
}

import dotenv from 'dotenv'
import { getPostIds } from './getPostIds.js'
import { getPostData } from './getPostData.js'
dotenv.config()

export const handler = async function () {
  const postDetails = []

  try {
    const response = await getPostIds()
    console.log(response)
    for (let i = 0; i < response[0].Count; i++) {
      const acct = response[0].Items[i].address
      const postid = response[0].Items[i].postId
      const PostData = await getPostData(postid, acct)
      postDetails.push(PostData)
    }
    console.log('postDetails ', postDetails)
    return postDetails
  } catch (error) {
    console.log(error)
    return { error: 'Something went wrong' }
  }
}

//Lambda code for getting post details from the contract
import dotenv from 'dotenv'
import { getPostIds } from './getPostIds.js'
import { getPostData } from './getPostData.js'
import { getPostReactions } from './getReactions.js'
dotenv.config()

export const handler = async function () {

  const postDetails = []

  try {
    const response = await getPostIds()
   
    for (let i = 0; i < response.length; i++) {
      const acct = response[i].address
      const postid = response[i].postId
      const PostData = await getPostData(postid, acct)
      const reactionCount = await getPostReactions(postid)
      const reactionDetails = {...PostData, acct, reactionCount}
      postDetails.push(reactionDetails)
    }
  
    return postDetails
  } catch (error) {
    console.log(error)
    return { error: 'Something went wrong' }
  }
}
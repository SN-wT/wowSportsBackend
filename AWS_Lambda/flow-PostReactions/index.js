//Lambda script for capturing post reaction
import dotenv from 'dotenv'
import { reactPost } from './postReactions.js'
dotenv.config()

export const handler = async function (event) {

  let postid = event.postid

  try {
    if((postid) && (postid.trim() !== '')) {
      await reactPost(postid)
      return {body: "Reaction added successfully"}
    }
  } catch (error) {
    console.log(error)
    return { error: 'Something went wrong' }
  }
}
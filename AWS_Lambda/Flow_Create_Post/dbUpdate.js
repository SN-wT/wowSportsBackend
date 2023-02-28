//This script used for updating post details in to DB
import dotenv from 'dotenv'
import { ddbDocumentClient } from './getPrivKey.js'
dotenv.config()

// Function to postDataupdate in DB
export const postDataupdate = async (postId, address) => {
  try {
    const updateparams = {
      TableName: 'flowPosts',
      Item: {
        postId,
        address
      }
    }
    await ddbDocumentClient.put(updateparams).promise()
    
    return { body: 'Post created successfully' }
  } catch (err) {
    console.log('err on call ', err)
    return err
  }
}

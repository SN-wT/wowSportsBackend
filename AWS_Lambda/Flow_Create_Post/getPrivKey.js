//This script used to getting user encripted secured keys for create posts
import AWS from 'aws-sdk'
import crypto from 'crypto-js'
import dotenv from 'dotenv'
import { createPost } from './createPost.js'
import { postDataupdate } from './dbUpdate.js'
dotenv.config()

// Aws Config
const awsConfig = {
  region: process.env.AWSregion,
  endpoint: process.env.AWSendpoint,
  accessKeyId: process.env.AWSaccessKeyId,
  secretAccessKey: process.env.AWSsecretAccessKey
}

AWS.config.update(awsConfig)
export const ddbDocumentClient = new AWS.DynamoDB.DocumentClient()
export const getPrivKey = async (userId, post, url) => {
  let encryptPrivateKey = ''
  let address = ''
  let response = 'Something went wrong'

  try {
    const params = {
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      TableName: 'flUserData'
    }
    const result = await ddbDocumentClient.query(params).promise()

    result.Items.forEach(function (itemdata) {
      encryptPrivateKey = itemdata.privateKey
      address = itemdata.address
    })
  } catch (error) {
    console.error(error)
    return
  }

  try {
    if (address === '' || encryptPrivateKey === '') {
      
      return { error: 'Something went wrong' }
    }
    const userPrivateKey = await crypto.AES.decrypt(encryptPrivateKey, process.env.key).toString(crypto.enc.Utf8)
    
    const { postId, statusString } = await createPost(address, userPrivateKey, post, url)
    if (statusString === 'SEALED') {
      response = await postDataupdate(postId, address)
    }
    return response
  } catch (error) {
    console.error(error)
  }
}

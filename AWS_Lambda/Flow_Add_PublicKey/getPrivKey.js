// This page is used for getting user encrypted secured keys for minting
import AWS from 'aws-sdk'
import crypto from 'crypto-js'
import dotenv from 'dotenv'
import { addPublicKey } from './addKey.js'
dotenv.config()

// Aws Config 
const awsConfig = {
  region: process.env.AWSregion,
  endpoint: process.env.AWSendpoint,
  accessKeyId: process.env.AWSaccessKeyId,
  secretAccessKey: process.env.AWSsecretAccessKey
}

AWS.config.update(awsConfig)
const ddbDocumentClient = new AWS.DynamoDB.DocumentClient()
export const getPrivKey = async (userId, publicKey) => {
  let encryptPrivateKey = ''
  let address = ''

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
    const userPrivateKey = await crypto.AES.decrypt(encryptPrivateKey, 'flow@wowT').toString(crypto.enc.Utf8)
    await addPublicKey(address, userPrivateKey, publicKey)
    return { body: 'publicKey added successfully' }
  } catch (error) {
    console.error(error)
  }
}

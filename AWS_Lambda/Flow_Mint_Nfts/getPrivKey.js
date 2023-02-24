// This page is used for getting user encrypted secured keys for minting
import AWS from 'aws-sdk'
import crypto from 'crypto-js'
import dotenv from 'dotenv'
dotenv.config()

// Aws Config - Production
const awsConfig = {
  region: process.env.AWSregion,
  endpoint: process.env.AWSendpoint,
  accessKeyId: process.env.AWSaccessKeyId,
  secretAccessKey: process.env.AWSsecretAccessKey
}

AWS.config.update(awsConfig)
export const ddbDocumentClient = new AWS.DynamoDB.DocumentClient()
export const getPrivKey = async (userId) => {
  let encryptPrivateKey = ''
  let privateKey = ''

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
    })
  } catch (error) {
    console.error(error)
  }

  privateKey = await crypto.AES.decrypt(encryptPrivateKey, process.env.AWSEncryptionKey).toString(crypto.enc.Utf8)
  return privateKey
}

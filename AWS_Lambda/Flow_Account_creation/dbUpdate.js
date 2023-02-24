// This script is used for updating user data into dynamodb table
import AWS from 'aws-sdk'
import crypto from 'crypto-js'
import dotenv from 'dotenv'
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

// Function to userData update in DB
export const userDataupdate = async (userId, address, publicKey, privateKey) => {
  const encryptPrivateKey = await crypto.AES.encrypt(
    privateKey,
    process.env.AWSEncryptionKey
  ).toString()

  try {
    const updateparams = {
      TableName: 'flUserData',
      Item: {
        userId,
        address,
        publicKey,
        privateKey: encryptPrivateKey
      }
    }
    await ddbDocumentClient.put(updateparams).promise()
  } catch (err) {
    console.log('err on call ', err)
    return err
  }
}

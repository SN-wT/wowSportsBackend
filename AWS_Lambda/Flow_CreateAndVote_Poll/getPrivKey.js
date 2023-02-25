// This page is used for getting user encrypted secured keys for voting
import AWS from 'aws-sdk'
import crypto from 'crypto-js'
import dotenv from 'dotenv'
import { votePoll } from './votePoll.js'
import { getPollVoteCounts } from './getPollVoteCounts.js'
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
export const getPrivKey = async (userId, pollname, choice) => {
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
    return { error: 'Something went wrong' }
  }

  try {
    if (address === '' || encryptPrivateKey === '') {
      console.log('Data fetching from DDB failed')
      return { error: 'Something went wrong' }
    }
    const userPrivateKey = await crypto.AES.decrypt(encryptPrivateKey, 'flow@wowT').toString(crypto.enc.Utf8)
    await votePoll(address, userPrivateKey, pollname, choice)
    const response = await getPollVoteCounts(pollname)
    return { body: response }
  } catch (error) {
    console.error(error)
  }
}

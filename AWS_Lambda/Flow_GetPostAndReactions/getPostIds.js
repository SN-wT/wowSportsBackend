import AWS from 'aws-sdk'
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

export const getPostIds = async () => {
  let response = ''
  let params
  const scanResults = []

  try {
    params = {
      Limit: 20,
      Key: {
        sortKey: 'postId'
      },
      ProjectionExpression: '#postId, #address',
      ExpressionAttributeNames: {
        '#postId': 'postId',
        '#address': 'address'
      },
      TableName: 'flowPosts'
    }
    response = await ddbDocumentClient.scan(params).promise()
    scanResults.push(response)
    // console.log(response);
  } catch (error) {
    console.error(error)
  }

  return scanResults
}

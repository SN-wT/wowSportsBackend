//This script used to retrieve post ID from Dynamo DB
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
      TableName: 'flowPosts'
    }
    response = await ddbDocumentClient.scan(params).promise()
    let unSortedArray = response.Items
    
    let sortedArray = unSortedArray.sort((a,b) => b.postId - a.postId)
   
    if(sortedArray.length < 20) {
      for (let i = 0; i < sortedArray.length; i++) {
        scanResults.push(sortedArray[i])
      }
    }
    else{
      for (let i = 0; i < 20; i++) {
        scanResults.push(sortedArray[i])
      }
    }
    
  } catch (error) {
    console.error(error)
  }

  return scanResults
}

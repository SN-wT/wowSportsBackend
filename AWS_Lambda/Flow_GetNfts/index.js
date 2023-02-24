// Lambda script for getting nft details to display in mobile app
import AWS from "aws-sdk"
import dotenv from "dotenv"
dotenv.config()

// Aws Config
const awsConfig = {
    region: process.env.AWSregion,
    endpoint: process.env.AWSendpoint,
    accessKeyId: process.env.AWSaccessKeyId,
    secretAccessKey: process.env.AWSsecretAccessKey
  }
AWS.config.update(awsConfig);
let ddbDocumentClient = new AWS.DynamoDB.DocumentClient(); 


let packName = '';
let nftTable = "flowNFTs";

exports.handler = async (event) => {
    try {
     packName = event.packName;
    }catch (err) {
        console.log('Starting... error in event processing ',err);
        return "error getting NFT pack Name";
      }
    return getNftDetails(packName);
};
//Get NFT details
 async function getNftDetails(packName)
 {
     var result = '';
 try {
       var params = {
           KeyConditionExpression: 'packName = :packName',
           ExpressionAttributeValues: {
               ':packName': packName
           },
           TableName: nftTable
       };
     result = await ddbDocumentClient.query(params).promise()
      
   } catch (error) {
       console.error(error);
       return {"error": "Invalid request"};
   }
  return result;
 }
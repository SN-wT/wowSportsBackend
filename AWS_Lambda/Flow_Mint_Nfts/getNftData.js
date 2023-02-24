// This script is used for getting nft details from dynamodb
import { ddbDocumentClient } from './getPrivKey.js'

export const getNftData = async (packName, nftName) => {
  let result = ''
  const scanResults = []
  const items = ''
  let type = ''
  let url = ''
  let ARUrl = ''
  let utility = ''
  let target = ''
  let specific = ''
  let specific1 = ''
  let params

  try {
    params = {
      KeyConditionExpression: 'packName = :packName',
      ExpressionAttributeValues: {
        ':packName': packName
      },
      TableName: 'flowNFTs'
    }
    result = await ddbDocumentClient.query(params).promise()
  } catch (error) {
    console.error(error)
  }

  result.Items.forEach(function () {
    do {
      result.Items.forEach((item) => scanResults.push(item))
      params.KeyConditionExpression = items.LastEvaluatedKey
    }
    while (typeof result.LastEvaluatedKey !== 'undefined')

    const nfts = scanResults[0].NFTS

    for (let i = 0; i < nfts.length; i++) {
      if (nfts[i].Name === nftName) {
        type = nfts[i].type
        url = nfts[i].Url
        ARUrl = nfts[i].ARUrl
        utility = nfts[i].Utility
        target = nfts[i].target
        specific = nfts[i].specific
        specific1 = nfts[i].specific1
      }
    }
  })
  return { type, url, ARUrl, utility, target, specific, specific1 }
}

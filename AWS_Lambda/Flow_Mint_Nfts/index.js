// Lambda script for minting nfts
import dotenv from 'dotenv'
import { fbUserIdCheck } from './fbUserIdCheck.js'
import { getPrivKey } from './getPrivKey.js'
import { mintNFT } from './mint.js'
import { fbUpdateDetails } from './fbUpdate.js'
dotenv.config()

export const handler = async function (event, context) {
  let userId = ''
  let address = ''
  let packName = ''
  let nftName = ''

  try {
    userId = event.userId
    address = event.address
    packName = event.packName
    nftName = event.nftName
  } catch (err) {
    console.log('Starting... error with event processing ', err)
    return 'error getting input Details'
  }

  if ((userId) && (userId.trim() !== '') && (address) && (address.trim() !== '') && (packName) && (packName.trim() !== '') && (nftName) && (nftName.trim() !== '')) {
    try {
      const { userIdExist } = await fbUserIdCheck(userId)
      if (userIdExist) {
        const userPrivateKey = await getPrivKey(userId)
        await mintNFT(address, userPrivateKey, nftName, packName)
        await fbUpdateDetails(userId, packName, nftName)
        return { body: 'NFT minted successfully' }
      } else {
        return { body: 'User ID not availabe' }
      }
    } catch (error) {
      console.log(error)
      return { error: 'Something went wrong' }
    }
  }
  return { error: 'Invalid request' }
}

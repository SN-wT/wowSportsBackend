// This script used for updating user nft data for showing corresponding action button (Buy/ action button)

import admin from 'firebase-admin'

export const fbUpdateDetails = async (userId, packName, nftName) => {
  const db = admin.database()
  const userRef = db.ref(`Master/Address/${userId}/${packName}`)
  await userRef.update({ [nftName]: 'minted' })
}

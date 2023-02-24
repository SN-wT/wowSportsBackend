// This script is used for creating user address under firebase userId in firebase
import admin from 'firebase-admin'

export const fbUpdateUserDetails = async (userId, address) => {
  const db = admin.database()
  const userPath = db.ref(`Master/Address/${userId}/`)
  await userPath.update({ address })
  return userId
}

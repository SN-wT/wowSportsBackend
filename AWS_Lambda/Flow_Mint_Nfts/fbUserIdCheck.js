// This script is used for checking user data in firebase
import admin from 'firebase-admin'
import dotenv from 'dotenv'
dotenv.config()

const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key,
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url
}

/// for firebase Real time DB connection
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL,
  authDomain: process.env.authDomain
})

export const fbUserIdCheck = async (userId) => {
  let userIdExist
  const db = admin.database()
  const userPath = db.ref(`Master/Address/${userId}`)
  await userPath.get().then((snapshot) => {
    if (snapshot.exists()) {
      userIdExist = true
    } else {
      userIdExist = false
    }
  }).catch((error) => {
    console.error(error)
  })
  return { userIdExist }
}

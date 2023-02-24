// This script is used generating publickey and privatekey for user creation
import { ethers } from 'ethers'

export const createPubAndPrivateKey = () => {
  const wallet = ethers.Wallet.createRandom()

  const publicKey = wallet.publicKey.replace('0x04', '')
  const privateKey = wallet.privateKey.replace('0x', '')

  return { publicKey, privateKey }
}

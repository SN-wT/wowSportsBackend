// This script for sending flow tokens to public accounts
import { config, mutate, tx } from '@onflow/fcl'
import { admin } from './adminAcc.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

export const sendFlowToken = async (recepient, amount) => {
  console.log('Sending flowToken')

  // Our Cadence code for sending flow tokens
  const cadence = `
  import FungibleToken from 0x9a0766d93b6608b7
    import FlowToken from 0x7e60df042a9c0868

    transaction(recepient: Address, amount: UFix64){
      prepare(signer: AuthAccount){
        let sender = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
          ?? panic("Could not borrow Provider reference to the Vault")

        let receiverAccount = getAccount(recepient)

        let receiver = receiverAccount.getCapability(/public/flowTokenReceiver)
          .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
          ?? panic("Could not borrow Receiver reference to the Vault")

                let tempVault <- sender.withdraw(amount: amount)
        receiver.deposit(from: <- tempVault)
      }
    }
  `

  // List of arguments
  const proposer = admin
  const payer = admin
  const authorizations = [admin]

  // "mutate" method will return us transaction id
  const txId = await mutate({
    cadence,
    proposer,
    payer,
    authorizations,
    limit: 999,
    args: (arg, t) => [arg(recepient, t.Address), arg(amount, t.UFix64)]
  })

  console.log(`Submitted transaction ${txId} to the network`)

  const txDetails = await tx(txId).onceSealed()
  console.log('transaction status ', txDetails.statusString)

}

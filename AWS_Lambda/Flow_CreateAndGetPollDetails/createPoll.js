// This script is used for creating poll list
import { config, mutate, tx } from '@onflow/fcl'
import { admin } from './adminAcc.js'

config({
  'accessNode.api': 'https://rest-testnet.onflow.org'
})

const createPoll = async () => {

  // Cadence code for creating poll details
  const cadence = `

  import wowSportsPoll from 0x59b297f21e60da9d

  transaction {

    prepare(acct: AuthAccount) {

      let adminResource = acct.borrow<&wowSportsPoll.PollAdministrator>(from:  /storage/pollAdmin)
  
      adminResource?.createPoll(pollName: "Who will be the NBA champions in 2023", choiceA: "Boston Celtics", choiceB: "Golden State Warriors", choiceC: "LA Lakers", activeFlag: true, pollURL: "https://firebasestorage.googleapis.com/v0/b/flowhackathon.appspot.com/o/pollImages%2FNBA_Finals_(2023).png?alt=media&token=86a2fb99-3510-43d1-8536-23f8b4b16bef")
    
       adminResource?.createPoll(pollName: "The Premier League 2022-23 is intensely competitive. Who do you think will finish fourth", choiceA: "Newcastle United", choiceB: "Tottenham Hotspur", choiceC: "Liverpool", activeFlag: true, pollURL: "https://firebasestorage.googleapis.com/v0/b/flowhackathon.appspot.com/o/pollImages%2FpremierLeague.png?alt=media&token=500f4dec-85ce-4ecb-9876-b557d08c0d1b")
  
       adminResource?.createPoll(pollName: "Manchester United are on the lookout for a central striker. Who should they purchase in the next transfer window", choiceA: "Harry Kane", choiceB: "Victor Osimhen", choiceC: "Dusan Vlahovic", activeFlag: true, pollURL: "https://firebasestorage.googleapis.com/v0/b/flowhackathon.appspot.com/o/pollImages%2FmanchesterUnited.png?alt=media&token=cf8b102e-9cee-4ba5-87c4-7fd2ab84cbea")
  
       adminResource?.createPoll(pollName: "Which F1 Team will improve the most in the constructors' standings in the F1 championship 2023", choiceA: "Mclaren", choiceB: "Alfa Romeo", choiceC: "Aston Martin", activeFlag: true, pollURL: "https://firebasestorage.googleapis.com/v0/b/flowhackathon.appspot.com/o/pollImages%2FF1Team.png?alt=media&token=c6b188a1-2ca0-4b51-a5aa-2cfdcd76b9dd")
        
    }
  
    execute {
      
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
    limit: 999
  })

  console.log(`Submitted transaction ${txId} to the network`)

  const txDetails = await tx(txId).onceSealed()
  console.log({ txDetails })
}

createPoll()

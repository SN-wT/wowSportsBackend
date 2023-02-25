import wowSportsPoll from 0x59b297f21e60da9d

transaction {

  prepare(acct: AuthAccount) {

       if (acct.borrow<&wowSportsPoll.checkAddrResource>(from: /storage/address) == nil) {
              acct.save(<- wowSportsPoll.getAddrResource(), to: /storage/address)
      }
      let resourceCheck = acct.borrow<&wowSportsPoll.checkAddrResource>(from: /storage/address)
  let temp <- wowSportsPoll.getPollAdmin()

  temp.voteOnPoll(pollname: "Who will be the NBA champions in 2023", choice: "Golden State Warriors", addressCheckResource: resourceCheck!)

  destroy temp;
    
  }

  execute {

  
  }
}

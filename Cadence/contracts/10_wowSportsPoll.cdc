pub contract wowSportsPoll {

   
    // A mapping of poll name to a struct holding choices
    access(account) let wowSportsPollsMaster: {String: Choices}

    // A mapping of all accounts which voted in a poll to prevent re-voting
    access(account) let votedAccountXref: {Address: {String: String}}
    
    // Count of votes for all choices 
    access(account) let choiceVotesCount: {String: {String: Int}}


    // 
   pub struct Choices {

            pub var choiceA: String;
            pub var choiceB: String;
            pub var choiceC: String;
            pub var pollURL: String;
            pub var active: Bool;

            init(choiceA: String, choiceB: String, choiceC: String, activeFlag: Bool, pollURL: String) {

                self.choiceA = choiceA;
                self.choiceB = choiceB;
                self.choiceC = choiceC;
                self.pollURL = pollURL
                self.active = activeFlag;

            }

    }

  // Apart from inits creating the poll admin here
  // for use from transactions
  // only the admin can create modify polls
  init() {

      self.votedAccountXref = {}
      self.wowSportsPollsMaster = {}
      self.choiceVotesCount = {} 
      self.account.save<@PollAdministrator>(<- create PollAdministrator(), to: /storage/pollAdmin)
          
  }

   pub fun getPollDetails(): {String: Choices} {

        return self.wowSportsPollsMaster;
        
  }


  pub fun getVoteCount(pollname: String): {String: Int} {

        return self.choiceVotesCount[pollname] ?? {};
        
  }


    pub fun getVotesByAccount(account: Address): {String: String} {

        return self.votedAccountXref[account] ?? {};
        
  }

  // Providing a resource accessible through interface      
   pub fun getPollAdmin(): @PollAdministrator{IPollAdmin} {

            return <- create PollAdministrator()

    }


   pub resource interface IPollAdmin {

        pub fun voteOnPoll(pollname: String, choice: String, addressCheckResource: &wowSportsPoll.checkAddrResource): {String: Int}
        
    }

    
  pub resource PollAdministrator: IPollAdmin {


   pub fun createPoll(pollName: String,choiceA: String, choiceB: String, choiceC: String, activeFlag: Bool, pollURL: String) {

                let choices = wowSportsPoll.Choices(choiceA: choiceA, choiceB: choiceB, choiceC: choiceC, activeFlag: activeFlag, pollURL: pollURL);
                
                wowSportsPoll.wowSportsPollsMaster[pollName] = choices;

    }

  //
  //
  pub fun voteOnPoll(pollname: String, choice: String, addressCheckResource: &wowSportsPoll.checkAddrResource): {String: Int} {
   

        pre {
            (addressCheckResource != nil && addressCheckResource.owner != nil && addressCheckResource.owner?.address != nil) : "Provided resource is not valid"
            wowSportsPoll.wowSportsPollsMaster[pollname] != nil && wowSportsPoll.wowSportsPollsMaster[pollname]?.active! : "This poll is not active"
            wowSportsPoll.votedAccountXref[addressCheckResource.owner?.address!] == nil || wowSportsPoll.votedAccountXref[addressCheckResource.owner?.address!]![pollname] == nil : "You have already voted on this poll!"
            (wowSportsPoll.wowSportsPollsMaster[pollname]?.choiceA == choice || wowSportsPoll.wowSportsPollsMaster[pollname]?.choiceB == choice || wowSportsPoll.wowSportsPollsMaster[pollname]?.choiceC == choice) : "Not valid choice for the poll"
        }
            let votes =  wowSportsPoll.choiceVotesCount[pollname] ?? {}
            let votecount = votes[choice] ?? 0
            votes[choice] = votecount + 1
            wowSportsPoll.choiceVotesCount[pollname] = votes
            wowSportsPoll.votedAccountXref[addressCheckResource.owner?.address!] = {pollname: choice}
            return wowSportsPoll.choiceVotesCount[pollname] ?? {"Error": 000}

  }

  
  }

  // To perform address check
  //  
   pub resource checkAddrResource {

     pub fun checkAddress() {
            let address: String = "Address"
          }
    }

    pub fun getAddrResource(): @checkAddrResource {
            return <- create checkAddrResource()
    }
}
// Flow Account creation
// This transaction create SignatureAlgorithm = ECDSA_secp256k1 and HashAlgorithm = SHA3_256
transaction {
    prepare(acct: AuthAccount) {
    let publicKey = "56de0c2d4f1cd200922211db855b3b33c3c9abd7269f4f39485abacf4fe696c0b808450a0bee2bf651168c263a6883f5e9ddcea387715841cd56d10d059091fa";
  
    
     let key = PublicKey(
              publicKey: publicKey.decodeHex(),             
              signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
            )
    
            let account = AuthAccount(payer: acct)
            log("account is ".concat(account.address.toString()))

            account.keys.add(
              publicKey: key,
              hashAlgorithm: HashAlgorithm.SHA3_256,
              weight: 1000.0
          )
    }
}
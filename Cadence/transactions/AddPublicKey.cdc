// This transaction is used for adding publickey to account address
transaction(publicKey: String) {
    prepare(signer: AuthAccount) {
      let bytes = publicKey.decodeHex()

      let key = PublicKey(
        publicKey: bytes,
        signatureAlgorithm: SignatureAlgorithm.ECDSA_secp256k1
      )

      signer.keys.add(
        publicKey: key,
        hashAlgorithm: HashAlgorithm.SHA3_256,
        weight: 1000.0
      )
    }
  }
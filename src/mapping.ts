import {
    ChangeUnwrapFee,
    Erc20Wrap,
    Erc20Unwrap,
    Erc721Wrap,
    Erc721Unwrap,
    Erc1155Wrap,
    Erc1155Unwrap,
    ComputeOutputAmount,
    ComputeInputAmount,
    NewTokensRegistered,
    TransferBatch,
    TransferSingle,
    ForwardedOceanTransaction,
    OceanTransaction
} from "../generated/Ocean/Ocean"
import {
    loadComputeInputAmountInteraction,
    loadComputeOutputAmountInteraction,
    loadErc1155WrapInteraction,
    loadErc20UnwrapInteraction,
    loadErc20WrapInteraction,
    loadErc721UnwrapInteraction,
    loadErc721WrapInteraction,
    loadUser,
    loadUnwrapFee,
    loadFee,
    loadOceanTransaction,
    loadErc20ExternalContract,
    loadErc721ExternalContract, 
    loadErc721Token,
    loadErc1155ExternalContract,
    loadErc1155Token,
    loadErc1155UnwrapInteraction,
    loadPrimitive,
    loadBurn, 
    loadMint,
    loadOceanToken,
    loadRegisteredToken,
    loadForwarderTransaction,
    loadUserTransfer,
    loadTokenRegistry,
    loadUserBalance,
} from "./loaders"
import {
    zeroAddress,
    validateOcean,
    ONE_BI,
} from './helpers'
import {
    recognizeErc20ExternalContract,
    recognizeErc1155ExternalContract,
    recognizeErc721ExternalContract,
    recognizePrimitive,
    checkErc20NegativeWrappedAmount,
    checkRegisteredTokenOceanSupply,
    checkForwarderUserAlignment,
    checkOperatorUserAlignment,
    checkErc721WrapCount,
    checkErc721UnwrapCount,
    checkErc1155UnwrapCount,
    checkErc1155NegativeOceanSupply,
    checkErc721NegativeOceanSupply,
    checkOceanTokenNegativeSupply,
} from "./checkers"
import { log } from "@graphprotocol/graph-ts"

export function handleOceanTransaction(event: OceanTransaction): void {
    if (validateOcean(event.address)){
        // Get the Ocean Transaction and save it's user
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        oceanTransaction.user = event.params.user.toHexString()
        oceanTransaction.timestamp = event.block.timestamp
        oceanTransaction.block = event.block.number
        oceanTransaction.save()
    }
}

export function handleChangeUnwrapFee(event: ChangeUnwrapFee): void {
    if (validateOcean(event.address)){
        // Get new fee atributes and add them to fee entity
        let feeId = event.transaction.hash.toHexString() + '-' + event.params.sender.toHexString()
        let fee = loadFee(feeId)
        fee.feeAmount = event.params.newFee
        fee.owner = event.params.sender.toHexString()
        fee.timestamp = event.block.timestamp
        fee.block = event.block.number
        fee.save()

        // Get the unwrap fee attributes and add them to the unwrap fee entity
        let unwrapFee = loadUnwrapFee('UnwrapFeeId')
        unwrapFee.currentFee = feeId
        let previousFees = unwrapFee.previousFees
        previousFees.push(feeId)
        unwrapFee.previousFees = previousFees
        unwrapFee.save()   
    }
}   

export function handleErc20Wrap(event: Erc20Wrap): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        // Generate the Interaction ID
        let oceanInteractions = oceanTransaction.interactions
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add add attriubutes to the Ocean Transaction
        let interaction = loadErc20WrapInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Load the external contract and update its attributes
        let externalContract = loadErc20ExternalContract(event.params.erc20Token)
        externalContract.wrappedAmount = externalContract.wrappedAmount.plus(event.params.wrappedAmount)
        externalContract.save()

        // Add the attributes to the interaction entity
        interaction.wrappedTokenId = event.params.oceanId.toString()
        interaction.transferredAmount = event.params.transferredAmount
        interaction.wrappedAmount = event.params.wrappedAmount
        interaction.dust = event.params.dust
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.erc20Token.toHexString()
        interaction.save()

        // Load the user and add its attributes to the entity
        let user = loadUser(event.params.user)
        let userErc20Wraps = user.erc20Wraps
        userErc20Wraps.push(interactionId)
        user.erc20Wraps = userErc20Wraps
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save() 

        // Load Ocean Token and add its initial parameters
        let oceanToken = loadOceanToken(event.params.oceanId.toString())
        oceanToken.sourceContract = event.params.erc20Token.toHexString()
        oceanToken.contractType = 'ERC-20'
        oceanToken.contractNonce = null
        oceanToken.save()

        // Mark the External Contract as recognized
        recognizeErc20ExternalContract(externalContract, 'Wrap', interactionId, event.block.timestamp)
    }
}

export function handleErc20Unwrap(event: Erc20Unwrap): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        let oceanInteractions = oceanTransaction.interactions
        // Generate the Interaction ID
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction entity 
        let interaction = loadErc20UnwrapInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Load the External Contract and update its attributes
        let externalContract = loadErc20ExternalContract(event.params.erc20Token)
        externalContract.wrappedAmount = externalContract.wrappedAmount.minus(event.params.unwrappedAmount)
        externalContract.cumulativeFees = externalContract.cumulativeFees.plus(event.params.feeCharged)
        externalContract.save()  

        // Add the attributes to the Interaction entity
        interaction.wrappedTokenId = event.params.oceanId.toString()
        interaction.transferredAmount = event.params.transferredAmount
        interaction.unwrappedAmount = event.params.unwrappedAmount
        interaction.feeCharged = event.params.feeCharged
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.erc20Token.toHexString()
        interaction.save() 
    
        // Load the User and add its attributes
        let user = loadUser(event.params.user)
        let userErc20Unwraps = user.erc20Unwraps
        userErc20Unwraps.push(interactionId)
        user.erc20Unwraps = userErc20Unwraps
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save()  
        
        // Check if the wrapped amount is negative
        checkErc20NegativeWrappedAmount(externalContract, interactionId, event.block.timestamp)
        // Check if the External Contract has been recognized
        recognizeErc20ExternalContract(externalContract, 'Unwrap',  interactionId, event.block.timestamp)
    }
}

export function handleErc721Wrap(event: Erc721Wrap): void {
    if (validateOcean(event.address)) {
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        let oceanInteractions = oceanTransaction.interactions
        // Generate the Interaction ID
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction
        let interaction = loadErc721WrapInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Load the External Contract and update its attributes
        let externalContract = loadErc721ExternalContract(event.params.erc721Token)
        let externalContractTokens = externalContract.tokenIds
        let tokenOceanId = event.params.oceanId.toString()
        if (!externalContractTokens.includes(tokenOceanId)) {
            externalContractTokens.push(tokenOceanId)
        }
        externalContract.tokenIds = externalContractTokens
        externalContract.save()

        // Add the attributes to the Interaction entity
        interaction.wrappedTokenId = tokenOceanId
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.erc721Token.toHexString()
        interaction.save()
        
        // Load the User and add its attributes
        let user = loadUser(event.params.user)
        let userErc721Wraps = user.erc721Wraps
        userErc721Wraps.push(interactionId)
        user.erc721Wraps = userErc721Wraps
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save() 

        // Load ERC-721 token, check for a count warning, and update its supply
        let token = loadErc721Token(tokenOceanId)
        checkErc721WrapCount(token, interaction)
        token.wrappedOceanSupply = token.wrappedOceanSupply.plus(ONE_BI)
        token.save()
        
        // Load Ocean Token and add its initial parameters
        let oceanToken = loadOceanToken(event.params.oceanId.toString())
        oceanToken.sourceContract = event.params.erc721Token.toHexString()
        oceanToken.contractType = 'ERC-721'
        oceanToken.contractNonce = event.params.erc721id
        oceanToken.save()

        // Mark the External Contract as recognized
        recognizeErc721ExternalContract(externalContract, 'Wrap',  interactionId, event.block.timestamp)
    }
}

export function handleErc721Unwrap(event: Erc721Unwrap): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        // Generate the Interaction ID
        let oceanInteractions = oceanTransaction.interactions
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction
        let interaction = loadErc721UnwrapInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Add the attributes to the Interaction entity
        let tokenOceanId = event.params.oceanId.toString()
        interaction.user = event.params.user.toHexString()
        interaction.wrappedTokenId = tokenOceanId
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.erc721Token.toHexString()
        interaction.save()  
        
        // Load the User and add its attributes to the entity
        let user = loadUser(event.params.user)
        let userErc721Unwraps = user.erc721Unwraps
        userErc721Unwraps.push(interactionId)
        user.erc721Unwraps = userErc721Unwraps
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save() 

        // Load ERC-721 token, check for a count warning, and update its supply
        let token = loadErc721Token(tokenOceanId)
        checkErc721UnwrapCount(token, interaction)
        token.wrappedOceanSupply = token.wrappedOceanSupply.minus(ONE_BI)
        token.save()

        // Check if the token has a negative Ocean Supply
        checkErc721NegativeOceanSupply(token, interaction)
        // Check if the External Contract has been recognized
        let externalContract = loadErc721ExternalContract(event.params.erc721Token)
        recognizeErc721ExternalContract(externalContract, 'Unwrap',  interactionId, event.block.timestamp)
    }
}
// Code review ended here
export function handleErc1155Wrap(event: Erc1155Wrap): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        // Generate the Interaction ID
        let oceanInteractions = oceanTransaction.interactions
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction
        let interaction = loadErc1155WrapInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Load the Cxternal Contract and update its attributes
        let externalContract = loadErc1155ExternalContract(event.params.erc1155Token)
        let externalContractTokens = externalContract.tokenIds
        let tokenOceanId = event.params.oceanId.toString()
        if (!externalContractTokens.includes(tokenOceanId)) {
            externalContractTokens.push(tokenOceanId)
        }
        externalContract.tokenIds = externalContractTokens
        externalContract.save()  

        // Add the attributes to the Interaction entity
        interaction.user = event.params.user.toHexString()
        interaction.wrappedTokenId = tokenOceanId
        interaction.wrappedAmount = event.params.amount
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.erc1155Token.toHexString()
        interaction.save()
    
        // Load the User and add its attributes to the entity
        let user = loadUser(event.params.user)
        let userErc1155Wraps = user.erc1155Wraps
        userErc1155Wraps.push(interactionId)
        user.erc1155Wraps = userErc1155Wraps
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save()
    
        // Load ERC-1155 Token and update its supply
        let token = loadErc1155Token(tokenOceanId)
        token.wrappedOceanSupply = token.wrappedOceanSupply.plus(event.params.amount)
        token.save()

        // Load Ocean Token and add its initial parameters
        let oceanToken = loadOceanToken(event.params.oceanId.toString())
        oceanToken.sourceContract = event.params.erc1155Token.toHexString()
        oceanToken.contractType = 'ERC-1155'
        oceanToken.contractNonce = event.params.erc1155Id
        oceanToken.save()

        // Mark the External Contract as recognized
        recognizeErc1155ExternalContract(externalContract, 'Wrap',  interactionId, event.block.timestamp)
    }  
}

export function handleErc1155Unwrap(event: Erc1155Unwrap): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        // Generate the Interaction ID
        let oceanInteractions = oceanTransaction.interactions
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction
        let interaction = loadErc1155UnwrapInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Add the attributes to the Interaction entity
        let tokenOceanId = event.params.oceanId.toString()
        interaction.user = event.params.user.toHexString()
        interaction.wrappedTokenId = tokenOceanId
        interaction.unwrappedAmount = event.params.amount
        interaction.feeCharged = event.params.feeCharged
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.erc1155Token.toHexString()
        interaction.save()

        // Load the user and add its attributes
        let user = loadUser(event.params.user)
        let userErc1155Unwraps = user.erc1155Unwraps
        userErc1155Unwraps.push(interactionId)
        user.erc1155Unwraps = userErc1155Unwraps
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save()   
    
        // Load ERC-1155 token, check for a count warning, and update its supply
        let token = loadErc1155Token(tokenOceanId)
        checkErc1155UnwrapCount(token, interaction)
        token.wrappedOceanSupply = token.wrappedOceanSupply.minus(event.params.amount)
        token.cumulativeFees = token.cumulativeFees.plus(event.params.feeCharged)
        token.save()

        // Check if the token has a negative Ocean Supply
        checkErc1155NegativeOceanSupply(token, interaction)
        // Check if the External Contract has been recognized
        let externalContract = loadErc1155ExternalContract(event.params.erc1155Token)
        recognizeErc1155ExternalContract(externalContract, 'Unwrap',  interactionId, event.block.timestamp)
    }
}

export function handleComputeOutputAmount(event: ComputeOutputAmount): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        // Generate the Interaction ID
        let oceanInteractions = oceanTransaction.interactions
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction
        let interaction = loadComputeOutputAmountInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Create variables for Input and Output Tokens
        let inputTokenId = event.params.inputToken.toString()
        let inputTokenAmount = event.params.inputAmount
        let outputTokenId = event.params.outputToken.toString()
        let outputTokenAmount = event.params.outputAmount
        
        // Load primitive and add its attributes
        let primitive = loadPrimitive(event.params.primitive)
        let primitiveUsers = primitive.users
        primitiveUsers.push(event.params.user.toHexString())
        primitive.users = primitiveUsers
        if (event.block.timestamp < primitive.createdTimestamp) {
            primitive.createdTimestamp = event.block.timestamp
        }
        primitive.save()

        // Add the attributes to the Interaction entity
        interaction.inputToken = inputTokenId
        interaction.inputAmount = inputTokenAmount
        interaction.outputToken = outputTokenId
        interaction.outputAmount = outputTokenAmount
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = event.params.primitive.toHexString()
        interaction.save()

        // Load the User and add its attributes to the entity
        let user = loadUser(event.params.user)
        let computeOutputAmounts = user.computeOutputAmounts
        computeOutputAmounts.push(interactionId)
        user.computeOutputAmounts = computeOutputAmounts
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save() 
    
        // Recalculate supply for registered tokens
        if (primitive.registeredTokens.includes(inputTokenId)) {
            let inputRegisteredToken = loadRegisteredToken(inputTokenId)
            inputRegisteredToken.supply = inputRegisteredToken.supply.minus(inputTokenAmount)
            inputRegisteredToken.save()
            checkRegisteredTokenOceanSupply(inputRegisteredToken, interactionId, 'Output', event.block.timestamp)
        }
        if (primitive.registeredTokens.includes(outputTokenId)) {
            let outputRegisteredToken = loadRegisteredToken(outputTokenId)
            outputRegisteredToken.supply = outputRegisteredToken.supply.plus(outputTokenAmount)
            outputRegisteredToken.save()
        }

        // Mark the Primitive as recognized
        recognizePrimitive(primitive, 'Compute',  interactionId, event.block.timestamp)
    }
}

export function handleComputeInputAmount(event: ComputeInputAmount): void {
    if (validateOcean(event.address)){
        // Load Ocean Transaction
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        // Generate the Interaction ID
        let oceanInteractions = oceanTransaction.interactions
        let interactionId = (oceanInteractions == null) 
            ? `${oceanTransactionId}-I-0`
            : `${oceanTransactionId}-I-${oceanInteractions.length}`
        // Load interaction and add attriubutes to the Ocean Transaction
        let interaction = loadComputeInputAmountInteraction(interactionId)
        oceanInteractions.push(interactionId)
        oceanTransaction.interactions = oceanInteractions
        oceanTransaction.save()

        // Create variables for Input and Output Tokens
        let inputTokenId = event.params.inputToken.toString()
        let inputTokenAmount = event.params.inputAmount
        let outputTokenId = event.params.outputToken.toString()
        let outputTokenAmount = event.params.outputAmount

        // Load the Primitive and update its attributes
        let primitive = loadPrimitive(event.params.primitive)
        let primitiveUsers = primitive.users
        primitiveUsers.push(event.params.user.toHexString())
        primitive.users = primitiveUsers
        if (event.block.timestamp < primitive.createdTimestamp) {
            primitive.createdTimestamp = event.block.timestamp
        }
        primitive.save()

        // Add the attributes to the Interaction entity
        interaction.inputToken = inputTokenId
        interaction.inputAmount = inputTokenAmount
        interaction.outputToken = outputTokenId
        interaction.outputAmount = outputTokenAmount
        interaction.user = event.params.user.toHexString()
        interaction.timestamp = event.block.timestamp
        interaction.block = event.block.number
        interaction.externalContract = primitive.id
        interaction.save()
        
        // Load the User and add its attributes to the entity
        let userAddress = event.params.user
        let user = loadUser(userAddress)
        let computeInputAmounts = user.computeInputAmounts
        computeInputAmounts.push(interactionId)
        user.computeInputAmounts = computeInputAmounts
        if (event.block.timestamp < user.createdTimestamp) {
            user.createdTimestamp = event.block.timestamp
        }
        user.save() 
        
        // Recalculate supply for registered tokens
        if (primitive.registeredTokens.includes(inputTokenId)) {
            let inputRegisteredToken = loadRegisteredToken(inputTokenId)
            inputRegisteredToken.supply = inputRegisteredToken.supply.minus(inputTokenAmount)
            inputRegisteredToken.save()
            checkRegisteredTokenOceanSupply(inputRegisteredToken, interactionId, 'Input', event.block.timestamp)
        }
        if (primitive.registeredTokens.includes(outputTokenId)) {
            let outputRegisteredToken = loadRegisteredToken(outputTokenId)
            outputRegisteredToken.supply = outputRegisteredToken.supply.plus(outputTokenAmount)
            outputRegisteredToken.save()
        }

        // Mark the Primitive as recognized
        recognizePrimitive(primitive, 'Compute',  interactionId, event.block.timestamp)
    }
}

export function handleNewTokensRegistered(event: NewTokensRegistered): void {
    if (validateOcean(event.address)){
        // Load the Token Registry and add its attributes
        let registryId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
        let registry = loadTokenRegistry(registryId)
        registry.creator = event.params.creator.toHexString()
        let tokensArray = new Array<string>();
        registry.timestamp = event.block.timestamp
        registry.block = event.block.number

        // Load the Primitive and update its attributes
        let primitive = loadPrimitive(event.params.creator)
        let primitiveRegisteredTokens = primitive.registeredTokens
        if (event.block.timestamp < primitive.createdTimestamp) {
            primitive.createdTimestamp = event.block.timestamp
        }
        
        // Iterate over the Registered Tokens and save them with their attributes
        let tokensRegistered = event.params.tokens
        let nonces = event.params.nonces
        for (let i = 0; i < tokensRegistered.length; ++i) {
            let registeredTokenId = tokensRegistered[i].toString()
            tokensArray.push(registeredTokenId)
            let registeredToken = loadRegisteredToken(registeredTokenId)
            registeredToken.issuer = event.params.creator.toHexString()
            registeredToken.createdTimestamp = event.block.timestamp
            registeredToken.save()
            primitiveRegisteredTokens.push(registeredTokenId)

            // Load Ocean Token and add its initial parameters
            let oceanToken = loadOceanToken(registeredTokenId)
            oceanToken.sourceContract = event.params.creator.toHexString()
            oceanToken.contractType = 'OceanPrimitive'
            oceanToken.contractNonce = nonces[i]
            oceanToken.save()
        }

        registry.tokens = tokensArray
        registry.save()
        // Add the registered tokens to the Primitive
        primitive.registeredTokens = primitiveRegisteredTokens
        primitive.save()

        // Mark the Primitive as recognized
        recognizePrimitive(primitive, 'Register',  registryId, event.block.timestamp)
    } 
}

export function handleTransferBatch(event: TransferBatch): void {
    if (validateOcean(event.address)) {
        // Load the ocean transaction 
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        checkOperatorUserAlignment(oceanTransaction, event.params.operator, 'Transfer Batch', event.logIndex)

        // Declare initial variables
        let tokenIds = event.params.ids
        let tokenValues = event.params.values
        let to = event.params.to
        let from = event.params.from
        
        // If the to address is the zero address, then the transfers are Burns
        if (to == zeroAddress) {
            let oceanBurns = oceanTransaction.burns
            // Iterate over the list of tokens and generate the Burn IDs
            for (let i = 0; i < tokenIds.length; ++i) {
                let burnId = (oceanBurns == null)
                    ? `${oceanTransactionId}-B-0`
                    : `${oceanTransactionId}-B-${oceanBurns.length}`
                let tokenId = tokenIds[i]
                let burnAmount = tokenValues[i]
                
                // Load the Burn and add its attributes
                let burn = loadBurn(burnId)
                burn.to = to.toHexString()
                burn.from = from.toHexString()
                burn.oceanToken = tokenId.toString()
                burn.amount = burnAmount
                burn.save() 
                
                // Add the Burn to the list of oceanBurns
                oceanBurns.push(burnId)

                // Load the Ocean Token used in the Burn and update its attributes
                let oceanToken = loadOceanToken(tokenId.toString())
                oceanToken.supply = oceanToken.supply.minus(burnAmount)
                oceanToken.save()

                // Load the User Balance for the user that sends and add its attributes
                let userBalanceId = `${from.toHexString()}-${tokenId.toString()}`
                let userBalance = loadUserBalance(userBalanceId)
                userBalance.user = from.toHexString()
                userBalance.oceanId = tokenId.toString()
                userBalance.balance = userBalance.balance.minus(burnAmount)
                userBalance.save()

                // Check that the Ocean Token doesn't have a negative supply
                checkOceanTokenNegativeSupply(oceanToken, burnId, 'Transfer Batch', event.block.timestamp)
            }   
            // Add the list of Burns to the Ocean Transaction
            oceanTransaction.burns = oceanBurns
            oceanTransaction.save()
        }
        // If the from address is the zero address, then the transfers are mints
        else if (from == zeroAddress){
            let oceanMints = oceanTransaction.mints
            // Iterate over the list of tokens and generate the mint IDs
            for (let i = 0; i < tokenIds.length; ++i) {
                let mintId = (oceanMints == null) 
                    ? `${oceanTransactionId}-M-0`
                    : `${oceanTransactionId}-M-${oceanMints.length}`
                let tokenId = tokenIds[i]
                let mintAmount = tokenValues[i]
                
                // Load the mint with its id and save it
                let mint = loadMint(mintId)
                mint.to = to.toHexString()
                mint.from = from.toHexString()
                mint.oceanToken = tokenId.toString()
                mint.amount = mintAmount
                mint.save()

                // Add the mint to the list of oceanMints
                oceanMints.push(mintId)

                // Load the ocean token used in the mint and updat its attributes
                let oceanToken = loadOceanToken(tokenId.toString())
                oceanToken.supply = oceanToken.supply.plus(mintAmount)
                oceanToken.save()

                // Load the User Balance for the user that receives and add its attributes
                let userBalanceId = `${to.toHexString()}-${tokenId.toString()}`
                let userBalance = loadUserBalance(userBalanceId)
                userBalance.user = to.toHexString()
                userBalance.oceanId = tokenId.toString()
                userBalance.balance = userBalance.balance.plus(mintAmount)
                userBalance.save()

                // Add the User Balance to the user balances list
                let user = loadUser(to)
                let userBalances = user.userBalances
                if (!userBalances.includes(userBalanceId)) {
                    userBalances.push(userBalanceId)
                }
                user.userBalances = userBalances
                user.save()

                

                // Check that the Ocean Token doesn't have a negative supply
                checkOceanTokenNegativeSupply(oceanToken, mintId, 'Transfer Batch', event.block.timestamp)
            } 
            // Add the list of mints to the ocean transaction
            oceanTransaction.mints = oceanMints
            oceanTransaction.save()
        }
        // If neither of the to and from addresses are the Zero address then it's a User Transfer
        else if (to != zeroAddress && from != zeroAddress) {
            let transfers = new Array<string>();
            let fromBalances = new Array<string>();
            let toBalances = new Array<string>();
            for (let i = 0; i < tokenIds.length; ++i) {
                // Generate the id and load the User Transfer entity to add the attributes
                let userTransferId = `${event.transaction.hash.toHexString()}-${event.logIndex}-${i}`
                transfers.push(userTransferId)
                let userTransfer = loadUserTransfer(userTransferId)
                userTransfer.from = from.toHexString()
                userTransfer.to = to.toHexString()
                userTransfer.oceanToken = tokenIds[i].toString()
                userTransfer.amount = tokenValues[i]
                userTransfer.block = event.block.number
                userTransfer.timestamp = event.block.timestamp
                userTransfer.save()

                // Load the User Balance for the user that sends and add its attributes
                let fromUserBalanceId = `${from.toHexString()}-${tokenIds[i].toString()}`
                let fromUserBalance = loadUserBalance(fromUserBalanceId)
                fromUserBalance.user = from.toHexString()
                fromUserBalance.oceanId = tokenIds[i].toString()
                fromUserBalance.balance = fromUserBalance.balance.minus(tokenValues[i])
                fromUserBalance.save()
                fromBalances.push(fromUserBalanceId)

                // Load the User Balance for the user that recieves and add its attributes
                let toUserBalanceId = `${to.toHexString()}-${tokenIds[i].toString()}`
                let toUserBalance = loadUserBalance(toUserBalanceId)
                toUserBalance.user = to.toHexString()
                toUserBalance.oceanId = tokenIds[i].toString()
                toUserBalance.balance = toUserBalance.balance.plus(tokenValues[i])
                toUserBalance.save()
                toBalances.push(toUserBalanceId)                
            }

            // Load the user thats transferring and add the transfers and user balances
            let fromUser = loadUser(from) 
            let fromUserTransfers = fromUser.transfers
            fromUserTransfers = fromUserTransfers.concat(transfers)
            fromUser.transfers = fromUserTransfers
            if (event.block.timestamp < fromUser.createdTimestamp) {
                fromUser.createdTimestamp = event.block.timestamp
            }
            fromUser.save()

            // Load the user thats getting transferred and add the transfers and user balances
            let toUser = loadUser(to)
            let toUserTransfers = toUser.transfers
            toUserTransfers = toUserTransfers.concat(transfers)
            toUser.transfers = toUserTransfers
            let toUserBalances = toUser.userBalances
            for (let i = 0; i < toBalances.length; ++i) {
                if (!toUserBalances.includes(toBalances[i])) {
                    toUserBalances.push(toBalances[i])
                }
            }
            toUser.userBalances = toUserBalances
            if (event.block.timestamp < toUser.createdTimestamp) {
                toUser.createdTimestamp = event.block.timestamp
            }
            toUser.save() 
        }  
    }
}

export function handleTransferSingle(event: TransferSingle): void {
    if (validateOcean(event.address)){
        let oceanTransactionId = event.transaction.hash.toHexString()
        let oceanTransaction = loadOceanTransaction(oceanTransactionId)
        checkOperatorUserAlignment(oceanTransaction, event.params.operator, 'Transfer Single', event.logIndex)

        // Declare initial variables
        let from = event.params.from
        let to = event.params.to

        // If the to address is the zero address, then the transfer is a burns
        if (to == zeroAddress) {
            
            let oceanBurns = oceanTransaction.burns
            // Generate the burn ID and its attributes
            let burnId = (oceanBurns == null)
                ? `${oceanTransactionId}-B-0`
                : `${oceanTransactionId}-B-${oceanBurns.length}`
            let tokenId = event.params.id
            let burnAmount = event.params.value
            
            // Load burn and add attributes
            let burn = loadBurn(burnId)
            burn.to = to.toHexString()
            burn.from = from.toHexString()
            burn.oceanToken = tokenId.toString()
            burn.amount = burnAmount
            burn.save()
            
            // Add burn to ocean transaction list
            oceanBurns.push(burnId)
            oceanTransaction.burns = oceanBurns
            oceanTransaction.save()

            // Load Ocean Token and update its supply 
            let oceanToken = loadOceanToken(tokenId.toString())
            oceanToken.supply = oceanToken.supply.minus(burnAmount)
            oceanToken.save() 

            // Load the User Balance for the user that sends and add its attributes
            let userBalanceId = `${from.toHexString()}-${tokenId.toString()}`
            let userBalance = loadUserBalance(userBalanceId)
            userBalance.user = from.toHexString()
            userBalance.oceanId = tokenId.toString()
            userBalance.balance = userBalance.balance.minus(burnAmount)
            userBalance.save()

            // Check that the Ocean Token doesn't have a negative supply
            checkOceanTokenNegativeSupply(oceanToken, burnId, 'Transfer Single', event.block.timestamp)
        }
        // If the from address is the zero address, then the transfer is a  mint 
        else if (from == zeroAddress) {
            let oceanMints = oceanTransaction.mints
            // Generate the mint ID and its attributes
            let mintId = (oceanMints == null)
                ? `${oceanTransactionId}-M-0`
                : `${oceanTransactionId}-M-${oceanMints.length}`
            let tokenId = event.params.id
            let mintAmount = event.params.value

            // Load mint and add attributes
            let mint = loadMint(mintId)
            mint.to = to.toHexString()
            mint.from = from.toHexString()
            mint.oceanToken = tokenId.toString()
            mint.amount = mintAmount
            mint.save()

            // Add mint to ocean transaction list
            oceanMints.push(mintId)
            oceanTransaction.mints = oceanMints
            oceanTransaction.save()

            // Load Ocean Token and update its supply
            let oceanToken = loadOceanToken(tokenId.toString())
            oceanToken.supply = oceanToken.supply.plus(mintAmount)
            oceanToken.save()

            // Load the User Balance for the user that receives and add its attributes
            let userBalanceId = `${to.toHexString()}-${tokenId.toString()}`
            let userBalance = loadUserBalance(userBalanceId)
            userBalance.user = to.toHexString()
            userBalance.oceanId = tokenId.toString()
            userBalance.balance = userBalance.balance.plus(mintAmount)
            userBalance.save()

            // Add the User Balance to the user balances list
            let user = loadUser(to)
            let userBalances = user.userBalances
            if (!userBalances.includes(userBalanceId)) {
                userBalances.push(userBalanceId)
            }
            user.userBalances = userBalances
            user.save()

            // Check that the Ocean Token doesn't have a negative supply
            checkOceanTokenNegativeSupply(oceanToken, mintId, 'Transfer Single', event.block.timestamp)
        }
        // If neither of the to and from addresses are the Zero address then it's a User Transfer
        else if (from != zeroAddress && to != zeroAddress) {
            // Generate the ID and load the entity to add the attributes
            let userTransferId = `${event.transaction.hash.toHexString()}-${event.logIndex}`
            let userTransfer = loadUserTransfer(userTransferId)
            userTransfer.from = from.toHexString()
            userTransfer.to = to.toHexString()
            userTransfer.oceanToken = event.params.id.toString()
            userTransfer.amount = event.params.value
            userTransfer.timestamp = event.block.timestamp
            userTransfer.block = event.block.number
            userTransfer.save()
            
            // Load the User Balance for the user that sends and add its attributes
            let fromUserBalanceId = `${from.toHexString()}-${event.params.id.toString()}`
            let fromUserBalance = loadUserBalance(fromUserBalanceId)
            fromUserBalance.user = from.toHexString()
            fromUserBalance.oceanId = event.params.id.toString()
            fromUserBalance.balance = fromUserBalance.balance.minus(event.params.value)
            fromUserBalance.save()
            
            // Load the User Balance for the user that receives and add its attributes
            let toUserBalanceId = `${to.toHexString()}-${event.params.id.toString()}`
            let toUserBalance = loadUserBalance(toUserBalanceId)
            toUserBalance.user = to.toHexString()
            toUserBalance.oceanId = event.params.id.toString()
            toUserBalance.balance = toUserBalance.balance.plus(event.params.value)
            toUserBalance.save()

            // Load user that is transfering and add the transfer
            let fromUser = loadUser(from) 
            let fromUserTransfers = fromUser.transfers
            fromUserTransfers.push(userTransferId)
            fromUser.transfers = fromUserTransfers
            if (event.block.timestamp < fromUser.createdTimestamp) {
                fromUser.createdTimestamp = event.block.timestamp
            }
            fromUser.save()
            
            // Load the user that is getting transfered and add the transfer and user balance
            let toUser = loadUser(to) 
            let toUserTransfers = toUser.transfers
            toUserTransfers.push(userTransferId)
            toUser.transfers = toUserTransfers
            let toUserBalances = toUser.userBalances
            if (!toUserBalances.includes(toUserBalanceId)) {
                toUserBalances.push(toUserBalanceId)
            }
            toUser.userBalances = toUserBalances
            if (event.block.timestamp < toUser.createdTimestamp) {
                toUser.createdTimestamp = event.block.timestamp
            }
            toUser.save()
        }
    }
}

export function handleForwarderTransaction(event: ForwardedOceanTransaction): void {
    // Generate ID and load the Ocean Transaction entity to add its attributes
    let oceanTransaction = loadOceanTransaction(event.transaction.hash.toHexString())
    let forwarderTransactionId = `${oceanTransaction.id}-${event.logIndex}`
    let forwarderTransaction = loadForwarderTransaction(forwarderTransactionId)
    checkForwarderUserAlignment(oceanTransaction, event.params.forwarder, event.logIndex)
    forwarderTransaction.forwarder = event.params.forwarder.toHexString()
    forwarderTransaction.oceanTransaction = oceanTransaction.id
    forwarderTransaction.save()
}



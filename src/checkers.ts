import { log } from '@graphprotocol/graph-ts'
import { Address, BigInt } from "@graphprotocol/graph-ts";
import {  
  loadWarning
} from "./loaders";

import {
  ZERO_BI,
  ONE_BI
} from "./helpers";

import { ERC1155ExternalContract, ERC1155Token, ERC1155Unwrap, ERC20ExternalContract, ERC721ExternalContract, ERC721Token, ERC721Unwrap, ERC721Wrap, OceanToken, OceanTransaction, Primitive, RegisteredToken } from "../generated/schema";

// Function that checks if the amount of a ERC-721 Token is not zero when being wrapped
export function checkErc721WrapCount(token: ERC721Token, interaction: ERC721Wrap): void {
    // If the count is zero
    if (token.wrappedOceanSupply != ZERO_BI) {
        // Log a warning
        log.warning('ERC-721 supply is not 0 for token {}. The supply is {}.', [token.id, token.wrappedOceanSupply.toString()])
        
        // Create and save a warning entity
        let warningId = `ERC-721-Wrap-Count-Warning-${interaction.id}`
        let warning = loadWarning(warningId)
        warning.type = 'Supply Warning'
        warning.description = `The ERC-721 token ${token.id} supply is not 0 when being wrapped. The supply is: ${token.wrappedOceanSupply.toString()}`
        warning.event = 'ERC-721 Wrap'
        warning.timestamp = interaction.timestamp
        warning.save()
    }
  }
  
  // Function that checks if the amount of a ERC-721 Token is one when being unwrapped
  export function checkErc721UnwrapCount(token: ERC721Token, interaction: ERC721Unwrap): void {
    // If the count is not one
    if (token.wrappedOceanSupply != ONE_BI) {
        // Log a warning
        log.warning('ERC-721 supply is not 1 for token {}. The supply is {}.', [token.id, token.wrappedOceanSupply.toString()])
  
        // Create and save a warning entity
        let warningId = `ERC-721-Unwrap-Count-Warning-${interaction.id}` 
        let warning = loadWarning(warningId)
        warning.type = 'Supply Warning'
        warning.description = `The ERC-721 token ${token.id} supply is not 1 when being unwrapped. The supply is: ${token.wrappedOceanSupply.toString()}`
        warning.event = 'ERC-721 Unwrap'
        warning.timestamp = interaction.timestamp
        warning.save()
    }
  }
  
  // Function that checks if the amount of of an ERC-1155 is zero when being unwrapped
  export function checkErc1155UnwrapCount(token: ERC1155Token, interaction: ERC1155Unwrap): void {
    // If the count is zero
    if (token.wrappedOceanSupply == ZERO_BI) {
        // Log a warning  
        log.warning('ERC-1155 supply is 0 for token {}.', [token.id])
  
        // Create and save a warning entity
        let warningId = `ERC-1155-Unwrap-Count-Warning-${interaction.id}`
        let warning = loadWarning(warningId)
        warning.type = 'Supply Warning'
        warning.description = `The ERC-1155 token ${token.id} supply is 0 when being unwrapped.`
        warning.event = 'ERC-1155 Unwrap'
        warning.timestamp = interaction.timestamp
        warning.save()
    }
  }
  
  // Function that handle ERC-20 External Contract recognition
  export function recognizeErc20ExternalContract(externalContract: ERC20ExternalContract, interactionType: string, interaction: string, timestamp: BigInt): void {
    // If it's part of a wrap, compute, or register interaction set the recognized attribute to true
    if (interactionType == 'Wrap' && externalContract.recognized == false) {
      externalContract.recognized = true
      externalContract.save()
    }
    // If it's part of an unwrap interaction and it's not recognized 
    else if (interactionType == 'Unwrap' && externalContract.recognized == false) {
      // Log a warning
      log.warning('ERC-20 external contract {} is not recognized before the {}.', [externalContract.id, interactionType.toLowerCase()])
  
      // Create and save a warning entity
      let warningId = `ERC-20-Recognition-Warning-${interaction}`
      let warning = loadWarning(warningId)
      warning.type = 'Unwrapping Unrecognized Contract'
      warning.description = 'The interaction is unwrapping an ERC-20 contract and it hasnt been recognized before.'
      warning.event =  `ERC-20 ${interactionType}`
      warning.timestamp =  timestamp
      warning.save()
    }
  }
  
  // Function that handle ERC-721 External Contract recognition
  export function recognizeErc721ExternalContract(externalContract: ERC721ExternalContract, interactionType: string, interaction: string, timestamp: BigInt): void {
  
    // If it's part of a wrap, compute, or register interaction set the recognized attribute to true
    if (interactionType == 'Wrap' && externalContract.recognized == false) {
      externalContract.recognized = true
      externalContract.save()
    }
    // If it's part of an unwrap interaction and it's not recognized 
    else if (interactionType == 'Unwrap' && externalContract.recognized == false) {
      // Log a warning
      log.warning('ERC-721 external contract {} is not recognized before the {}.', [externalContract.id, interactionType.toLowerCase()])
  
      // Create and save a warning entity
      let warningId = `ERC-721-Recognition-Warning-${interaction}`
      let warning = loadWarning(warningId)
      warning.type = 'Unwrapping Unrecognized Contract'
      warning.description = 'The interaction is unwrapping an ERC-721 contract and it hasnt been recognized before.'
      warning.event =  `ERC-721 ${interactionType}`
      warning.timestamp =  timestamp
      warning.save()
    }
  }
  
  // Function that handle ERC-1155 External Contract recognition
  export function recognizeErc1155ExternalContract(externalContract: ERC1155ExternalContract, interactionType: string, interaction: string, timestamp: BigInt): void {
    // If it's part of a wrap, compute, or register interaction set the recognized attribute to true
    if (interactionType == 'Wrap' && externalContract.recognized == false) {
      externalContract.recognized = true
      externalContract.save()
    }
    // If it's part of an unwrap interaction and it's not recognized 
    else if (interactionType == 'Unwrap' && externalContract.recognized == false) {
      // Log a warning
      log.warning('ERC-1155 external contract {} is not recognized before the {}.', [externalContract.id, interactionType.toLowerCase()])
  
      // Create and save a warning entity
      let warningId = `ERC-1155-Recognition-Warning-${interaction}`
      let warning = loadWarning(warningId)
      warning.type = 'Unwrapping Unrecognized Contract'
      warning.description = 'The interaction is unwrapping an ERC-1155 contract and it hasnt been recognized before.'
      warning.event =  `ERC-1155 ${interactionType}`
      warning.timestamp =  timestamp
      warning.save()
    } 
  }
  
  // Function that handle Primitive recognition
  export function recognizePrimitive(primitive: Primitive, interactionType: string, interaction: string, timestamp: BigInt): void {
    // If it's part of a wrap, compute, or register interaction set the recognized attribute to true
    if ((interactionType == 'Compute' || interactionType == 'Register') && primitive.recognized == false) {
      primitive.recognized = true
      primitive.save()
    }
    // If it's part of an unwrap interaction and it's not recognized 
    else if (interactionType == 'Unwrap' && primitive.recognized == false) {
      // Log a warning
      log.warning('Primitive {} is not recognized before the {}.', [primitive.id, interactionType.toLowerCase()])
  
      // Create and save a warning entity
      let warningId = `Primitive-Recognition-Warning-${interaction}`
      let warning = loadWarning(warningId)
      warning.type = 'Unwrapping Unrecognized Contract'
      warning.description = 'The interaction is unwrapping a primitive contract and it hasnt been recognized before.'
      warning.event =  `Primitive ${interactionType}`
      warning.timestamp =  timestamp
      warning.save()
    }
  }
  
  // Function that checks if the ERC-20 external contract has a negative wrapped amount
  export function checkErc20NegativeWrappedAmount(externalContract: ERC20ExternalContract, interactionId: string, timestamp: BigInt): void {
    // If the wrapped amount is less than 0
    if (externalContract.wrappedAmount < ZERO_BI) {
      // Log a warning
      log.warning('ERC-20 External Contract {} has a negative wrapped amount of {} tokens.' , [externalContract.id, externalContract.wrappedAmount.toString()])
      
      // Create a warning entity
      let warningId = `ERC-20-Token-Ocean-Supply-Warning-${interactionId}`
      let warning = loadWarning(warningId)
      warning.type = 'Negative Wrapped Amount for ERC-20'
      warning.description = `The interaction produced a negative wrapped amount for the ERC-20 external contract ${externalContract.id}`
      warning.event = 'ERC-20 Unwrap'
      warning.timestamp = timestamp
      warning.save()
    }
  }
  
  // Function that checks if the ERC-721 external contract has a negative wrapped amount
  export function checkErc721NegativeOceanSupply(token: ERC721Token, interaction: ERC721Unwrap): void {
    // If the wrapped ocean supply is less than 0
    if (token.wrappedOceanSupply < ZERO_BI) {
      // Log a warning
      log.warning('ERC-721 Token {} has a negative Ocean Supply of {} tokens.', [token.id, token.wrappedOceanSupply.toString()])
  
      // Create a warning entity 
      let warningId = `ERC-721-Token-Ocean-Supply-Warning-${interaction.id}`
      let warning = loadWarning(warningId)
      warning.type = 'Negative Wrapped Ocean Supply for ERC-721 Token'
      warning.description = `The interaction produced a negative wrapped ocean supply for the ERC-721 token ${token.id}.` 
      warning.event = 'ERC-721 Unwrap'
      warning.timestamp = interaction.timestamp
      warning.save()
    }
  }
  
  // Function that checks if the ERC-1155 external contract has a negative wrapped amount
  export function checkErc1155NegativeOceanSupply(token: ERC1155Token, interaction: ERC1155Unwrap): void {
    // If the wrapped ocean supply is less than 0
    if (token.wrappedOceanSupply < ZERO_BI) {
      // Log a warning
      log.warning('ERC-1155 Token {} has a negative Ocean Supply of {} tokens.', [token.id, token.wrappedOceanSupply.toString()])
  
      // Create a warning entity 
      let warningId = `ERC-1155-Token-Ocean-Supply-Warning-${interaction.id}`
      let warning = loadWarning(warningId)
      warning.type = 'Negative Wrapped Ocean Supply for ERC-1155 Token'
      warning.description = `The interaction produced a negative wrapped ocean supply for the ERC-1155 token ${token.id}.` 
      warning.event = 'ERC-1155 Unwrap'
      warning.timestamp = interaction.timestamp
      warning.save()
    }
  }
  
  // Function that checks if a Registered Token's ocean supply is less than 0
  export function checkRegisteredTokenOceanSupply(token: RegisteredToken, interaction: string, interactionType: string, timestamp: BigInt): void {
    // If the Registered Token supply is less than 0
    if (token.supply < ZERO_BI) {
      // Log a warning
      log.warning('Registered Token {} has a negative Ocean Supply of {} tokens.', [token.id, token.supply.toString()])
  
      // Create a warning entity
      let warningId = `Registered-Token-Ocean-Supply-Warning-${interaction}`
      let warning = loadWarning(warningId)
      warning.type = 'Negative Supply for Registered Token'
      warning.description = `The interaction produced a negative wrapped ocean supply for the registered token ${token.id}.` 
      warning.event = `Compute ${interactionType} Amount`
      warning.timestamp = timestamp
      warning.save()
    }
  }
  
  // Function that checks if a Registered Token's ocean supply is less than 0 and it's alignment with the ERCs
  export function checkOceanTokenNegativeSupply(token: OceanToken, functionId: string, interactionType: string, timestamp: BigInt): void {
    // If the Ocean Token supply is less than 0
    if (token.supply < ZERO_BI) {
      // Log a warning
      log.warning('Ocean Token {} has a negative Ocean Supply of {} tokens.', [token.id ,token.supply.toString()])
  
      // Create a warning entity
      let warningId = `Ocean-Token-Negative-Supply-Warning-${functionId}`
      let warning = loadWarning(warningId)
      warning.type = 'Negative Supply for Ocean Token'
      warning.description = `The interaction produced a negative wrapped ocean supply for the ocean token ${token.id}.` 
      warning.event = interactionType
      warning.timestamp = timestamp
      warning.save()
    }
  }
  
  // Function that will check the alignment between the operator and the user 
  export function checkOperatorUserAlignment(oceanTransaction: OceanTransaction, eventOperator: Address, interactionType: string, eventIndex: BigInt): void {
    let user = oceanTransaction.user
    let operator = eventOperator.toHexString()
    // If the user is not the same as the operator
    if (user != operator) {
      // Log a warning
      log.warning('The transfer event operator {} is not the same as the User {} in the Ocean Transaction {}.', [operator, user, oceanTransaction.id,])
      log.warning('Operator {}, User {}', [operator, user])
      // Create a warning entity
      let warningId = `Operator-User-Misalignment-${oceanTransaction.id}-${eventIndex.toString()}` 
      let warning = loadWarning(warningId)
      warning.type = 'Operator and User Misalignment'
      warning.description = `The operator ${operator} and the user ${user} are not the same in the transfer event.` 
      warning.event = interactionType
      warning.timestamp = oceanTransaction.timestamp
      warning.save()
    }
  }
  
  // Function that will check the alignment between the forwarder and the user
  export function checkForwarderUserAlignment(oceanTransaction: OceanTransaction, forwarder: Address, eventIndex: BigInt): void {
    let user = oceanTransaction.user
    // If the user is not the same as the forwarder
    if (user != forwarder.toHexString()) {
      // Log a warning
      log.warning('The forwarder transaction event forwarder {} is not the same as User {} in the Ocean Transaction {}.', [forwarder.toHexString(), user, oceanTransaction.id])
  
      // Create a warning entity
      let warningId = `Forwarder-User-Misalignment-${oceanTransaction.id}-${eventIndex.toString()}` 
      let warning = loadWarning(warningId)
      warning.type = 'Forwarder and User Misalignment'
      warning.description = `The forwarder ${forwarder} and the user ${user} are not the same in the forwarder transaction event.` 
      warning.event = 'Forwarder Interaction'
      warning.timestamp = oceanTransaction.timestamp
      warning.save()
    }
  }
  
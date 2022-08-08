import { Address, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
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
    ForwardedOceanTransaction,
    NewTokensRegistered,
    TransferBatch,
    TransferSingle,
    OceanTransaction
} from "../../../generated/Ocean/Ocean";
import { oceanAddress, uint64Max } from "../helpers";

export function createNewOceanTransaction(
    user: string,
    numberOfInteractions: i32
): OceanTransaction {
    let mockEvent = newMockEvent()
    let newOceanTransactionEvent = new OceanTransaction(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )

  newOceanTransactionEvent.parameters = new Array()
  let userParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(Address.fromString(user)))
  let numberOfInteractionsParam = new ethereum.EventParam('oldFee', ethereum.Value.fromI32(numberOfInteractions))

  newOceanTransactionEvent.parameters.push(userParam)
  newOceanTransactionEvent.parameters.push(numberOfInteractionsParam)

  return newOceanTransactionEvent
}

export function createNewChangeUnwrapFeeEvent(
    oldFee: i32,
    newFee: i32, 
    sender: string
): ChangeUnwrapFee {
    let mockEvent = newMockEvent()
    let newChangeUnwrapFeeEvent = new ChangeUnwrapFee(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newChangeUnwrapFeeEvent.parameters = new Array()
  let oldFeeParam = new ethereum.EventParam('oldFee', ethereum.Value.fromI32(oldFee))
  let newFeePram = new ethereum.EventParam('newFee', ethereum.Value.fromI32(newFee))
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(Address.fromString(sender)))

  newChangeUnwrapFeeEvent.parameters.push(oldFeeParam)
  newChangeUnwrapFeeEvent.parameters.push(newFeePram)
  newChangeUnwrapFeeEvent.parameters.push(senderParam)
  
  return newChangeUnwrapFeeEvent
}

export function createNewErc20WrapEvent(
    erc20Token: string,
    transferredAmount: i32,
    wrappedAmount: i32, 
    dust: i32,
    user: string,
    oceanId: i32
): Erc20Wrap {
    let mockEvent = newMockEvent()
    let newErc20WrapEvent = new Erc20Wrap(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
 
  newErc20WrapEvent.parameters = new Array()
  let erc20TokenParam = new ethereum.EventParam('erc20Token', ethereum.Value.fromAddress(Address.fromString(erc20Token)))
  let transferredAmountParam = new ethereum.EventParam('transferredAmount', ethereum.Value.fromI32(transferredAmount))
  let wrappedAmountParam = new ethereum.EventParam('wrappedAmount', ethereum.Value.fromI32(wrappedAmount))
  let dustParam = new ethereum.EventParam('dust', ethereum.Value.fromI32(dust))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let oceanIdParam = new ethereum.EventParam('oceanId', ethereum.Value.fromI32(oceanId))

  newErc20WrapEvent.parameters.push(erc20TokenParam)
  newErc20WrapEvent.parameters.push(transferredAmountParam)
  newErc20WrapEvent.parameters.push(wrappedAmountParam)
  newErc20WrapEvent.parameters.push(dustParam)
  newErc20WrapEvent.parameters.push(userParam)
  newErc20WrapEvent.parameters.push(oceanIdParam)

  return newErc20WrapEvent
}

export function createNewErc20UnwrapEvent(
    erc20Token: string,
    transferredAmount: i32,
    unwrappedAmount: i32, 
    feeCharged: i32,
    user: string,
    oceanId: i32
): Erc20Unwrap {
    let mockEvent = newMockEvent()
    let newErc20UnwrapEvent = new Erc20Unwrap(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newErc20UnwrapEvent.parameters = new Array()
  let erc20TokenParam = new ethereum.EventParam('erc20Token', ethereum.Value.fromAddress(Address.fromString(erc20Token)))
  let transferredAmountParam = new ethereum.EventParam('transferredAmount', ethereum.Value.fromI32(transferredAmount))
  let wrappedAmountParam = new ethereum.EventParam('unwrappedAmount', ethereum.Value.fromI32(unwrappedAmount))
  let dustParam = new ethereum.EventParam('feeCharged', ethereum.Value.fromI32(feeCharged))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let oceanIdParam = new ethereum.EventParam('oceanId', ethereum.Value.fromI32(oceanId))

  newErc20UnwrapEvent.parameters.push(erc20TokenParam)
  newErc20UnwrapEvent.parameters.push(transferredAmountParam)
  newErc20UnwrapEvent.parameters.push(wrappedAmountParam)
  newErc20UnwrapEvent.parameters.push(dustParam)
  newErc20UnwrapEvent.parameters.push(userParam)
  newErc20UnwrapEvent.parameters.push(oceanIdParam)

  return newErc20UnwrapEvent
}

export function createNewErc721WrapEvent(
    erc721Token: string,
    erc721Id: i32,
    user: string, 
    oceanId: i32
): Erc721Wrap {
    let mockEvent = newMockEvent()
    let newErc721wrapEvent = new Erc721Wrap(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newErc721wrapEvent.parameters = new Array()
  let erc721TokenParam = new ethereum.EventParam('erc721Token', ethereum.Value.fromAddress(Address.fromString(erc721Token)))
  let erc721IdParam = new ethereum.EventParam('erc721Id', ethereum.Value.fromI32(erc721Id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let oceanIdParam = new ethereum.EventParam('oceanId', ethereum.Value.fromI32(oceanId))
  
  newErc721wrapEvent.parameters.push(erc721TokenParam)
  newErc721wrapEvent.parameters.push(erc721IdParam)
  newErc721wrapEvent.parameters.push(userParam)
  newErc721wrapEvent.parameters.push(oceanIdParam)

  return newErc721wrapEvent
}

export function createNewErc721UnwrapEvent(
    erc721Token: string,
    erc721Id: i32,
    user: string, 
    oceanId: i32
): Erc721Unwrap {
    let mockEvent = newMockEvent()
    let newErc721UnwrapEvent = new Erc721Unwrap(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newErc721UnwrapEvent.parameters = new Array()
  let erc721TokenParam = new ethereum.EventParam('erc721Token', ethereum.Value.fromAddress(Address.fromString(erc721Token)))
  let erc721IdParam = new ethereum.EventParam('erc721Id', ethereum.Value.fromI32(erc721Id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let oceanIdParam = new ethereum.EventParam('oceanId', ethereum.Value.fromI32(oceanId))
  
  newErc721UnwrapEvent.parameters.push(erc721TokenParam)
  newErc721UnwrapEvent.parameters.push(erc721IdParam)
  newErc721UnwrapEvent.parameters.push(userParam)
  newErc721UnwrapEvent.parameters.push(oceanIdParam)

  return newErc721UnwrapEvent
}

export function createNewErc155WrapEvent(
    erc1155Token: string,
    erc1155Id: i32,
    amount: i32, 
    user: string, 
    oceanId: i32
): Erc1155Wrap {
    let mockEvent = newMockEvent()
    let newErc1155WrapEvent = new Erc1155Wrap(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newErc1155WrapEvent.parameters = new Array()
  let erc1155TokenParam = new ethereum.EventParam('erc1155Token', ethereum.Value.fromAddress(Address.fromString(erc1155Token)))
  let erc1155IdParam = new ethereum.EventParam('erc1155Id', ethereum.Value.fromI32(erc1155Id))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromI32(amount))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let oceanIdParam = new ethereum.EventParam('oceanId', ethereum.Value.fromI32(oceanId))

  newErc1155WrapEvent.parameters.push(erc1155TokenParam)
  newErc1155WrapEvent.parameters.push(erc1155IdParam)
  newErc1155WrapEvent.parameters.push(amountParam)
  newErc1155WrapEvent.parameters.push(userParam)
  newErc1155WrapEvent.parameters.push(oceanIdParam)

  return newErc1155WrapEvent
}

export function createNewErc155UnwrapEvent(
    erc1155Token: string,
    erc1155Id: i32,
    amount: i32, 
    feeCharged: i32,
    user: string, 
    oceanId: i32
): Erc1155Unwrap {
    let mockEvent = newMockEvent()
    let newErc1155UnwrapEvent = new Erc1155Unwrap(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newErc1155UnwrapEvent.parameters = new Array()
  let erc1155TokenParam = new ethereum.EventParam('erc1155Token', ethereum.Value.fromAddress(Address.fromString(erc1155Token)))
  let erc1155IdParam = new ethereum.EventParam('erc1155Id', ethereum.Value.fromI32(erc1155Id))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromI32(amount))
  let feeChargedParam = new ethereum.EventParam('feeCharged', ethereum.Value.fromI32(feeCharged))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let oceanIdParam = new ethereum.EventParam('oceanId', ethereum.Value.fromI32(oceanId))

  newErc1155UnwrapEvent.parameters.push(erc1155TokenParam)
  newErc1155UnwrapEvent.parameters.push(erc1155IdParam)
  newErc1155UnwrapEvent.parameters.push(amountParam)
  newErc1155UnwrapEvent.parameters.push(feeChargedParam)
  newErc1155UnwrapEvent.parameters.push(userParam)
  newErc1155UnwrapEvent.parameters.push(oceanIdParam)

  return newErc1155UnwrapEvent
}

export function createNewComputeOutputAmountEvent(
    primitive: string,
    inputToken: i32, 
    outputToken: i32,
    inputAmount: i32,
    outputAmount: i32, 
    user: string
): ComputeOutputAmount {
    let mockEvent = newMockEvent()
    let newComputeOutputAmountEvent = new ComputeOutputAmount(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newComputeOutputAmountEvent.parameters = new Array()
  let primitiveParam = new ethereum.EventParam('primitive', ethereum.Value.fromAddress(Address.fromString(primitive)))
  let inputTokenParam = new ethereum.EventParam('inputToken', ethereum.Value.fromI32(inputToken))
  let outputTokenParam = new ethereum.EventParam('outputToken', ethereum.Value.fromI32(outputToken))
  let inputAmountParam = new ethereum.EventParam('inputAmount', ethereum.Value.fromI32(inputAmount))
  let outputAmountParam = new ethereum.EventParam('outputAmount', ethereum.Value.fromI32(outputAmount))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  
  newComputeOutputAmountEvent.parameters.push(primitiveParam)
  newComputeOutputAmountEvent.parameters.push(inputTokenParam)
  newComputeOutputAmountEvent.parameters.push(outputTokenParam)
  newComputeOutputAmountEvent.parameters.push(inputAmountParam)
  newComputeOutputAmountEvent.parameters.push(outputAmountParam)
  newComputeOutputAmountEvent.parameters.push(userParam)

  return newComputeOutputAmountEvent
}

export function createNewComputeInputAmountEvent(
    primitive: string,
    inputToken: i32, 
    outputToken: i32,
    inputAmount: i32,
    outputAmount: i32, 
    user: string
): ComputeInputAmount {
    let mockEvent = newMockEvent()
    let newComputeInputAmountEvent = new ComputeInputAmount(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newComputeInputAmountEvent.parameters = new Array()
  let primitiveParam = new ethereum.EventParam('primitive', ethereum.Value.fromAddress(Address.fromString(primitive)))
  let inputTokenParam = new ethereum.EventParam('inputToken', ethereum.Value.fromI32(inputToken))
  let outputTokenParam = new ethereum.EventParam('outputToken', ethereum.Value.fromI32(outputToken))
  let inputAmountParam = new ethereum.EventParam('inputAmount', ethereum.Value.fromI32(inputAmount))
  let outputAmountParam = new ethereum.EventParam('outputAmount', ethereum.Value.fromI32(outputAmount))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  
  newComputeInputAmountEvent.parameters.push(primitiveParam)
  newComputeInputAmountEvent.parameters.push(inputTokenParam)
  newComputeInputAmountEvent.parameters.push(outputTokenParam)
  newComputeInputAmountEvent.parameters.push(inputAmountParam)
  newComputeInputAmountEvent.parameters.push(outputAmountParam)
  newComputeInputAmountEvent.parameters.push(userParam)

  return newComputeInputAmountEvent
}

export function createNewForwardedOceanTransactionEvent( 
    forwarder: string,
    user: string,
    numberOfInteractions: i32
): ForwardedOceanTransaction {
    let mockEvent = newMockEvent()
    let newForwardedOceanTransactionEvent = new ForwardedOceanTransaction(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )
  
  newForwardedOceanTransactionEvent.parameters = new Array()
  let forwarderParam = new ethereum.EventParam('forwarder', ethereum.Value.fromAddress(Address.fromString(forwarder)))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(Address.fromString(user)))
  let numberOfInteractionsParam = new ethereum.EventParam('numberOfInteractions', ethereum.Value.fromI32(numberOfInteractions))
  
  newForwardedOceanTransactionEvent.parameters.push(forwarderParam)
  newForwardedOceanTransactionEvent.parameters.push(userParam)
  newForwardedOceanTransactionEvent.parameters.push(numberOfInteractionsParam)

  return newForwardedOceanTransactionEvent
}

export function createNewTokensRegisteredEvent(
    creator: string,
    tokens: Array<i32>,
    nonces: Array<i32>
): NewTokensRegistered {
    let mockEvent = newMockEvent()
    let newTokensRegisteredEvent = new NewTokensRegistered(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
    )

    newTokensRegisteredEvent.parameters = new Array()
    let creatorParam = new ethereum.EventParam('creator', ethereum.Value.fromAddress(Address.fromString(creator)))
    let tokensParam = new ethereum.EventParam('tokens', ethereum.Value.fromI32Array(tokens))
    let noncesParam = new ethereum.EventParam('tokens', ethereum.Value.fromI32Array(nonces))

    newTokensRegisteredEvent.parameters.push(creatorParam)
    newTokensRegisteredEvent.parameters.push(tokensParam)
    newTokensRegisteredEvent.parameters.push(noncesParam)

    return newTokensRegisteredEvent
}

export function createNewTransferBatch(
    operator: string,
    from: string, 
    to: string,
    ids: Array<i32>,
    values: Array<i32>

): TransferBatch {
    let mockEvent = newMockEvent()
    let newTransferBatchEvent = new TransferBatch(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )

  newTransferBatchEvent.parameters = new Array()
  let operatorParam = new ethereum.EventParam('operator', ethereum.Value.fromAddress(Address.fromString(operator)))
  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(Address.fromString(from)))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(Address.fromString(to)))
  let idsParam = new ethereum.EventParam('ids', ethereum.Value.fromI32Array(ids))
  let valuesParam = new ethereum.EventParam('values', ethereum.Value.fromI32Array(values))

  newTransferBatchEvent.parameters.push(operatorParam)
  newTransferBatchEvent.parameters.push(fromParam)
  newTransferBatchEvent.parameters.push(toParam)
  newTransferBatchEvent.parameters.push(idsParam)
  newTransferBatchEvent.parameters.push(valuesParam)

  return newTransferBatchEvent
}

export function createNewTransferSingle(
    operator: string,
    from: string,
    to: string, 
    id: i32,
    value: i32
): TransferSingle {
    let mockEvent = newMockEvent()
    let newTransferSingleEvent = new TransferSingle(
        oceanAddress,
        mockEvent.logIndex,
        mockEvent.transactionLogIndex,
        mockEvent.logType,
        mockEvent.block,
        mockEvent.transaction,
        mockEvent.parameters
  )

  newTransferSingleEvent.parameters = new Array()
  let operatorParam = new ethereum.EventParam('operator', ethereum.Value.fromAddress(Address.fromString(operator)))
  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(Address.fromString(from)))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(Address.fromString(to)))
  let idsParam = new ethereum.EventParam('ids', ethereum.Value.fromI32(id))
  let valuesParam = new ethereum.EventParam('values', ethereum.Value.fromI32(value))

  newTransferSingleEvent.parameters.push(operatorParam)
  newTransferSingleEvent.parameters.push(fromParam)
  newTransferSingleEvent.parameters.push(toParam)
  newTransferSingleEvent.parameters.push(idsParam)
  newTransferSingleEvent.parameters.push(valuesParam)

  return newTransferSingleEvent
}





    





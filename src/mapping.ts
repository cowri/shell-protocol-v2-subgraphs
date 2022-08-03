import { BigInt } from "@graphprotocol/graph-ts"
import {
  Ocean,
  ApprovalForAll,
  ChangeUnwrapFee,
  ComputeInputAmount,
  ComputeOutputAmount,
  Erc1155Unwrap,
  Erc1155Wrap,
  Erc20Unwrap,
  Erc20Wrap,
  Erc721Unwrap,
  Erc721Wrap,
  ForwardedOceanTransaction,
  NewTokensRegistered,
  OceanTransaction,
  OwnershipTransferred,
  TransferBatch,
  TransferSingle,
  URI
} from "../generated/Ocean/Ocean"
import { ExampleEntity } from "../generated/schema"

export function handleApprovalForAll(event: ApprovalForAll): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.account = event.params.account
  entity.operator = event.params.operator

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.balanceOfBatch(...)
  // - contract.isApprovedForAll(...)
  // - contract.onERC1155BatchReceived(...)
  // - contract.onERC1155Received(...)
  // - contract.onERC721Received(...)
  // - contract.owner(...)
  // - contract.registerNewTokens(...)
  // - contract.supportsInterface(...)
  // - contract.tokensToPrimitives(...)
  // - contract.unwrapFeeDivisor(...)
  // - contract.uri(...)
}

export function handleChangeUnwrapFee(event: ChangeUnwrapFee): void {}

export function handleComputeInputAmount(event: ComputeInputAmount): void {}

export function handleComputeOutputAmount(event: ComputeOutputAmount): void {}

export function handleErc1155Unwrap(event: Erc1155Unwrap): void {}

export function handleErc1155Wrap(event: Erc1155Wrap): void {}

export function handleErc20Unwrap(event: Erc20Unwrap): void {}

export function handleErc20Wrap(event: Erc20Wrap): void {}

export function handleErc721Unwrap(event: Erc721Unwrap): void {}

export function handleErc721Wrap(event: Erc721Wrap): void {}

export function handleForwardedOceanTransaction(
  event: ForwardedOceanTransaction
): void {}

export function handleNewTokensRegistered(event: NewTokensRegistered): void {}

export function handleOceanTransaction(event: OceanTransaction): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleTransferSingle(event: TransferSingle): void {}

export function handleURI(event: URI): void {}

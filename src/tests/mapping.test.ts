import { clearStore, test, assert, createMockedFunction, logStore } from "matchstick-as/assembly/index";
import { ethereum, Address, Bytes } from "@graphprotocol/graph-ts";
import {
    handleChangeUnwrapFee,
    handleComputeInputAmount,
    handleComputeOutputAmount,
    handleErc1155Unwrap,
    handleErc1155Wrap,
    handleErc20Unwrap,
    handleErc20Wrap,
    handleErc721Unwrap,
    handleErc721Wrap,
    handleForwarderTransaction,
    handleNewTokensRegistered,
    handleOceanTransaction,
    handleTransferBatch,
    handleTransferSingle
} from '../mapping'
import {
    createNewChangeUnwrapFeeEvent,
    createNewErc20WrapEvent,
    createNewErc20UnwrapEvent,
    createNewTokensRegisteredEvent,
    createNewComputeOutputAmountEvent,
    createNewComputeInputAmountEvent,
    createNewErc155WrapEvent,
    createNewErc155UnwrapEvent,
    createNewErc721WrapEvent,
    createNewErc721UnwrapEvent,
    createNewTransferSingle,
    createNewTransferBatch,
    createNewForwardedOceanTransactionEvent,
    createNewOceanTransaction,
} from './helpers'
import { fetchTokenDecimals, fetchTokenSymbol, zeroAddress } from "../helpers";
import { ERC20SymbolBytes } from "../../../generated/Ocean/ERC20SymbolBytes";
import { ERC20NameBytes } from "../../../generated/Ocean/ERC20NameBytes";
import { ERC20 } from "../../../generated/Ocean/ERC20";




test('Change unwrap fee', () => {
    let changeUnwrapFee = createNewChangeUnwrapFeeEvent(10, 20, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb');

    handleChangeUnwrapFee(changeUnwrapFee);

    let feeId = changeUnwrapFee.transaction.hash.toHexString() + '-' + changeUnwrapFee.params.sender.toHexString()
    assert.fieldEquals('Fee', feeId, 'feeAmount', '20');
    
    let previousFees = `[${feeId}]`
    assert.fieldEquals('UnwrapFee', 'UnwrapFeeId', 'previousFees', previousFees);
    
    clearStore();
})

test('Test .symbol() function', ()=> {
    let tokenAddress = Address.fromString('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    let expectedResult = Bytes.fromHexString('0x3032435245')
    createMockedFunction(tokenAddress, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x3032435245'))])

    let ERC20Symbol = ERC20SymbolBytes.bind(tokenAddress)
    let result = ERC20Symbol.symbol()

    assert.bytesEquals(expectedResult, result)
})

test('Test .name() function', ()=>{
    let tokenAddress = Address.fromString('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    let expectedResult = Bytes.fromHexString('0x3032435245')
    
    createMockedFunction(tokenAddress, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x3032435245'))])

    let ERC20Name = ERC20NameBytes.bind(tokenAddress)
    let result = ERC20Name.name()
    
    assert.bytesEquals(expectedResult, result)
})

test('Test .decimals() function', ()=>{
    let tokenAddress = Address.fromString('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    let expectedResult = 18

    createMockedFunction(tokenAddress, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    
    let ERC20Decimals = ERC20.bind(tokenAddress)
    let result = ERC20Decimals.decimals()

    assert.i32Equals(expectedResult, result)
})

test('Handle a single ERC-20 wrap', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let tokenAddress = Address.fromString('0xcccccca5C5756ed6f4fEA3DC8E61c917AAa29685')
    
    createMockedFunction(tokenAddress, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Symbol = ERC20SymbolBytes.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'symbol', 'symbol():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Symbol2 = ERC20.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Name = ERC20NameBytes.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'name', 'name():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Name2 = ERC20.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    let ERC20Decimals = ERC20.bind(tokenAddress)

    let erc20Wrap = createNewErc20WrapEvent(tokenAddress.toHexString(), 10, 9, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234);
    handleErc20Wrap(erc20Wrap);

    let wrappedAmount = erc20Wrap.params.wrappedAmount.toString()
    let dust = erc20Wrap.params.dust.toString()
    let user = erc20Wrap.params.user.toHexString()
    let timestamp = erc20Wrap.block.timestamp.toString()
    let block = erc20Wrap.block.number.toString()
    let wrappedTokenId = erc20Wrap.params.oceanId.toString()
    let transferredAmount = erc20Wrap.params.transferredAmount.toString()
    let externalContract = erc20Wrap.params.erc20Token.toHexString()

    let oceanTransactionId = erc20Wrap.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', `[${interactionId}]`  );
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block);

    assert.fieldEquals('ERC20Wrap', interactionId, 'wrappedTokenId', wrappedTokenId);
    assert.fieldEquals('ERC20Wrap', interactionId, 'transferredAmount', transferredAmount);
    assert.fieldEquals('ERC20Wrap', interactionId, 'wrappedAmount', wrappedAmount);
    assert.fieldEquals('ERC20Wrap', interactionId, 'dust', dust);
    assert.fieldEquals('ERC20Wrap', interactionId, 'user', user);
    assert.fieldEquals('ERC20Wrap', interactionId, 'externalContract', externalContract);
    assert.fieldEquals('ERC20Wrap', interactionId, 'block', block);
    assert.fieldEquals('ERC20Wrap', interactionId, 'timestamp', timestamp);

    assert.fieldEquals('User', user, 'erc20Wraps', `[${interactionId}]`);
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('ERC20ExternalContract', externalContract, 'wrappedAmount', '9');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'name', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'name', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'symbol', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'decimals', '18');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'recognized', 'true');

    assert.fieldEquals('OceanToken', '1234', 'sourceContract', tokenAddress.toHexString())
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-20')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', 'null')
    
    clearStore();
})

test('Handle a single ERC-20 unwrap with warning', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let tokenAddress = Address.fromString('0xcccccca5C5756ed6f4fEA3DC8E61c917AAa29685')
    
    createMockedFunction(tokenAddress, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Symbol = ERC20SymbolBytes.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'symbol', 'symbol():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Symbol2 = ERC20.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Name = ERC20NameBytes.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'name', 'name():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Name2 = ERC20.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    let ERC20Decimals = ERC20.bind(tokenAddress)

    let erc20Unwrap = createNewErc20UnwrapEvent(tokenAddress.toHexString(), 10, 9, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234);
    handleErc20Unwrap(erc20Unwrap);

    let unwrappedAmount = erc20Unwrap.params.unwrappedAmount.toString()
    let user = erc20Unwrap.params.user.toHexString()
    let timestamp = erc20Unwrap.block.timestamp.toString()
    let block = erc20Unwrap.block.number.toString()
    let wrappedTokenId = erc20Unwrap.params.oceanId.toString()
    let transferredAmount = erc20Unwrap.params.transferredAmount.toString()
    let externalContract = erc20Unwrap.params.erc20Token.toHexString()
    let feeCharged = erc20Unwrap.params.feeCharged.toString()

    let oceanTransactionId = erc20Unwrap.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', `[${interactionId}]`  );
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block);

    assert.fieldEquals('ERC20Unwrap', interactionId, 'wrappedTokenId', wrappedTokenId);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'transferredAmount', transferredAmount);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'unwrappedAmount', unwrappedAmount);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'feeCharged', feeCharged);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'user', user);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'block', block);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'externalContract', externalContract);
    assert.fieldEquals('ERC20Unwrap', interactionId, 'timestamp', timestamp);

    assert.fieldEquals('User', user, 'erc20Unwraps', `[${interactionId}]`);
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('ERC20ExternalContract', externalContract, 'wrappedAmount', '-9');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'cumulativeFees', '1');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'name', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'name', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'symbol', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'decimals', '18');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'recognized', 'false');
    
    clearStore();
})

test('Handle a complete ERC-20 wrap and unwrap by a user', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let tokenAddress = Address.fromString('0xcccccca5C5756ed6f4fEA3DC8E61c917AAa29685')
    
    createMockedFunction(tokenAddress, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Symbol = ERC20SymbolBytes.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'symbol', 'symbol():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Symbol2 = ERC20.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Name = ERC20NameBytes.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'name', 'name():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Name2 = ERC20.bind(tokenAddress)

    createMockedFunction(tokenAddress, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    let ERC20Decimals = ERC20.bind(tokenAddress)

    let erc20Wrap = createNewErc20WrapEvent(tokenAddress.toHexString(), 10, 9, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc20Wrap(erc20Wrap)

    let erc20Unwrap = createNewErc20UnwrapEvent(tokenAddress.toHexString(), 10, 8, 2, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc20Unwrap(erc20Unwrap)

    let wrappedAmount = erc20Wrap.params.wrappedAmount.toString()
    let dust = erc20Wrap.params.dust.toString()
    let user = erc20Wrap.params.user.toHexString()
    let wrapTimestamp = erc20Wrap.block.timestamp.toString()
    let wrapBlock = erc20Wrap.block.number.toString()
    let wrappedTokenId = erc20Wrap.params.oceanId.toString()
    let wrapTransferredAmount = erc20Wrap.params.transferredAmount.toString()
    let externalContract = erc20Wrap.params.erc20Token.toHexString()
    let wrapOceanTransactionId = erc20Wrap.transaction.hash.toHexString()
    let wrapInteractionId = wrapOceanTransactionId + '-I-0'

    let unwrappedAmount = erc20Unwrap.params.unwrappedAmount.toString()
    let unwrapTransferredAmount = erc20Unwrap.params.transferredAmount.toString()
    let unwrapTimestamp = erc20Unwrap.block.timestamp.toString()
    let unwrapBlock = erc20Unwrap.block.number.toString()
    let unwrapOceanTransactionId = erc20Unwrap.transaction.hash.toHexString()
    let unwrapInteractionId = unwrapOceanTransactionId + '-I-1'

    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'interactions', `[${wrapInteractionId}, ${unwrapInteractionId}]`);
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'timestamp', wrapTimestamp);
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'block', wrapBlock);

    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'wrappedTokenId', wrappedTokenId);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'transferredAmount', wrapTransferredAmount);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'wrappedAmount', wrappedAmount);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'dust', dust);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'user', user);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'block', wrapBlock);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'externalContract', externalContract);
    assert.fieldEquals('ERC20Wrap', wrapInteractionId, 'timestamp', wrapTimestamp);

    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'wrappedTokenId', wrappedTokenId);
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'transferredAmount', unwrapTransferredAmount);
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'unwrappedAmount', unwrappedAmount);
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'feeCharged', '2');
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'user', user);
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'block', unwrapBlock);
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'externalContract', externalContract);
    assert.fieldEquals('ERC20Unwrap', unwrapInteractionId, 'timestamp', unwrapTimestamp);

    assert.fieldEquals('User', user, 'erc20Wraps', `[${wrapInteractionId}]`);
    assert.fieldEquals('User', user, 'erc20Unwraps', `[${unwrapInteractionId}]`);
    assert.fieldEquals('User', user, 'createdTimestamp', wrapTimestamp)

    assert.fieldEquals('ERC20ExternalContract', externalContract, 'wrappedAmount', '1');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'cumulativeFees', '2')
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'name', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'symbol', 'ERC20');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'decimals', '18');
    assert.fieldEquals('ERC20ExternalContract', externalContract, 'recognized', 'true');
    
    clearStore();
})

test('Handle a single ERC-721 wrap', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newErc721Wrap = createNewErc721WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Wrap(newErc721Wrap)

    let oceanTransactionId = newErc721Wrap.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`
    let user = newErc721Wrap.params.user.toHexString()
    let timestamp = newErc721Wrap.block.timestamp.toString()
    let block = newErc721Wrap.block.number.toString()
    let tokenOceanId = newErc721Wrap.params.oceanId.toString()
    let externalContractAddress = newErc721Wrap.params.erc721Token.toHexString()
    
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block)

    assert.fieldEquals('ERC721Wrap', interactionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC721Wrap', interactionId, 'user', user)
    assert.fieldEquals('ERC721Wrap', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ERC721Wrap', interactionId, 'block', block)
    assert.fieldEquals('ERC721Wrap', interactionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('User', user, 'erc721Wraps', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('ERC721Token', tokenOceanId, 'wrappedOceanSupply', '1')

    assert.fieldEquals('ERC721ExternalContract', externalContractAddress, 'recognized', 'true')
    assert.fieldEquals('ERC721ExternalContract', externalContractAddress, 'tokenIds', `[${tokenOceanId}]`)

    assert.fieldEquals('OceanToken', '1234', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-721')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', '567')

    clearStore()
})

test('Handle a single ERC-721 unwrap with warning', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newErc721Unwrap = createNewErc721UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Unwrap(newErc721Unwrap)

    let oceanTransactionId = newErc721Unwrap.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`
    let user = newErc721Unwrap.params.user.toHexString()
    let timestamp = newErc721Unwrap.block.timestamp.toString()
    let block = newErc721Unwrap.block.number.toString()
    let tokenOceanId = newErc721Unwrap.params.oceanId.toString()
    let externalContractAddress = newErc721Unwrap.params.erc721Token.toHexString()
    
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block)

    assert.fieldEquals('ERC721Unwrap', interactionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC721Unwrap', interactionId, 'user', user)
    assert.fieldEquals('ERC721Unwrap', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ERC721Unwrap', interactionId, 'block', block)
    assert.fieldEquals('ERC721Unwrap', interactionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('User', user, 'erc721Unwraps', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('ERC721Token', tokenOceanId, 'wrappedOceanSupply', '-1')

    assert.fieldEquals('ERC721ExternalContract', externalContractAddress, 'recognized', 'false')
    assert.fieldEquals('ERC721ExternalContract', externalContractAddress, 'tokenIds', `[]`)

    clearStore();
})

test('Handle a complete ERC-721 wrap and unwrap by a user', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newErc721Wrap = createNewErc721WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Wrap(newErc721Wrap)

    let newErc721Unwrap = createNewErc721UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Unwrap(newErc721Unwrap)

    let wrapOceanTransactionId = newErc721Wrap.transaction.hash.toHexString()
    let wrapInteractionId = wrapOceanTransactionId + '-I-0'
    let user = newErc721Wrap.params.user.toHexString()
    let wrapTimestamp = newErc721Wrap.block.timestamp.toString()
    let wrapBlock = newErc721Wrap.block.number.toString()
    let tokenOceanId = newErc721Wrap.params.oceanId.toString()
    let externalContractAddress = newErc721Wrap.params.erc721Token.toHexString()

    let unwrapOceanTransactionId = newErc721Unwrap.transaction.hash.toHexString()
    let unwrapInteractionId = unwrapOceanTransactionId + '-I-1'
    let unwrapTimestamp = newErc721Unwrap.block.timestamp.toString()
    let unwrapBlock = newErc721Unwrap.block.number.toString()
    
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'user', user)
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'interactions', `[${wrapInteractionId}, ${unwrapInteractionId}]`)
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'timestamp', wrapTimestamp)
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'block', wrapBlock)

    assert.fieldEquals('ERC721Wrap', wrapInteractionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC721Wrap', wrapInteractionId, 'user', user)
    assert.fieldEquals('ERC721Wrap', wrapInteractionId, 'timestamp', wrapTimestamp)
    assert.fieldEquals('ERC721Wrap', wrapInteractionId, 'block', wrapBlock)
    assert.fieldEquals('ERC721Wrap', wrapInteractionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('ERC721Unwrap', unwrapInteractionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC721Unwrap', unwrapInteractionId, 'user', user)
    assert.fieldEquals('ERC721Unwrap', unwrapInteractionId, 'timestamp', unwrapTimestamp)
    assert.fieldEquals('ERC721Unwrap', unwrapInteractionId, 'block', unwrapBlock)
    assert.fieldEquals('ERC721Unwrap', unwrapInteractionId, 'externalContract', externalContractAddress)
    
    assert.fieldEquals('User', user, 'erc721Wraps', `[${wrapInteractionId}]`)
    assert.fieldEquals('User', user, 'erc721Unwraps', `[${unwrapInteractionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', wrapTimestamp)

    assert.fieldEquals('ERC721Token', tokenOceanId, 'wrappedOceanSupply', '0')

    assert.fieldEquals('ERC721ExternalContract', externalContractAddress, 'recognized', 'true')
    assert.fieldEquals('ERC721ExternalContract', externalContractAddress, 'tokenIds', `[${tokenOceanId}]`)

    clearStore()

})

test('Handle a single ERC-1155 wrap', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newErc1155Wrap = createNewErc155WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, 10, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Wrap(newErc1155Wrap)

    let oceanTransactionId = newErc1155Wrap.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`  
    let user = newErc1155Wrap.params.user.toHexString()
    let timestamp = newErc1155Wrap.block.timestamp.toString()
    let block = newErc1155Wrap.block.number.toString()
    let tokenOceanId = newErc1155Wrap.params.oceanId.toString()
    let externalContractAddress = newErc1155Wrap.params.erc1155Token.toHexString()

    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block)

    assert.fieldEquals('ERC1155Wrap', interactionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC1155Wrap', interactionId, 'wrappedAmount', '10')
    assert.fieldEquals('ERC1155Wrap', interactionId, 'user', user)
    assert.fieldEquals('ERC1155Wrap', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ERC1155Wrap', interactionId, 'block', block)
    assert.fieldEquals('ERC1155Wrap', interactionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('User', user, 'erc1155Wraps', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('ERC1155Token', tokenOceanId, 'wrappedOceanSupply', '10')

    assert.fieldEquals('ERC1155ExternalContract', externalContractAddress, 'recognized', 'true')
    assert.fieldEquals('ERC1155ExternalContract', externalContractAddress, 'tokenIds', `[${tokenOceanId}]`)
    
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-1155')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', '567')

    clearStore();
})

test('Handle a single ERC-1155 unwrap with warning', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newErc1155Unwrap = createNewErc155UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, 10, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Unwrap(newErc1155Unwrap)

    let oceanTransactionId = newErc1155Unwrap.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`  
    let user = newErc1155Unwrap.params.user.toHexString()
    let timestamp = newErc1155Unwrap.block.timestamp.toString()
    let block = newErc1155Unwrap.block.number.toString()
    let tokenOceanId = newErc1155Unwrap.params.oceanId.toString()
    let externalContractAddress = newErc1155Unwrap.params.erc1155Token.toHexString()

    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp)
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block)

    assert.fieldEquals('ERC1155Unwrap', interactionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC1155Unwrap', interactionId, 'unwrappedAmount', '10')
    assert.fieldEquals('ERC1155Unwrap', interactionId, 'feeCharged', '1')
    assert.fieldEquals('ERC1155Unwrap', interactionId, 'user', user)
    assert.fieldEquals('ERC1155Unwrap', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ERC1155Unwrap', interactionId, 'block', block)
    assert.fieldEquals('ERC1155Unwrap', interactionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('User', user, 'erc1155Unwraps', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('ERC1155Token', tokenOceanId, 'wrappedOceanSupply', '-10')
    assert.fieldEquals('ERC1155Token', tokenOceanId, 'cumulativeFees', '1')

    assert.fieldEquals('ERC1155ExternalContract', externalContractAddress, 'recognized', 'false')
    assert.fieldEquals('ERC1155ExternalContract', externalContractAddress, 'tokenIds', `[]`)

    clearStore();
})

test('Handle a complete ERC-1155 wrap and unwrap by a user', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newErc1155Wrap = createNewErc155WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, 10, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Wrap(newErc1155Wrap)

    let newErc1155Unwrap = createNewErc155UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, 10, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Unwrap(newErc1155Unwrap)

    let wrapOceanTransactionId = newErc1155Wrap.transaction.hash.toHexString()
    let wrapInteractionId = wrapOceanTransactionId + '-I-0'
    let user = newErc1155Wrap.params.user.toHexString()
    let wrapTimestamp = newErc1155Wrap.block.timestamp.toString()
    let wrapBlock = newErc1155Wrap.block.number.toString()
    let tokenOceanId = newErc1155Wrap.params.oceanId.toString()
    let externalContractAddress = newErc1155Wrap.params.erc1155Token.toHexString()

    let unwrapOceanTransactionId = newErc1155Unwrap.transaction.hash.toHexString()
    let unwrapInteractionId = unwrapOceanTransactionId + '-I-1'
    let unwrapTimestamp = newErc1155Unwrap.block.timestamp.toString()
    let unwrapBlock = newErc1155Unwrap.block.number.toString()

    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'user', user)
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'interactions', `[${wrapInteractionId}, ${unwrapInteractionId}]`)
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'timestamp', wrapTimestamp)
    assert.fieldEquals('OceanTransaction', wrapOceanTransactionId, 'block', wrapBlock)

    assert.fieldEquals('ERC1155Wrap', wrapInteractionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC1155Wrap', wrapInteractionId, 'wrappedAmount', '10')
    assert.fieldEquals('ERC1155Wrap', wrapInteractionId, 'user', user)
    assert.fieldEquals('ERC1155Wrap', wrapInteractionId, 'timestamp', wrapTimestamp)
    assert.fieldEquals('ERC1155Wrap', wrapInteractionId, 'block', wrapBlock)
    assert.fieldEquals('ERC1155Wrap', wrapInteractionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'wrappedTokenId', '1234')
    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'unwrappedAmount', '10')
    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'feeCharged', '1')
    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'user', user)
    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'timestamp', unwrapTimestamp)
    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'block', unwrapBlock)
    assert.fieldEquals('ERC1155Unwrap', unwrapInteractionId, 'externalContract', externalContractAddress)

    assert.fieldEquals('User', user, 'erc1155Wraps', `[${wrapInteractionId}]`)
    assert.fieldEquals('User', user, 'erc1155Unwraps', `[${unwrapInteractionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', unwrapTimestamp)

    assert.fieldEquals('ERC1155Token', tokenOceanId, 'wrappedOceanSupply', '0')
    assert.fieldEquals('ERC1155Token', tokenOceanId, 'cumulativeFees', '1')

    assert.fieldEquals('ERC1155ExternalContract', externalContractAddress, 'recognized', 'true')
    assert.fieldEquals('ERC1155ExternalContract', externalContractAddress, 'tokenIds', `[${tokenOceanId}]`)

    clearStore()

})

test('Handle a compute output amount', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newComputeOutputAmount = createNewComputeOutputAmountEvent('0xbbbbbb4eCC1E1406c9E11f1845F4063066e0C094', 123, 456, 5, 6, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    handleComputeOutputAmount(newComputeOutputAmount)

    let oceanTransactionId = newComputeOutputAmount.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`  
    let user = newComputeOutputAmount.params.user.toHexString()
    let timestamp = newComputeOutputAmount.block.timestamp.toString()
    let block = newComputeOutputAmount.block.number.toString()
    let primitiveId = newComputeOutputAmount.params.primitive.toHexString()
    
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block);

    assert.fieldEquals('ComputeOutputAmount', interactionId, 'inputToken', '123')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'outputToken', '456')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'inputAmount', '5')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'outputAmount', '6')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'user', user)
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'block', block)
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'externalContract', primitiveId)

    assert.fieldEquals('User', user, 'computeOutputAmounts', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('Primitive', primitiveId, 'users', `[${user}]`)
    assert.fieldEquals('Primitive', primitiveId, 'createdTimestamp', timestamp)
    assert.fieldEquals('Primitive', primitiveId, 'recognized', 'true')

    clearStore()
})

test('Handle a token register and a compute output amount', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newTokensRegistered = createNewTokensRegisteredEvent('0xbbbbbb4eCC1E1406c9E11f1845F4063066e0C094', [123, 456], [987, 654])
    handleNewTokensRegistered(newTokensRegistered);
    
    let newComputeOutputAmount = createNewComputeOutputAmountEvent('0xbbbbbb4eCC1E1406c9E11f1845F4063066e0C094', 123, 456, 5, 6, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    handleComputeOutputAmount(newComputeOutputAmount)

    let oceanTransactionId = newComputeOutputAmount.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let creator = newTokensRegistered.params.creator.toHexString()
    let oceanTransactionInteractions = `[${interactionId}]`  
    let user = newComputeOutputAmount.params.user.toHexString()
    let timestamp = newComputeOutputAmount.block.timestamp.toString()
    let block = newComputeOutputAmount.block.number.toString()
    let primitiveId = newComputeOutputAmount.params.primitive.toHexString()
    
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block);

    assert.fieldEquals('ComputeOutputAmount', interactionId, 'inputToken', '123')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'outputToken', '456')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'inputAmount', '5')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'outputAmount', '6')
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'user', user)
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'block', block)
    assert.fieldEquals('ComputeOutputAmount', interactionId, 'externalContract', primitiveId)

    assert.fieldEquals('User', user, 'computeOutputAmounts', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('Primitive', primitiveId, 'users', `[${user}]`)
    assert.fieldEquals('Primitive', primitiveId, 'createdTimestamp', timestamp)
    assert.fieldEquals('Primitive', primitiveId, 'recognized', 'true')
    
    assert.fieldEquals('RegisteredToken', '123', 'supply', '-5')
    assert.fieldEquals('RegisteredToken', '456', 'supply', '6')

    assert.fieldEquals('OceanToken', '123', 'sourceContract', creator)
    assert.fieldEquals('OceanToken', '123', 'contractType', 'OceanPrimitive')
    assert.fieldEquals('OceanToken', '123', 'contractNonce', '987')

    assert.fieldEquals('OceanToken', '456', 'sourceContract', creator)
    assert.fieldEquals('OceanToken', '456', 'contractType', 'OceanPrimitive')
    assert.fieldEquals('OceanToken', '456', 'contractNonce', '654')

    clearStore();
})

test('Handle a compute input amount', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)

    let newComputeInputAmount = createNewComputeInputAmountEvent('0xbbbbbb4eCC1E1406c9E11f1845F4063066e0C094', 123, 456, 5, 6, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    handleComputeInputAmount(newComputeInputAmount)

    let oceanTransactionId = newComputeInputAmount.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`  
    let user = newComputeInputAmount.params.user.toHexString()
    let timestamp = newComputeInputAmount.block.timestamp.toString()
    let block = newComputeInputAmount.block.number.toString()
    let primitiveId = newComputeInputAmount.params.primitive.toHexString()
    
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block);

    assert.fieldEquals('ComputeInputAmount', interactionId, 'inputToken', '123')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'outputToken', '456')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'inputAmount', '5')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'outputAmount', '6')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'user', user)
    assert.fieldEquals('ComputeInputAmount', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ComputeInputAmount', interactionId, 'block', block)
    assert.fieldEquals('ComputeInputAmount', interactionId, 'externalContract', primitiveId)

    assert.fieldEquals('User', user, 'computeInputAmounts', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('Primitive', primitiveId, 'users', `[${user}]`)
    assert.fieldEquals('Primitive', primitiveId, 'createdTimestamp', timestamp)
    assert.fieldEquals('Primitive', primitiveId, 'recognized', 'true')

    clearStore()
})

test('Handle a token register and a compute output amount', () => {
    let oceanTransaction = createNewOceanTransaction('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1)
    handleOceanTransaction(oceanTransaction)
    
    let newTokensRegistered = createNewTokensRegisteredEvent('0xbbbbbb4eCC1E1406c9E11f1845F4063066e0C094', [123, 456], [987, 654])
    handleNewTokensRegistered(newTokensRegistered);
    
    let newComputeInputAmount = createNewComputeInputAmountEvent('0xbbbbbb4eCC1E1406c9E11f1845F4063066e0C094', 123, 456, 5, 6, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb')
    handleComputeInputAmount(newComputeInputAmount)

    let oceanTransactionId = newComputeInputAmount.transaction.hash.toHexString()
    let interactionId = oceanTransactionId + '-I-0'
    let oceanTransactionInteractions = `[${interactionId}]`  
    let user = newComputeInputAmount.params.user.toHexString()
    let timestamp = newComputeInputAmount.block.timestamp.toString()
    let block = newComputeInputAmount.block.number.toString()
    let primitiveId = newComputeInputAmount.params.primitive.toHexString()
    
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'user', user);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'interactions', oceanTransactionInteractions);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'timestamp', timestamp);
    assert.fieldEquals('OceanTransaction', oceanTransactionId, 'block', block);

    assert.fieldEquals('ComputeInputAmount', interactionId, 'inputToken', '123')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'outputToken', '456')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'inputAmount', '5')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'outputAmount', '6')
    assert.fieldEquals('ComputeInputAmount', interactionId, 'user', user)
    assert.fieldEquals('ComputeInputAmount', interactionId, 'timestamp', timestamp)
    assert.fieldEquals('ComputeInputAmount', interactionId, 'block', block)
    assert.fieldEquals('ComputeInputAmount', interactionId, 'externalContract', primitiveId)

    assert.fieldEquals('User', user, 'computeInputAmounts', `[${interactionId}]`)
    assert.fieldEquals('User', user, 'createdTimestamp', timestamp)

    assert.fieldEquals('Primitive', primitiveId, 'users', `[${user}]`)
    assert.fieldEquals('Primitive', primitiveId, 'createdTimestamp', timestamp)
    assert.fieldEquals('Primitive', primitiveId, 'recognized', 'true')
    
    assert.fieldEquals('RegisteredToken', '123', 'supply', '-5')
    assert.fieldEquals('RegisteredToken', '456', 'supply', '6')

    clearStore();
})

test('Handle a single token register', () => {
    let newTokensRegistered = createNewTokensRegisteredEvent('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', [123, 456], [987, 654])
    handleNewTokensRegistered(newTokensRegistered);
    
    let tokenRegistryId = newTokensRegistered.transaction.hash.toHexString() + '-' + newTokensRegistered.logIndex.toString()
    let primitiveAddress = newTokensRegistered.params.creator.toHexString()
    let timestamp = newTokensRegistered.block.timestamp.toString()
    let block = newTokensRegistered.block.number.toString()
    let registeredToken1Id = newTokensRegistered.params.tokens[0].toString()
    let registeredToken2Id = newTokensRegistered.params.tokens[1].toString()
    let registeredTokens = `[${registeredToken1Id}, ${registeredToken2Id}]`
    
    assert.fieldEquals('TokenRegistry', tokenRegistryId, 'creator', newTokensRegistered.params.creator.toHexString())
    assert.fieldEquals('TokenRegistry', tokenRegistryId, 'timestamp', timestamp)
    assert.fieldEquals('TokenRegistry', tokenRegistryId, 'block', block)
    assert.fieldEquals('TokenRegistry', tokenRegistryId, 'tokens', registeredTokens)

    assert.fieldEquals('Primitive', primitiveAddress, 'recognized', 'true')
    assert.fieldEquals('Primitive', primitiveAddress, 'registeredTokens', registeredTokens)
    assert.fieldEquals('Primitive', primitiveAddress, 'createdTimestamp', timestamp)

    assert.fieldEquals('RegisteredToken', registeredToken1Id, 'issuer', primitiveAddress)
    assert.fieldEquals('RegisteredToken', registeredToken1Id, 'createdTimestamp', timestamp)
    
    assert.fieldEquals('RegisteredToken', registeredToken2Id, 'issuer', primitiveAddress)
    assert.fieldEquals('RegisteredToken', registeredToken2Id, 'createdTimestamp', timestamp)

    clearStore();
})

test('Handle a transfer batch (mints and burns) for ERC-20', () => {
    let tokenAddress_1 = Address.fromString('0xcccccca5C5756ed6f4fEA3DC8E61c917AAa29685')
    
    createMockedFunction(tokenAddress_1, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x5348454c4c'))])
    let ERC20Symbol1_1 = ERC20SymbolBytes.bind(tokenAddress_1)

    createMockedFunction(tokenAddress_1, 'symbol', 'symbol():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('SHELL')])
    let ERC20Symbol1_2 = ERC20.bind(tokenAddress_1)

    createMockedFunction(tokenAddress_1, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x5348454c4c'))])
    let ERC20Name1_1 = ERC20NameBytes.bind(tokenAddress_1)

    createMockedFunction(tokenAddress_1, 'name', 'name():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('SHELL')])
    let ERC20Name1_2 = ERC20.bind(tokenAddress_1)

    createMockedFunction(tokenAddress_1, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    let ERC20Decimals_1 = ERC20.bind(tokenAddress_1)

    let erc20Wrap_1 = createNewErc20WrapEvent(tokenAddress_1.toHexString(), 10, 9, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc20Wrap(erc20Wrap_1)

    let tokenAddress_2 = Address.fromString('0xddddddD64de62066F31e10133fA7cE5f88DBE434')

    createMockedFunction(tokenAddress_2, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4f4345414e'))])
    let ERC20Symbol2_1 = ERC20SymbolBytes.bind(tokenAddress_2)

    createMockedFunction(tokenAddress_2, 'symbol', 'symbol():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('OCEAN')])
    let ERC20Symbol2_2 = ERC20.bind(tokenAddress_2)

    createMockedFunction(tokenAddress_2, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4f4345414e'))])
    let ERC20Name2_1 = ERC20NameBytes.bind(tokenAddress_2)

    createMockedFunction(tokenAddress_2, 'name', 'name():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('OCEAN')])
    let ERC20Name2_2 = ERC20.bind(tokenAddress_2)

    createMockedFunction(tokenAddress_2, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    let ERC20Decimals_2 = ERC20.bind(tokenAddress_2)

    let erc20Wrap_2 = createNewErc20WrapEvent(tokenAddress_2.toHexString(), 10, 9, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 5678)
    handleErc20Wrap(erc20Wrap_2)

    let mintTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', zeroAddress.toHexString(), '0xaaaaaa03b7b1fe745F3218B4a9061e98917B17f7', [1234, 5678], [9, 9])
    handleTransferBatch(mintTransferBatch)

    let mintOceanTransactionId = mintTransferBatch.transaction.hash.toHexString()
    let mint1Id = mintOceanTransactionId + '-M-0'
    let mint2Id = mintOceanTransactionId + '-M-1'

    let erc20Unwrap_1 = createNewErc20UnwrapEvent(tokenAddress_1.toHexString(), 10, 8, 2, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc20Unwrap(erc20Unwrap_1)

    let erc20Unwrap_2 = createNewErc20UnwrapEvent(tokenAddress_2.toHexString(), 10, 8, 2, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 5678)
    handleErc20Unwrap(erc20Unwrap_2)

    let burnTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaa03b7b1fe745F3218B4a9061e98917B17f7', zeroAddress.toHexString(), [1234, 5678], [8, 8])
    handleTransferBatch(burnTransferBatch)

    let burnOceanTransactionId = burnTransferBatch.transaction.hash.toHexString()
    let burn1Id = burnOceanTransactionId + '-B-0'
    let burn2Id = burnOceanTransactionId + '-B-1'

    let userBalance1Id = '0xaaaaaa03b7b1fe745f3218b4a9061e98917b17f7-1234'
    let userBalance2Id = '0xaaaaaa03b7b1fe745f3218b4a9061e98917b17f7-5678'

    // logStore()
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'burns', `[${burn1Id}, ${burn2Id}]`)
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'mints', `[${mint1Id}, ${mint2Id}]`)

    assert.fieldEquals('Mint', mint1Id, 'oceanToken', '1234')
    assert.fieldEquals('Mint', mint1Id, 'amount', '9')
    
    assert.fieldEquals('Mint', mint2Id, 'oceanToken', '5678')
    assert.fieldEquals('Mint', mint2Id, 'amount', '9')

    assert.fieldEquals('Burn', burn1Id, 'oceanToken', '1234')
    assert.fieldEquals('Burn', burn1Id, 'amount', '8')
    
    assert.fieldEquals('Burn', burn2Id, 'oceanToken', '5678')
    assert.fieldEquals('Burn', burn2Id, 'amount', '8')
    
    assert.fieldEquals('OceanToken', '1234', 'supply', '1')
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', tokenAddress_1.toHexString())
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-20')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', 'null')

    assert.fieldEquals('OceanToken', '5678', 'supply', '1')
    assert.fieldEquals('OceanToken', '5678', 'sourceContract', tokenAddress_2.toHexString())
    assert.fieldEquals('OceanToken', '5678', 'contractType', 'ERC-20')
    assert.fieldEquals('OceanToken', '5678', 'contractNonce', 'null')

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaa03b7b1fe745f3218b4a9061e98917b17f7')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '1')

    assert.fieldEquals('UserBalance', userBalance2Id, 'user', '0xaaaaaa03b7b1fe745f3218b4a9061e98917b17f7')
    assert.fieldEquals('UserBalance', userBalance2Id, 'oceanId', '5678')
    assert.fieldEquals('UserBalance', userBalance2Id, 'balance', '1')

    clearStore()
})

test('Handle a transfer batch (mints and burns) for ERC-721', () => {
    let erc721Wrap_1 = createNewErc721WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Wrap(erc721Wrap_1)

    let erc721Wrap_2 = createNewErc721WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 5678)
    handleErc721Wrap(erc721Wrap_2)

    let mintTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', zeroAddress.toHexString(), '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', [1234, 5678], [1, 1])
    handleTransferBatch(mintTransferBatch)

    let mintOceanTransactionId = mintTransferBatch.transaction.hash.toHexString()
    let externalContractAddress = erc721Wrap_1.params.erc721Token.toHexString()
    let mint1Id = mintOceanTransactionId + '-M-0'
    let mint2Id = mintOceanTransactionId + '-M-1'

    let erc721Unwrap_1 = createNewErc721UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Unwrap(erc721Unwrap_1)

    let erc721Unwrap_2 = createNewErc721UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 5678)
    handleErc721Unwrap(erc721Unwrap_2)

    let burnTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', zeroAddress.toHexString(), [1234, 5678], [1, 1])
    handleTransferBatch(burnTransferBatch)

    let burnOceanTransactionId = burnTransferBatch.transaction.hash.toHexString()
    let burn1Id = burnOceanTransactionId + '-B-0'
    let burn2Id = burnOceanTransactionId + '-B-1'

    let userBalance1Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-1234'
    let userBalance2Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-5678'
    
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'burns', `[${burn1Id}, ${burn2Id}]`)
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'mints', `[${mint1Id}, ${mint2Id}]`)

    assert.fieldEquals('Mint', mint1Id, 'oceanToken', '1234')
    assert.fieldEquals('Mint', mint1Id, 'amount', '1')
    
    assert.fieldEquals('Mint', mint2Id, 'oceanToken', '5678')
    assert.fieldEquals('Mint', mint2Id, 'amount', '1')

    assert.fieldEquals('Burn', burn1Id, 'oceanToken', '1234')
    assert.fieldEquals('Burn', burn1Id, 'amount', '1')
    
    assert.fieldEquals('Burn', burn2Id, 'oceanToken', '5678')
    assert.fieldEquals('Burn', burn2Id, 'amount', '1')
    
    assert.fieldEquals('OceanToken', '1234', 'supply', '0')
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-721')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', '123')

    assert.fieldEquals('OceanToken', '5678', 'supply', '0')
    assert.fieldEquals('OceanToken', '5678', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '5678', 'contractType', 'ERC-721')
    assert.fieldEquals('OceanToken', '5678', 'contractNonce', '567')

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '0')

    assert.fieldEquals('UserBalance', userBalance2Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance2Id, 'oceanId', '5678')
    assert.fieldEquals('UserBalance', userBalance2Id, 'balance', '0')

    clearStore()
})

test('Handle a transfer batch (mints and burns) for ERC-1155', () => {
    let erc1155Wrap_1 = createNewErc155WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, 10, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Wrap(erc1155Wrap_1)

    let erc1155Wrap_2 = createNewErc155WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, 11, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 5678)
    handleErc1155Wrap(erc1155Wrap_2)

    let mintTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', zeroAddress.toHexString(), '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', [1234, 5678], [10, 11])
    handleTransferBatch(mintTransferBatch)

    let mintOceanTransactionId = mintTransferBatch.transaction.hash.toHexString()
    let externalContractAddress = erc1155Wrap_1.params.erc1155Token.toHexString()
    let mint1Id = mintOceanTransactionId + '-M-0'
    let mint2Id = mintOceanTransactionId + '-M-1'

    let erc1155Unwrap_1 = createNewErc155UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, 10, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Unwrap(erc1155Unwrap_1)

    let erc1155Unwrap_2 = createNewErc155UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 567, 11, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 5678)
    handleErc1155Unwrap(erc1155Unwrap_2)

    let burnTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', zeroAddress.toHexString(), [1234, 5678], [10, 11])
    handleTransferBatch(burnTransferBatch)

    let burnOceanTransactionId = burnTransferBatch.transaction.hash.toHexString()
    let burn1Id = burnOceanTransactionId + '-B-0'
    let burn2Id = burnOceanTransactionId + '-B-1'

    let userBalance1Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-1234'
    let userBalance2Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-5678'

    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'burns', `[${burn1Id}, ${burn2Id}]`)
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'mints', `[${mint1Id}, ${mint2Id}]`)

    assert.fieldEquals('Mint', mint1Id, 'oceanToken', '1234')
    assert.fieldEquals('Mint', mint1Id, 'amount', '10')
    
    assert.fieldEquals('Mint', mint2Id, 'oceanToken', '5678')
    assert.fieldEquals('Mint', mint2Id, 'amount', '11')

    assert.fieldEquals('Burn', burn1Id, 'oceanToken', '1234')
    assert.fieldEquals('Burn', burn1Id, 'amount', '10')
    
    assert.fieldEquals('Burn', burn2Id, 'oceanToken', '5678')
    assert.fieldEquals('Burn', burn2Id, 'amount', '11')
    
    assert.fieldEquals('OceanToken', '1234', 'supply', '0')
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-1155')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', '123')

    assert.fieldEquals('OceanToken', '5678', 'supply', '0')
    assert.fieldEquals('OceanToken', '5678', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '5678', 'contractType', 'ERC-1155')
    assert.fieldEquals('OceanToken', '5678', 'contractNonce', '567')

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '0')

    assert.fieldEquals('UserBalance', userBalance2Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance2Id, 'oceanId', '5678')
    assert.fieldEquals('UserBalance', userBalance2Id, 'balance', '0')

    clearStore()
})

test('Handle a transfer batch (user transfers)', () => {
    let newTransferBatch = createNewTransferBatch('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', '0xbbbbbb8290b83D30062209c92cb069c3E36c3736', [123, 456], [10, 15])
    handleTransferBatch(newTransferBatch)

    let oceanTransactionId = newTransferBatch.transaction.hash.toHexString()
    let transfer1Id = oceanTransactionId + '-' + newTransferBatch.logIndex.toString() + '-0'
    let transfer2Id = oceanTransactionId + '-' + newTransferBatch.logIndex.toString() + '-1'
    let from = newTransferBatch.params.from.toHexString()
    let to = newTransferBatch.params.to.toHexString()
    let timestmap = newTransferBatch.block.timestamp.toString()
    let block = newTransferBatch.block.number.toString()
    
    assert.fieldEquals('UserTransfer', transfer1Id, 'from', from)
    assert.fieldEquals('UserTransfer', transfer1Id, 'to', to)
    assert.fieldEquals('UserTransfer', transfer1Id, 'oceanToken', '123')
    assert.fieldEquals('UserTransfer', transfer1Id, 'amount', '10')
    assert.fieldEquals('UserTransfer', transfer1Id, 'timestamp', timestmap)
    assert.fieldEquals('UserTransfer', transfer1Id, 'block', block)

    assert.fieldEquals('UserTransfer', transfer2Id, 'from', from)
    assert.fieldEquals('UserTransfer', transfer2Id, 'to', to)
    assert.fieldEquals('UserTransfer', transfer2Id, 'oceanToken', '456')
    assert.fieldEquals('UserTransfer', transfer2Id, 'amount', '15')
    assert.fieldEquals('UserTransfer', transfer2Id, 'timestamp', timestmap)
    assert.fieldEquals('UserTransfer', transfer2Id, 'block', block)

    assert.fieldEquals('User', from, 'transfers', `[${transfer1Id}, ${transfer2Id}]`)
    assert.fieldEquals('User', to, 'transfers', `[${transfer1Id}, ${transfer2Id}]`)

    let userBalance1Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-123'
    let userBalance2Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-456'
    let userBalance3Id = '0xbbbbbb8290b83d30062209c92cb069c3e36c3736-123'
    let userBalance4Id = '0xbbbbbb8290b83d30062209c92cb069c3e36c3736-456'

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '123')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '-10')

    assert.fieldEquals('UserBalance', userBalance2Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance2Id, 'oceanId', '456')
    assert.fieldEquals('UserBalance', userBalance2Id, 'balance', '-15')

    assert.fieldEquals('UserBalance', userBalance3Id, 'user', '0xbbbbbb8290b83d30062209c92cb069c3e36c3736')
    assert.fieldEquals('UserBalance', userBalance3Id, 'oceanId', '123')
    assert.fieldEquals('UserBalance', userBalance3Id, 'balance', '10')

    assert.fieldEquals('UserBalance', userBalance4Id, 'user', '0xbbbbbb8290b83d30062209c92cb069c3e36c3736')
    assert.fieldEquals('UserBalance', userBalance4Id, 'oceanId', '456')
    assert.fieldEquals('UserBalance', userBalance4Id, 'balance', '15')

    clearStore()
})

test('Handle a transfer single (mint and burn) for ERC-20', () => {
    let tokenAddress = Address.fromString('0xcccccca5C5756ed6f4fEA3DC8E61c917AAa29685')
    
    createMockedFunction(tokenAddress, 'symbol', 'symbol():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Symbol = ERC20SymbolBytes.bind(tokenAddress)
    let symbolBytes = ERC20Symbol.symbol()

    createMockedFunction(tokenAddress, 'symbol', 'symbol():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Symbol2 = ERC20.bind(tokenAddress)
    let symbolString = ERC20Symbol2.symbol()

    createMockedFunction(tokenAddress, 'name', 'name():(bytes32)')
        .withArgs([])
        .returns([ethereum.Value.fromBytes(Bytes.fromHexString('0x4552433230'))])
    let ERC20Name = ERC20NameBytes.bind(tokenAddress)
    let nameBytes = ERC20Name.name()

    createMockedFunction(tokenAddress, 'name', 'name():(string)')
        .withArgs([])
        .returns([ethereum.Value.fromString('ERC20')])
    let ERC20Name2 = ERC20.bind(tokenAddress)
    let nameString = ERC20Name2.name()

    createMockedFunction(tokenAddress, 'decimals', 'decimals():(uint8)')
        .withArgs([])
        .returns([ethereum.Value.fromI32(18)])
    let ERC20Decimals = ERC20.bind(tokenAddress)
    let decimals = ERC20Decimals.decimals()

    let erc20Wrap_1 = createNewErc20WrapEvent(tokenAddress.toHexString(), 10, 9, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc20Wrap(erc20Wrap_1)

    let mintTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', zeroAddress.toHexString(), tokenAddress.toHexString(), 1234, 9)
    handleTransferSingle(mintTransferSingle)

    let mintOceanTransactionId = mintTransferSingle.transaction.hash.toHexString()
    let mint1Id = mintOceanTransactionId + '-M-0'

    let erc20Unwrap_1 = createNewErc20UnwrapEvent(tokenAddress.toHexString(), 10, 8, 2, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc20Unwrap(erc20Unwrap_1)

    let burnTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', tokenAddress.toHexString(), zeroAddress.toHexString(), 1234, 8)
    handleTransferSingle(burnTransferSingle)

    let burnOceanTransactionId = burnTransferSingle.transaction.hash.toHexString()
    let burn1Id = burnOceanTransactionId + '-B-0'

    let userBalance1Id = `${tokenAddress.toHexString()}-1234`
    
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'burns', `[${burn1Id}]`)
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'mints', `[${mint1Id}]`)

    assert.fieldEquals('Mint', mint1Id, 'oceanToken', '1234')
    assert.fieldEquals('Mint', mint1Id, 'amount', '9')

    assert.fieldEquals('Burn', burn1Id, 'oceanToken', '1234')
    assert.fieldEquals('Burn', burn1Id, 'amount', '8')
    
    assert.fieldEquals('OceanToken', '1234', 'supply', '1')
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', tokenAddress.toHexString())
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-20')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', 'null')

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', tokenAddress.toHexString())
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '1')

    clearStore()
})

test('Handle a transfer single (mint and burn) for ERC-721', () => {
    let erc721Wrap_1 = createNewErc721WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Wrap(erc721Wrap_1)

    let mintTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', zeroAddress.toHexString(), '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 1234, 1)
    handleTransferSingle(mintTransferSingle)

    let mintOceanTransactionId = mintTransferSingle.transaction.hash.toHexString()
    let externalContractAddress = erc721Wrap_1.params.erc721Token.toHexString()
    let mint1Id = mintOceanTransactionId + '-M-0'

    let erc721Unwrap_1 = createNewErc721UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc721Unwrap(erc721Unwrap_1)

    let burnTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', zeroAddress.toHexString(), 1234, 1)
    handleTransferSingle(burnTransferSingle)

    let burnOceanTransactionId = burnTransferSingle.transaction.hash.toHexString()
    let burn1Id = burnOceanTransactionId + '-B-0'

    let userBalance1Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-1234'
    
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'burns', `[${burn1Id}]`)
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'mints', `[${mint1Id}]`)

    assert.fieldEquals('Mint', mint1Id, 'oceanToken', '1234')
    assert.fieldEquals('Mint', mint1Id, 'amount', '1')

    assert.fieldEquals('Burn', burn1Id, 'oceanToken', '1234')
    assert.fieldEquals('Burn', burn1Id, 'amount', '1')
    
    assert.fieldEquals('OceanToken', '1234', 'supply', '0')
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-721')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', '123')

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '0')

    clearStore()
})

test('Handle a transfer single (mint and burn) for ERC-1155', () => {
    let erc1155Wrap_1 = createNewErc155WrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, 10, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Wrap(erc1155Wrap_1)

    let mintTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', zeroAddress.toHexString(), '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 1234, 10)
    handleTransferSingle(mintTransferSingle)

    let mintOceanTransactionId = mintTransferSingle.transaction.hash.toHexString()
    let externalContractAddress = erc1155Wrap_1.params.erc1155Token.toHexString()
    let mint1Id = mintOceanTransactionId + '-M-0'

    let erc1155Unwrap_1 = createNewErc155UnwrapEvent('0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 123, 10, 1, '0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', 1234)
    handleErc1155Unwrap(erc1155Unwrap_1)

    let burnTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', zeroAddress.toHexString(), 1234, 10)
    handleTransferSingle(burnTransferSingle)

    let burnOceanTransactionId = burnTransferSingle.transaction.hash.toHexString()
    let burn1Id = burnOceanTransactionId + '-B-0'

    let userBalance1Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-1234'

    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'burns', `[${burn1Id}]`)
    assert.fieldEquals('OceanTransaction', mintOceanTransactionId, 'mints', `[${mint1Id}]`)

    assert.fieldEquals('Mint', mint1Id, 'oceanToken', '1234')
    assert.fieldEquals('Mint', mint1Id, 'amount', '10')

    assert.fieldEquals('Burn', burn1Id, 'oceanToken', '1234')
    assert.fieldEquals('Burn', burn1Id, 'amount', '10')
    
    assert.fieldEquals('OceanToken', '1234', 'supply', '0')
    assert.fieldEquals('OceanToken', '1234', 'sourceContract', externalContractAddress)
    assert.fieldEquals('OceanToken', '1234', 'contractType', 'ERC-1155')
    assert.fieldEquals('OceanToken', '1234', 'contractNonce', '123')

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '0')

    clearStore()
})

test('Handle a transfer single (user transfers)', () => {
    let newTransferSingle = createNewTransferSingle('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', '0xbbbbbb8290b83D30062209c92cb069c3E36c3736', 1234, 10)
    handleTransferSingle(newTransferSingle)

    let oceanTransactionId = newTransferSingle.transaction.hash.toHexString()
    let transferId = oceanTransactionId + '-' + newTransferSingle.logIndex.toString()
    let from = newTransferSingle.params.from.toHexString()
    let to = newTransferSingle.params.to.toHexString()
    let timestmap = newTransferSingle.block.timestamp.toString()
    let block = newTransferSingle.block.number.toString()

    let userBalance1Id = '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8-1234'
    let userBalance2Id = '0xbbbbbb8290b83d30062209c92cb069c3e36c3736-1234'

    assert.fieldEquals('UserTransfer', transferId, 'from', from)
    assert.fieldEquals('UserTransfer', transferId, 'to', to)
    assert.fieldEquals('UserTransfer', transferId, 'oceanToken', '1234')
    assert.fieldEquals('UserTransfer', transferId, 'amount', '10')
    assert.fieldEquals('UserTransfer', transferId, 'timestamp', timestmap)
    assert.fieldEquals('UserTransfer', transferId, 'block', block)

    assert.fieldEquals('User', from, 'transfers', `[${transferId}]`)
    assert.fieldEquals('User', to, 'transfers', `[${transferId}]`)

    assert.fieldEquals('UserBalance', userBalance1Id, 'user', '0xaaaaaae4e6827ab977efce4e328a30ce229aa4e8')
    assert.fieldEquals('UserBalance', userBalance1Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance1Id, 'balance', '-10')

    assert.fieldEquals('UserBalance', userBalance2Id, 'user', '0xbbbbbb8290b83d30062209c92cb069c3e36c3736')
    assert.fieldEquals('UserBalance', userBalance2Id, 'oceanId', '1234')
    assert.fieldEquals('UserBalance', userBalance2Id, 'balance', '10')

    clearStore()
})

test('Handle a forwarder interaction', () => {
    let newForwarderTransaction = createNewForwardedOceanTransactionEvent('0xabc1F487D79B8f9048e61e8718F9baae4e945ECb', '0xaaaaaae4E6827AB977efce4E328A30Ce229Aa4e8', 5)
    handleForwarderTransaction(newForwarderTransaction)

    let oceanTransaction = newForwarderTransaction.transaction.hash.toHexString()
    let forwarderTransactionId = oceanTransaction + '-' + newForwarderTransaction.logIndex.toString()
    let forwarder = newForwarderTransaction.params.forwarder.toHexString()
    
    assert.fieldEquals('ForwarderTransaction', forwarderTransactionId, 'forwarder', forwarder)

    clearStore()
})

import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { ERC20 } from '../generated/Ocean/ERC20'
import { ERC20SymbolBytes } from '../generated/Ocean/ERC20SymbolBytes'
import { ERC20NameBytes } from '../generated/Ocean/ERC20NameBytes'

// Constants used throughout the code
export let oceanDecimals = BigInt.fromI32(18)
export let ZERO_BI = BigInt.fromI32(0)
export let ZERO_BD = BigDecimal.fromString('0')
export let ONE_BI = BigInt.fromI32(1)
export let oceanAddress =  Address.fromString('0xc95DAf083b754210458e62EaD997453F74F47072')
export let zeroAddress = Address.zero()
export let uint64Max = BigInt.fromU64(18446744073709551615)


// Function used to validate The Ocean 
export function validateOcean(address: Address): boolean {
  return address.toHexString() == oceanAddress.toHexString()
}

// Function that checks if the value is null
export function isNullEthValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

// Function that will fetch the token symbol from the ERC-20 Contract
export function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let contractSymbolBytes = ERC20SymbolBytes.bind(tokenAddress)

    // try types string and bytes32 for symbol
    let symbolValue = 'unknown'
    let symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {
        let symbolResultBytes = contractSymbolBytes.try_symbol()
        if (!symbolResultBytes.reverted) {
        // for broken pairs that have no symbol function exposed
          if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
              symbolValue = symbolResultBytes.value.toString()
              log.warning('symbol {}', [symbolValue])
          }
        }
    } else {
        symbolValue = symbolResult.value
    }
    return symbolValue
}

// Function that will fetch the token name from the ERC-20 Contract
export function fetchTokenName(tokenAddress: Address): string {
    let contract = ERC20.bind(tokenAddress)
    let contractNameBytes = ERC20NameBytes.bind(tokenAddress)
  
    // try types string and bytes32 for name
    let nameValue = 'unknown'
    let nameResult = contract.try_name()
    if (nameResult.reverted) {
      let nameResultBytes = contractNameBytes.try_name()
      if (!nameResultBytes.reverted) {
        // for broken exchanges that have no name function exposed
        if (!isNullEthValue(nameResultBytes.value.toHexString())) {
          nameValue = nameResultBytes.value.toString()
          log.warning('name {}', [nameValue])
        }
      }
    } else {
      nameValue = nameResult.value
    }
    return nameValue
  }

// Function that will fetch the token decimals from the ERC-20 Contract
export function fetchTokenDecimals(tokenAddress: Address): BigInt {
    let contract = ERC20.bind(tokenAddress)
    // try types uint8 for decimals
    let decimalValue = null
    let decimalResult = contract.try_decimals()
    if (!decimalResult.reverted) {
      decimalValue = decimalResult.value
    }
    return BigInt.fromI32(decimalValue)
  }




import { Address } from "@graphprotocol/graph-ts";
import { 
    RegisteredToken, 
    Primitive, 
    UnwrapFee, 
    User, 
    Fee, 
    ERC20ExternalContract, 
    ERC721ExternalContract,
    ERC721Token,
    ERC1155ExternalContract, 
    ERC1155Token,
    ERC20Wrap,
    ERC20Unwrap,
    ERC721Wrap,
    ERC721Unwrap,
    ERC1155Wrap,
    ERC1155Unwrap,
    ComputeInputAmount,
    ComputeOutputAmount,
    OceanTransaction,
    ForwarderTransaction,
    Mint, 
    Burn,
    OceanToken,
    Warning,
    UserTransfer,
    TokenRegistry,
    UserBalance,
} from '../generated/schema'
import { 
    ZERO_BI,
    fetchTokenName,
    fetchTokenDecimals,
    fetchTokenSymbol, 
    uint64Max,
} from "./helpers"

// Function that will load a Fee instance or create a new one
export function loadFee(id: string): Fee {
    let fee = Fee.load(id)
    // If the Fee does not exist, initialize its attributes
    if (fee == null) {
        fee = new Fee(id)
        fee.save()
    }
    return fee as Fee
}

// Function that will load an UnwrapFee instance or create a new one
export function loadUnwrapFee(id: string): UnwrapFee {
    let unwrapFee = UnwrapFee.load(id)
    // If the Unwrap Fee does not exist, initialize its attributes
    if (unwrapFee == null) {
        unwrapFee = new UnwrapFee(id)
        unwrapFee.previousFees = new Array<string>();
        unwrapFee.save()
    }
    return unwrapFee as UnwrapFee
}

// Function that will load a Primitive instance or create a new one
export function loadPrimitive(address: Address): Primitive {
    let hexAddress = address.toHexString()
    let primitive = Primitive.load(hexAddress)
    // If the Primitive does not exist, initialize its attributes
    if (primitive == null) {
        primitive = new Primitive(hexAddress)
        primitive.users = new Array<string>();
        primitive.registeredTokens = new Array<string>();
        primitive.createdTimestamp = uint64Max;
        primitive.recognized = false
        primitive.save()
    }
    return primitive as Primitive
}

// Function that will load a User instance or create a new one
export function loadUser(address: Address): User {
    let hexAddress = address.toHexString()
    let user = User.load(hexAddress)
    // If the User does not exist, initialize its attributes
    if (user == null) {
        user = new User(hexAddress)
        user.erc20Wraps = new Array<string>();
        user.erc20Unwraps = new Array<string>();
        user.erc721Wraps = new Array<string>();
        user.erc721Unwraps = new Array<string>();
        user.erc1155Wraps = new Array<string>();
        user.erc1155Unwraps = new Array<string>();
        user.computeInputAmounts = new Array<string>();
        user.computeInputAmounts = new Array<string>();
        user.transfers = new Array<string>();
        user.createdTimestamp = uint64Max;
        user.userBalances = new Array<string>();
        user.save()
    }
    return user as User
}
 
// Function that will load a Registered Token instance or create a new one
export function loadRegisteredToken(id: string): RegisteredToken {
    let registeredToken = RegisteredToken.load(id)
    // If the Registered Token does not exist, initialize its attributes
    if (registeredToken == null) {
        registeredToken = new RegisteredToken(id)
        registeredToken.supply = ZERO_BI
        registeredToken.save()
    }
    return registeredToken as RegisteredToken
}

// Function that will load a Registered Token instance or create a new one
export function loadOceanTransaction(transactionHash: string): OceanTransaction {
    let transaction = OceanTransaction.load(transactionHash)
    // If the Ocean Transaction does not exsit, initialize its attributes
    if (transaction == null) {
        transaction = new OceanTransaction(transactionHash)
        transaction.mints = new Array<string>();
        transaction.burns = new Array<string>();
        transaction.interactions = new Array<string>();
        transaction.save()
    }
    return transaction as OceanTransaction
}

// Function that will load an ERC-20 Wrap Interaction instance or create a new one
export function loadErc20WrapInteraction(id: string): ERC20Wrap {
    let interaction = ERC20Wrap.load(id)
    // If the ERC-20 Wrap Interaction does not exsit, initialize its attributes
    if (interaction == null) {
        interaction = new ERC20Wrap(id)
        interaction.save()
    }
    return interaction as ERC20Wrap
}

// Function that will load an ERC-20 Unwrap Interaction instance or create a new one
export function loadErc20UnwrapInteraction(id: string): ERC20Unwrap {
    let interaction = ERC20Unwrap.load(id)
    // If the ERC-20 Unwrap Interaction does not exsit, initialize its attributes
    if (interaction == null) {
        interaction = new ERC20Unwrap(id)
        interaction.save()
    }
    return interaction as ERC20Unwrap
}

// Function that will load an ERC-721 Wrap Interaction instance or create a new one
export function loadErc721WrapInteraction(id: string): ERC721Wrap {
    let interaction = ERC721Wrap.load(id)
    // If the ERC-721 Wrap Interaction does not exsit, initialize its attributes
    if (interaction == null) {
        interaction = new ERC721Wrap(id)
        interaction.save()
    }
    return interaction as ERC721Wrap
}

// Function that will load an ERC-721 Unwrap Interaction instance or create a new one
export function loadErc721UnwrapInteraction(id: string): ERC721Unwrap {
    let interaction = ERC721Unwrap.load(id)
    // If the ERC-721 Unwrap Interaction does not exsit, initialize its attributes
    if (interaction == null) {
        interaction = new ERC721Unwrap(id)
        interaction.save()
    }
    return interaction as ERC721Unwrap
}

// Function that will load an ERC-1155 Wrap Interaction instance or create a new one
export function loadErc1155WrapInteraction(id: string): ERC1155Wrap {
    let interaction = ERC1155Wrap.load(id)
    // If the ERC-1155 Wrap Interaction does not exsit, initialize its attributes
    if (interaction == null) {
        interaction = new ERC1155Wrap(id)
        interaction.save()
    }
    return interaction as ERC1155Wrap
}

// Function that will load an ERC-1155 Unwrap Interaction instance or create a new one
export function loadErc1155UnwrapInteraction(id: string): ERC1155Unwrap {
    let interaction = ERC1155Unwrap.load(id)
    // If the ERC-1155 Unwrap Interaction does not exsit, initialize its attributes
    if (interaction == null) {
        interaction = new ERC1155Unwrap(id)
        interaction.save()
    }
    return interaction as ERC1155Unwrap
}

// Function that will load an ERC-20 Wrap Interaction instance or create a new one
export function loadComputeInputAmountInteraction(id: string): ComputeInputAmount {
    let interaction = ComputeInputAmount.load(id)
    if (interaction == null) {
        interaction = new ComputeInputAmount(id)
        interaction.save()
    }
    return interaction as ComputeInputAmount
}

// Function that will load an ERC-20 Wrap Interaction instance or create a new one
export function loadComputeOutputAmountInteraction(id: string): ComputeOutputAmount {
    let interaction = ComputeOutputAmount.load(id)
    if (interaction == null) {
        interaction = new ComputeOutputAmount(id)
        interaction.save()
    }
    return interaction as ComputeOutputAmount
}

// Function that will load an ERC-20 External Contract instance or create a new one
export function loadErc20ExternalContract(address: Address): ERC20ExternalContract {
    let hexAddress = address.toHexString()
    let externalContract = ERC20ExternalContract.load(hexAddress)
    // If the ERC-20 External Contract does not exist, initialize its attributes
    if (externalContract == null) {
        externalContract = new ERC20ExternalContract(hexAddress)               
        externalContract.name = fetchTokenName(address)
        externalContract.symbol = fetchTokenSymbol(address)
        externalContract.decimals = fetchTokenDecimals(address)
        externalContract.wrappedAmount = ZERO_BI
        externalContract.cumulativeFees = ZERO_BI
        externalContract.recognized = false
        externalContract.save()
    }
    return externalContract as ERC20ExternalContract
}

// Function that will load an ERC-721 External Contract instance or create a new one
export function loadErc721ExternalContract(address: Address): ERC721ExternalContract {
    let hexAddress = address.toHexString()
    let externalContract = ERC721ExternalContract.load(hexAddress)
    // If the ERC-721 External Contract does not exist, initialize its attributes
    if (externalContract == null) {
        externalContract = new ERC721ExternalContract(hexAddress)
        externalContract.tokenIds = new Array<string>();
        externalContract.recognized = false
        externalContract.save()
    }
    return externalContract as ERC721ExternalContract
}

// Function that will load an ERC-721 Token instance or create a new one
export function loadErc721Token(id: string): ERC721Token {
    let erc1155Token = ERC721Token.load(id)
    // If the ERC-721 Token does not exist, initialize its attributes
    if (erc1155Token == null) {
        erc1155Token = new ERC721Token(id)
        erc1155Token.wrappedOceanSupply = ZERO_BI
        erc1155Token.save()
    }
    return erc1155Token as ERC721Token
}

// Function that will load an ERC-1155 External Contract instance or create a new one
export function loadErc1155ExternalContract(address: Address): ERC1155ExternalContract {
    let hexAddress = address.toHexString()
    let externalContract = ERC1155ExternalContract.load(hexAddress)
    // If the ERC-1155 External Contract does not exist, initialize its attributes
    if (externalContract == null) {
        externalContract = new ERC1155ExternalContract(hexAddress)
        externalContract.tokenIds = new Array<string>();
        externalContract.recognized = false
        externalContract.save()
    }
    return externalContract as ERC1155ExternalContract
}

// Function that will load an ERC-1155 Token instance or create a new one
export function loadErc1155Token(id: string): ERC1155Token {
    let erc1155Token = ERC1155Token.load(id)
    // If the ERC-1155 Token does not exist, initialize its attributes
    if (erc1155Token == null) {
        erc1155Token = new ERC1155Token(id)
        erc1155Token.wrappedOceanSupply = ZERO_BI
        erc1155Token.cumulativeFees = ZERO_BI
        erc1155Token.save()
    }
    return erc1155Token as ERC1155Token
}

// Function that will load a Burn instance or create a new one
export function loadBurn(id: string): Burn {
    let burn = Burn.load(id)
    // If the Burn does not exist, initialize its attributes
    if (burn == null) {
        burn = new Burn(id)
        burn.save()
    }
    return burn as Burn
}

// Function that will load a Mint instance or create a new one
export function loadMint(id: string): Mint {
    let mint = Mint.load(id)
    // If the Mint does not exist, initialize its attributes
    if (mint == null) {
        mint = new Mint(id)
        mint.save()
    }
    return mint as Mint
}

// Function that will load a User Transfer instance or create a new one
export function loadUserTransfer(id: string): UserTransfer {
    let userTransfer = UserTransfer.load(id)
    // If the User Transfer does not exist, initialize its attributes
    if (userTransfer == null) {
        userTransfer = new UserTransfer(id) 
        userTransfer.save()
    }
    return userTransfer as UserTransfer
}

// Function that will load a Ocean Token instance or create a new one
export function loadOceanToken(id: string): OceanToken {
    let oceanToken = OceanToken.load(id)
    // If the Ocean Token does not exist, initialize its attributes
    if (oceanToken == null) {
        oceanToken = new OceanToken(id)
        oceanToken.supply = ZERO_BI
        oceanToken.save()
    }
    return oceanToken as OceanToken
}

// Function that will load a Forwarder Transaction instance or create a new one
export function loadForwarderTransaction(id: string): ForwarderTransaction {
    let transaction = ForwarderTransaction.load(id)
    // If the Forwarder Transaction does not exist, initialize its attributes
    if (transaction == null) {
        transaction = new ForwarderTransaction(id)
        transaction.save()
    }
    return transaction as ForwarderTransaction
}

// Function that will load a Warning instance or create a new one
export function loadWarning(id: string): Warning {
    let warning = Warning.load(id)
    // If the Warning does not exist, initialize its attributes
    if (warning == null) {
        warning = new Warning(id)
        warning.save()
    }
    return warning as Warning
}

// Function that will load a Token Registry instance or create a new one
export function loadTokenRegistry(id: string): TokenRegistry {
    let registry = TokenRegistry.load(id)
    // If the Registry does not exist, initialize its attributes
    if (registry == null) {
        registry = new TokenRegistry(id)
        registry.save()
    }
    return registry as TokenRegistry
}

// Function that will load a User Balance instance or create a new one
export function loadUserBalance(id: string): UserBalance {
    let userBalance = UserBalance.load(id)
    // If the User Balance does not exist, initialize its attributes
    if (userBalance == null) {
        userBalance = new UserBalance(id)
        userBalance.balance = ZERO_BI
        userBalance.save()
    }
    return userBalance as UserBalance
}


 
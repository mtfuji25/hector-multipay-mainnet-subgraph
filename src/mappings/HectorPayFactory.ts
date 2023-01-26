import {
  HectorPayContract,
  HectorPayFactory,
  Token,
} from '../../generated/schema'
import { HectorPayCreated } from '../../generated/templates/HectorPay/HectorPayFactory'
import { ERC20 } from '../../generated/HectorPayFactory/ERC20'
import { HectorPay } from '../../generated/templates'

export function onHectorPayCreated(event: HectorPayCreated): void {
  const factoryAddress = event.address
  const tokenAddress = event.params.token
  const hectorPayAddress = event.params.hectorPay
  const block = event.block.number
  const timestamp = event.block.timestamp

  // Load Factory
  let factory = HectorPayFactory.load(factoryAddress.toHexString())

  // Create new Factory entity with info if null
  if (factory === null) {
    factory = new HectorPayFactory(factoryAddress.toHexString())
    factory.address = factoryAddress
    factory.createdTimestamp = timestamp
    factory.createdBlock = block
  }

  // Create and fill new Token entity
  const erc20 = ERC20.bind(tokenAddress)
  let token = new Token(tokenAddress.toHexString())
  token.address = tokenAddress
  token.symbol = erc20.try_symbol().value
  token.name = erc20.try_name().value
  token.decimals = erc20.try_decimals().value
  token.createdTimestamp = timestamp
  token.createdBlock = block

  // Create new contract entity and fill with info
  let contract = new HectorPayContract(hectorPayAddress.toHexString())
  contract.address = hectorPayAddress
  contract.factory = factory.id
  contract.token = token.id
  contract.createdTimestamp = timestamp
  contract.createdBlock = block

  // Map contract to Token
  token.contract = contract.id

  // Start tracking the hectorpay contract
  HectorPay.create(hectorPayAddress)

  // Add 1 to contracts counted by factory
  factory.count += 1

  //Savooooor
  factory.save()
  token.save()
  contract.save()
}

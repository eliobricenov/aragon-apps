import { ETHER_TOKEN_VERIFIED_ADDRESSES } from './verified-tokens'
import { combineLatest } from '../rxjs'
import tokenBalanceOfAbi from '../abi/token-balanceof.json'
import tokenDecimalsAbi from '../abi/token-decimals.json'
import tokenSymbolAbi from '../abi/token-symbol.json'
import tokenBytesSymbolAbi from '../abi/token-bytes-symbol.json'
import { toUtf8 } from './web3-utils'


export const ETHER_TOKEN_FAKE_ADDRESS =
  '0x0000000000000000000000000000000000000000'

export const isTokenVerified = (tokenAddress, networkType) =>
  // The verified list is without checksums
  networkType === 'main'
    ? ETHER_TOKEN_VERIFIED_ADDRESSES.has(tokenAddress.toLowerCase())
    : true

  export async function getTokenData(app,userAccount,address){
    const tokenAbi = [].concat(tokenBalanceOfAbi, tokenDecimalsAbi, tokenSymbolAbi)
    const token = app.external(address, tokenAbi)    
    const tokenData = await getTokenPromise(token)    
    if (tokenData){
      if(tokenData.symbol){
          return new Promise((resolve, reject) =>
            combineLatest(
              token.symbol(),
              token.decimals(),
              token.balanceOf(userAccount)
            )
              .first()
              .subscribe(
                ([symbol, decimals, userBalance]) =>
                  resolve({
                    symbol,
                    userBalance,
                    decimals: parseInt(decimals, 10),
                    loading: false,
                  }),
                reject
              )
          )
      }
      else{
        const tokenAbi = [].concat(tokenBalanceOfAbi, tokenDecimalsAbi, tokenBytesSymbolAbi)
        const token = app.external(address, tokenAbi)    
        return new Promise((resolve, reject) =>
          combineLatest(
            token.symbol(),
            token.decimals(),
            token.balanceOf(userAccount)
          )
            .first()
            .subscribe(
              ([symbol, decimals, userBalance]) =>
                resolve({
                  symbol: toUtf8(symbol),
                  userBalance,
                  decimals: parseInt(decimals, 10),
                  loading: false,
                }),
              reject
            )
        )
      }
    }   
  }

  export async function getTokenSymbol(tokenSymbols, tokenContract){
    const tokenSymbol = await getTokenSymbolPromise(tokenContract)

    if (tokenSymbol){
      return new Promise((resolve, reject) => {
        if (tokenSymbols.has(tokenContract)) {
          resolve(tokenSymbols.get(tokenContract))
        } else {
          tokenContract
            .symbol()
            .first()
            .subscribe(
              symbol => {
                tokenSymbols.set(tokenContract, toUtf8(symbol))
                resolve({
                  symbol : toUtf8(symbol)
                })
              },
              () => {
                // Symbol is optional
                resolve('')
              }
            )
        }
      })
    }else{
      return new Promise((resolve, reject) => {
        if (tokenSymbols.has(tokenContract)) {
          resolve(tokenSymbols.get(tokenContract))
        } else {
          tokenContract
            .symbol()
            .first()
            .subscribe(
              symbol => {
                tokenSymbols.set(tokenContract, symbol)
                resolve(symbol)
              },
              () => {
                // Symbol is optional
                resolve('')
              }
            )
        }
      })
    }
  }

  export function getTokenSymbolPromise (tokenContract){
    return new Promise((resolve, reject) => {      
        tokenContract
          .symbol()
          .first()
          .subscribe(
            symbol => {
               resolve(symbol)
            },
            reject
          ) 
    })

  }

  export function getTokenPromise(token,userAccount){
    return new Promise((resolve, reject) =>
      combineLatest(
        token.symbol(),
        token.decimals(),
        token.balanceOf(userAccount)
      )
        .first()
        .subscribe(
          ([symbol, decimals, userBalance]) =>
            resolve({
              symbol,
              userBalance,
              decimals: parseInt(decimals, 10),
              loading: false,
            }),
          reject
        )
    )
  }
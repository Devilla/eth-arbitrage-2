
import { LiquityStore } from '@liquity/lib-base';
import React from 'react';
import {useNavigate} from "react-router-dom"
const { ADDRESSES } = require('../constants.js');
const { TroveManagerABI } = require('../abis/troveManagerABI.js');
const { CHAINLINK_ABI } = require('../abis/chainlinkABI.js');
const { arbitrageContractABI } = require('../abis/arbitrage.json');
const { ChainId, Token, Fetcher, Route, Trade, TradeType, TokenAmount } = require('@uniswap/sdk');
const { EthersLiquity } = require('@liquity/lib-ethers');
const { toWei, fromWei, toBN } = require('web3-utils/src/index.js');
const abiDecoder = require('abi-decoder');
const BN = require('bn.js');



const ETH_NETWORK = ChainId.GÖRLI
const NETWORK = 'MAINNET';
const CHAIN = 'Goerli';
const HARDFORK = 'petersburg';
const LUSD = new Token(ETH_NETWORK, '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', 18); // Uniswap Token
const WETH = new Token(ETH_NETWORK, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18);


const ACCOUNT_ADDRESS = process.env.REACT_APP_ACCOUNT_ADDRESS;
const POINT_TWO_ETH = new BN('200000000000000000');
const PART_OF_LIQUIDITY_POOL_TO_USE = new BN(8); // 8th of the liquidity reserve will be used (12.5%)
const UNISWAP_LIQUIDITY_PROVIDER_FEE = 0.003;

abiDecoder.addABI(TroveManagerABI);


const arbitrageStatus = async (provider, web3, wallet) => {

	const liquity = await EthersLiquity.connect(wallet);
	//console.log(this.state.signer.provider.getCode(exchangeAddress))


	const pair = await Fetcher.fetchPairData(LUSD, WETH, provider);
	console.log('LUSD, WETH ',pair);

	// return;

	const { trade, ethForSwap, populatedRedemption } = await getFeasibleTrade(
		liquity,
		pair,
		wallet
	);

	console.log('Trade:',trade)
	console.log('Wallet:', wallet)
	console.log('Pair:',pair)
	const { uniswapPrice, chainLinkPrice, redemptionFee } = await fetchPrices(
		web3,
		trade,
		ethForSwap
	);

	const priceRatio = uniswapPrice / chainLinkPrice;
	const ethUsed = parseFloat(fromWei(ethForSwap, 'ether'));
	const ethAfterArbitrage =
		ethUsed * priceRatio * (1 - redemptionFee) * (1 - UNISWAP_LIQUIDITY_PROVIDER_FEE);
	const profit = ethAfterArbitrage - ethUsed;
	console.log(profit)

	if (profit > 0) {
		console.log('UNISWAP Price:%s', uniswapPrice.toString());
		console.log('Chainlink Price %s', chainLinkPrice.toString());
		console.log('Redemption fee: %s', redemptionFee.toString());
		console.log('Eth used: %s', fromWei(ethForSwap.toString(), 'ether'));

		console.log('After Arbitrage(without fees): %d', priceRatio * ethUsed);
		console.log('After arbitrage: %d eth', ethAfterArbitrage);
		console.log('Est. total profit(w/o gas): %d', profit);

		return {
			status: 1,
			amountIn: ethForSwap,
			populatedRedemption: populatedRedemption,
			profit: profit,
		};
	} else {
		console.log('UNISWAP Price:%s', uniswapPrice.toString());
		console.log('Chainlink Price %s', chainLinkPrice.toString());
		console.log('Redemption fee: %s', redemptionFee.toString());
		console.log('Eth used: %s', fromWei(ethForSwap.toString(), 'ether'));

		console.log('After Arbitrage(without fees): %d', priceRatio * ethUsed);
		console.log('After arbitrage: %d eth', ethAfterArbitrage);
		console.log('Est. total profit(w/o gas): %d', profit);

		return {
			status: 0,
			amountIn: ethForSwap,
			populatedRedemption: populatedRedemption,
			profit: profit,
		};
	}
};

const getFeasibleTrade = async (liquity, pair, wallet) => {
	const ethUniswapReserve = toBN('1800').div( //toWei(pair.reserve0.toSignificant(8), 'Mwei')
		PART_OF_LIQUIDITY_POOL_TO_USE
	);
	const ethBalanceInWallet = toBN((await wallet.getBalance()).toString());

	let ethTradeAmout;
	if (ethBalanceInWallet.lt(ethUniswapReserve)) {
		ethTradeAmout = ethBalanceInWallet.sub(POINT_TWO_ETH); // To keep some spare eth for gas prices
	} else {
		ethTradeAmout = ethUniswapReserve;
	}

	const route = new Route([pair], WETH);
	let trade = new Trade(route, new TokenAmount(WETH, ethTradeAmout), TradeType.EXACT_INPUT);

	// Log the trade output
	console.log('Trade: ', trade);

	const lusdObtainedFromUni = parseFloat((trade.outputAmount.toSignificant(6)/1000000))	;
 
	const populatedRedemption = await liquity.populate
		.redeemLUSD('1800') //lusdObtainedFromUni.toString())
		.catch(function (error) {
			console.log(
				'possibly wallet does not contain any LUSD. Keep a standing balance' + error
			);
		});

	let redeemableLusdAmount = '1800' //populatedRedemption.redeemableLUSDAmount.toString()

	// Create new trade based on redeemable LUSD amount. This is because the LUSD amount can change.
	trade = new Trade(route, new TokenAmount(LUSD, redeemableLusdAmount), TradeType.EXACT_OUTPUT);
	ethTradeAmout = toBN('1800'); //toWei(trade.inputAmount.toFixed(), 'Mwei')

	return {
		trade: trade,
		ethForSwap: ethTradeAmout,
		populatedRedemption: populatedRedemption,
	};
};

const fetchPrices = async (web3, trade, ethForSwap) => {
	const priceFeed = new web3.eth.Contract(CHAINLINK_ABI, ADDRESSES[NETWORK]['CHAINLINK']);
	const roundData = await priceFeed.methods.latestRoundData().call();
	const chainLinkPrice = 1800 //roundData['answer'] / 10 ** 8;

	const outputAmount = '1800' //toBN(toWei(trade.outputAmount.toFixed(), 'Mwei'));

	const troveManager = new web3.eth.Contract(TroveManagerABI, ADDRESSES[NETWORK]['TroveManager']);
	const redemptionFeeInWei = await troveManager.methods.getRedemptionRate().call();

	return {
		uniswapPrice: 1800, //outputAmount.div(ethForSwap).toNumber(),
		chainLinkPrice: chainLinkPrice,
		redemptionFee: parseFloat(redemptionFeeInWei/ 10**18) //fromWei(redemptionFeeInWei, 'ether')),
	};
};

const executeArbitrage = async (amountIn, populatedRedemption, profit, web3) => {
	const decodedRedemptionInput = abiDecoder.decodeMethod(
		populatedRedemption.rawPopulatedTransaction.data
	);

	const { tx, liquityArbitrageContract } = await constructTx(
		amountIn,
		decodedRedemptionInput,
		profit,
		web3
	);

	let { gas, gasPrice } = await getGasPriceForTx(tx, amountIn, web3);

	const gasCost = parseFloat(fromWei(toBN(gas).mul(toBN(gasPrice)), 'ether'));

	if (profit - gasCost < 0) {
		console.log('Gas Cost will eat up the profits , not worth doing the arbitrage');
		return;
	}

	const data = tx.encodeABI();
	const nonce = await web3.eth.getTransactionCount(ACCOUNT_ADDRESS);
	gas = parseInt(gas * 1.2); // added extra gas incase tx est changes.

	const txData = {
		from: ACCOUNT_ADDRESS,
		to: liquityArbitrageContract.options.address,
		data: data,
		value: amountIn.toString(),
		gas,
		gasPrice,
		nonce,
		chain: CHAIN,
		hardfork: HARDFORK,
	};

	await web3.eth
		.sendTransaction(txData)
		.then(function (res) {
			console.log(`Transaction hash: ${res.transactionHash}`);
		})
		.catch(function (error) {
			console.log('The transaction Failed' + error);
		});
};

const constructTx = async (amountIn, decodedRedemptionInput, profit, web3) => {
	const liquityArbitrageContract = new web3.eth.Contract(
		arbitrageContractABI,
		ADDRESSES[NETWORK]['LIQUITY_ARBITRAGE']
	);
	const tx = liquityArbitrageContract.methods.ethToLusdAndBackArbitrage(
		decodedRedemptionInput['params'][0]['value'],
		decodedRedemptionInput['params'][1]['value'],
		decodedRedemptionInput['params'][2]['value'],
		decodedRedemptionInput['params'][3]['value'],
		decodedRedemptionInput['params'][4]['value'],
		decodedRedemptionInput['params'][5]['value'],
		decodedRedemptionInput['params'][6]['value']
	);

	return { tx: tx, liquityArbitrageContract: liquityArbitrageContract };
};

const getGasPriceForTx = async (tx, amountIn, web3) => {
	let gas = await tx
		.estimateGas({ from: ACCOUNT_ADDRESS, value: amountIn.toString() })
		.catch(function (error) {
			console.log('The transaction will fail. Wait for a different opportunity' + error);
		});

	const gasPrice = await web3.eth.getGasPrice();

	return { gas: gas, gasPrice: gasPrice };
};

export default arbitrageStatus;
//exports.arbitrageStatus = arbitrageStatus;
//exports.executeArbitrage = executeArbitrage;
//exports.getFeasibleTrade = getFeasibleTrade;

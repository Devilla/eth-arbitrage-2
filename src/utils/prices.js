const { ADDRESSES } = require('../common/constants.js');
const { TroveManagerABI } = require('../common/abi/troveManagerABI.js');
const { CHAINLINK_ABI } = require('../common/abi/chainlinkABI.js');
const { arbitrageContractABI } = require('../common/abi/arbitrageABI');
const { ChainId, Token, Fetcher, Route, Trade, TradeType, TokenAmount } = require('@uniswap/sdk');
const { EthersLiquity } = require('@liquity/lib-ethers');
const { toWei, fromWei, toBN } = require('web3-utils/src/index.js');
const abiDecoder = require('abi-decoder');
const BN = require('bn.js');

const ETH_NETWORK = ChainId.KOVAN;
const NETWORK = 'KOVAN';
const CHAIN = 'kovan';
const HARDFORK = 'petersburg';
const LUSD = new Token(ETH_NETWORK, ADDRESSES[NETWORK]['LUSD'], 6);
const WETH = new Token(ETH_NETWORK, ADDRESSES[NETWORK]['WETH'], 6);

const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;
const POINT_TWO_ETH = new BN('200000000000000000');
const PART_OF_LIQUIDITY_POOL_TO_USE = new BN(8); // 8th of the liquidity reserve will be used (12.5%)
const UNISWAP_LIQUIDITY_PROVIDER_FEE = 0.003;

abiDecoder.addABI(TroveManagerABI);

const arbitrageStatus = async (provider, web3, wallet) => {
	const liquity = await EthersLiquity.connect(wallet);

	const pair = await Fetcher.fetchPairData(LUSD, WETH, provider);

	const { trade, ethForSwap, populatedRedemption } = await getFeasibleTrade(liquity, pair, wallet);
	const { uniswapPrice, chainLinkPrice, redemptionFee } = await fetchPrices(web3, trade, ethForSwap);

	const priceRatio = uniswapPrice / chainLinkPrice;
	const ethUsed = parseFloat(fromWei(ethForSwap, 'ether'));
	const ethAfterArbitrage = ethUsed * priceRatio * (1 - redemptionFee) * (1 - UNISWAP_LIQUIDITY_PROVIDER_FEE);
	const profit = ethAfterArbitrage - ethUsed;

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
		return {
			status: 0,
			amountIn: ethForSwap,
			populatedRedemption: populatedRedemption,
			profit: profit,
		};
	}
};

const getFeasibleTrade = async (liquity, pair, wallet) => {
	const ethUniswapReserve = toBN(toWei(pair.reserve0.toSignificant(8), 'Mwei')).div(PART_OF_LIQUIDITY_POOL_TO_USE);
	const ethBalanceInWallet = toBN((await wallet.getBalance()).toString());

	let ethTradeAmout;
	if (ethBalanceInWallet.lt(ethUniswapReserve)) {
		ethTradeAmout = ethBalanceInWallet.sub(POINT_TWO_ETH); // To keep some spare eth for gas prices
	} else {
		ethTradeAmout = ethUniswapReserve;
	}

	const route = new Route([pair], WETH);
	let trade = new Trade(route, new TokenAmount(WETH, ethTradeAmout), TradeType.EXACT_INPUT);
	const lusdObtainedFromUni = parseFloat(fromWei(trade.outputAmount.toSignificant(6), 'micro'));

	const populatedRedemption = await liquity.populate
		.redeemLUSD(lusdObtainedFromUni.toString())
		.catch(function (error) {
			console.log('possibly wallet does not contain any LUSD. Keep a standing balance' + error);
		});

	let redeemableLusdAmount = toWei(populatedRedemption.redeemableLUSDAmount.toString(), 'ether');
	// Create new trade based on redeemable LUSD amount. This is because the LUSD amount can change.
	trade = new Trade(route, new TokenAmount(LUSD, redeemableLusdAmount), TradeType.EXACT_OUTPUT);
	ethTradeAmout = toBN(toWei(trade.inputAmount.toFixed(), 'Mwei'));

	return {
		trade: trade,
		ethForSwap: ethTradeAmout,
		populatedRedemption: populatedRedemption,
	};
};

const fetchPrices = async (web3, trade, ethForSwap) => {
	const priceFeed = new web3.eth.Contract(CHAINLINK_ABI, ADDRESSES[NETWORK]['CHAINLINK']);
	const roundData = await priceFeed.methods.latestRoundData().call();
	const chainLinkPrice = roundData['answer'] / 10 ** 8;

	const outputAmount = toBN(toWei(trade.outputAmount.toFixed(), 'Mwei'));

	const troveManager = new web3.eth.Contract(TroveManagerABI, ADDRESSES[NETWORK]['TroveManager']);
	const redemptionFeeInWei = await troveManager.methods.getRedemptionRate().call();

	return {
		uniswapPrice: outputAmount.div(ethForSwap).toNumber(),
		chainLinkPrice: chainLinkPrice,
		redemptionFee: parseFloat(fromWei(redemptionFeeInWei, 'ether')),
	};
};

const executeArbitrage = async (amountIn, populatedRedemption, profit, web3) => {
	const decodedRedemptionInput = abiDecoder.decodeMethod(populatedRedemption.rawPopulatedTransaction.data);
	console.log('\neth in call - ' + amountIn.toString() + '\nContract inputs are -');
	console.log(decodedRedemptionInput);

	const LIQUITY_ARBITRAGE_CONTRACT = new web3.eth.Contract(
		arbitrageContractABI,
		ADDRESSES[NETWORK]['LIQUITY_ARBITRAGE']
	);
	const tx = LIQUITY_ARBITRAGE_CONTRACT.methods.ethToLusdAndBackArbitrage(
		decodedRedemptionInput['params'][0]['value'],
		decodedRedemptionInput['params'][1]['value'],
		decodedRedemptionInput['params'][2]['value'],
		decodedRedemptionInput['params'][3]['value'],
		decodedRedemptionInput['params'][4]['value'],
		decodedRedemptionInput['params'][5]['value'],
		decodedRedemptionInput['params'][6]['value']
	);

	let gas = await tx.estimateGas({ from: ACCOUNT_ADDRESS, value: amountIn.toString() }).catch(function (error) {
		console.log('The transaction will fail. Wait for a different opportunity' + error);
	});
	const gasPrice = await web3.eth.getGasPrice();
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
		to: LIQUITY_ARBITRAGE_CONTRACT.options.address,
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

exports.arbitrageStatus = arbitrageStatus;
exports.executeArbitrage = executeArbitrage;
exports.getFeasibleTrade = getFeasibleTrade;

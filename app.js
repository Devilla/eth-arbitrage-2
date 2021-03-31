require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const store = require('data-store')({ path: process.cwd() + '/localstore.json' });
const { arbitrageStatus, executeArbitrage } = require('./src/utils/prices');
const { Wallet, providers } = require('ethers');

const HTTPS_PROVIDER_URL = process.env.HTTPS_PROVIDER;
const WSS_PROVIDER_URL = process.env.WSS_PROVIDER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const webSocketProvider = new Web3.providers.WebsocketProvider(WSS_PROVIDER_URL);
const webSocketWeb3 = new Web3(webSocketProvider);

const jsonRpcProvider = new providers.JsonRpcProvider(HTTPS_PROVIDER_URL);
const wallet = new Wallet(PRIVATE_KEY).connect(jsonRpcProvider);
const app = express();
const port = 3000;
const ONGOING_STATUS = 'TX_ONGOING';

let subscription;
let status;

app.get('/', async (req, res) => {
	res.send(
		'Start arbitrage server by hitting url: <ip>:3000/subscribe' +
			'<br/>Unsubscribe by hitting url: <ip>:3000/unsubscribe'
	);
});

app.get('/subscribe', async (req, res) => {
	subscription = webSocketWeb3.eth
		.subscribe('newBlockHeaders', function (error, result) {
			if (!error) {
				performArbitrage();
			}
		})
		.on('connected', function (subscriptionId) {
			console.log(subscriptionId);
		})
		.on('error', console.error);
});

app.get('/unsubscribe', async (req, res) => {
	subscription.unsubscribe(function (error, success) {
		if (success) {
			console.log('Successfully unsubscribed!');
		}
	});
});

const performArbitrage = async () => {
	if (!store.get(ONGOING_STATUS)) {
		store.set(ONGOING_STATUS, true);

		status = await arbitrageStatus(jsonRpcProvider, webSocketWeb3, wallet);
		if (status['status'] == 1) {
			await executeArbitrage(status['amountIn'], status['populatedRedemption'], status['profit'], webSocketWeb3);
		}

		store.set(ONGOING_STATUS, false);
	}
};

const init = () => {
	store.set(ONGOING_STATUS, false);
	webSocketWeb3.eth.accounts.wallet.add(PRIVATE_KEY);
};

app.listen(port, () => {
	init();
	console.log(`Arbitrage app listening at http://localhost:${port}`);
});

exports.arbitrageContractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_router",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_lusd",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_troveManager",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ethBalance",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_LUSDAmount",
                "type": "uint256"
            }
        ],
        "name": "CurrentBalance",
        "type": "event"
    },
    {
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "inputs": [],
        "name": "LUSD",
        "outputs": [
            {
                "internalType": "contract ILUSDToken",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountOutMin",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "_firstRedemptionHint",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_upperPartialRedemptionHint",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_lowerPartialRedemptionHint",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_partialRedemptionHintNICR",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxIterations",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_maxFee",
                "type": "uint256"
            }
        ],
        "name": "ethToLusdAndBackArbitrage",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getEthBack",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "troveManager",
        "outputs": [
            {
                "internalType": "contract ITroveManager",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniRouter",
        "outputs": [
            {
                "internalType": "contract IUniswapV2Router02",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];
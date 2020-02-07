var express = require('express');
var router = express.Router();

const Web3 = require('web3'); 
var Tx = require('ethereumjs-tx').Transaction;
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
web3.eth.defaultAccount = web3.eth.accounts[0];


const privateK = Buffer.from('0dadacdd79f7961016973c05fc66edb0df628f08da8c30f74ff0f5452aa04b7c', 'hex')
const pK2 = '0x0dadacdd79f7961016973c05fc66edb0df628f08da8c30f74ff0f5452aa04b7c'
console.log('privateK: ', privateK)
const sender = '0x05037E66a5c362B1c3040848Bcd308098960bAeB'
const receiver = '0x7354372D698b8e2cc4007Dc2cC4475c8690bd015'

const contractAddr = '0x1dbd57b24845b5b7ed2f5db7eee7222303cae1e9'
const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "remaining",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "address",
				"name": "_owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "supply",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "success",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
var gasPrice = 2;
var gasLimit = 300000;
var volume = web3.utils.toBN(10000)


/* GET home page. */
router.get('/', async function(req, res, next) {

  var TestContract = new web3.eth.Contract(abi, contractAddr);
  var data = TestContract.methods.transfer(receiver, volume).encodeABI();
  var rawTx = {
    nonce: '0x02',
    from: sender,
    gasPrice: web3.utils.toHex(gasPrice * 1e9),
    to: contractAddr,
    gasLimit: web3.utils.toHex(gasLimit),
    value: "0x00",
    data: data
  }
  
  var tx = new Tx(rawTx);
  tx.sign(privateK);
  
  var serializedTx = tx.serialize();
  
  web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    .on('receipt', (receipt) => {
      console.log('sent receipt: ', receipt)
      web3.eth.getBalance(contractAddr).then((balance) => {
        console.log('contract balance: ', balance)
      })
    })
  res.render('index', { title: 'Express' });
  
});

module.exports = router;

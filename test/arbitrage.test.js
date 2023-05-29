const arbitrage = artifacts.require('arbitrage')
const truffleAssert = require('truffle-assertions');
var Web3 = require('web3')





require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('arbitrage', function(accounts) {

  let arbitrageinstance

  before(async () => {
    arbitrageinstance = await arbitrage.deployed()
  })

  describe('Arbitrage Deployment', async () => {
    it('Contract has Arbitrage Instance', async () => {

      assert(arbitrageinstance.address != null)

    })
    
  })

  describe('LUSD uniRouter troveManager', async () => {
    
    it('uniRouter exist', async () => {

      const uniRouter = arbitrageinstance.return_uniRouter();
      /**
        uniRouter.then((value) => {
        console.log(uniRouter);  
      });   
      */    
      assert(uniRouter != null);
      
    })

    it('LUSD exist', async () => {

      const lusd = arbitrageinstance.return_lusd();
      /**
        lusd.then((value) => {
        console.log(lusd);  
      });   
      */    
      assert(lusd != null);
      
    })
    it('troveManager exist', async () => {

      const troveManager = arbitrageinstance.return_troveManager();
      /**
        troveManager.then((value) => {
        console.log(troveManager);  
      });   
      */    
      assert(troveManager != null);
      
    })

    describe('ethToLusdAndBackArbitrage Conversion', async () => {
      it('ethToLusdAndBackArbitrage function exist', async () => {
  
       var result = await arbitrageinstance.ethtolusd(
          "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6");

      
          
      //assert(result != null);
  
      })
      
    })

    describe('Event Emit', async () => {
      it('Balance Check', async () => {

    
  
        var tx = await arbitrageinstance.ethToLusdAndBackArbitrage(256,
          "0x76ea225E132609D387464e11ce5EFA1764A3799B",
          "0x76ea225E132609D387464e11ce5EFA1764A3799B",
          "0x76ea225E132609D387464e11ce5EFA1764A3799B",
          256,
          256,
          256);

        const accounts = await web3.eth.getAccounts();
        const result = truffleAssert.eventEmitted(tx, 'CurrentBalance');
        assert(result !== null);

      })
      
    })

    describe('TruffleAssert', async () => {
       
      it('Arbitrage Log', async () => {

        let arbitrageinstancenew = await arbitrage.new(
        '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a', '0x76ea225E132609D387464e11ce5EFA1764A3799B', 
       '0x6412c93AB383B87Af7c5E673fb3a295c8977A3Ed' );
        let result = await truffleAssert.createTransactionResult(arbitrageinstancenew, arbitrageinstancenew.transactionHash);
        // console.log(result);
         assert(result != null);
       })
      
    })
  
  
  })
 
})

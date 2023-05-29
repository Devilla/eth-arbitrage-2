import React, { Component } from 'react'
import BuyForm from './BuyForm'
import BotConfiguration from './BotConfiguration'
//import Prices from './Prices'



//const handleChange= (event) => {
  //process.env.REACT_APP_CLIENT_ID=
  //alert(this.event.value); 

//}



class Main extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentForm: 'buy'
    }

   // this.state = { disabled: false }    
  }

 

  


  render() {
    let content
    if(this.state.currentForm === 'buy') {
      content = <BuyForm
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        buyTokens={this.props.buyTokens}
      />
    } else {
      content = <BotConfiguration
        ethBalance={this.props.ethBalance}
        tokenBalance={this.props.tokenBalance}
        sellTokens={this.props.sellTokens}
      />
    }

    //let content2 = <Prices/>


    return (
      <div id="content" className="mt-3">

        <div className="d-flex justify-content-between mb-3">
          <button type="submit" className="btn btn-primary "
              onClick={(event) => {
                this.setState({ currentForm: 'buy' })
              }}
            >
            GUI for BOT
          </button>
          <span className="text-muted">&lt; &nbsp; &gt;</span>
          <button
              className="btn btn-light"
              onClick={(event) => {
                this.setState({ currentForm: 'sell' })
              }}
            >
            Configure the Bot
          </button>
        </div>

        <div className="card mb-4" >

          <div className="card-body">

            {content}

          </div>

        </div>
        <div className="card mb-4" >

          <div className="card-body">


          </div>

        </div>

      </div>
    );
  }
}

export default Main;

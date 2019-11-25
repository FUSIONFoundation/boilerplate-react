import React from 'react';
import * as Web3 from 'web3';
import * as web3FusionExtend from 'web3-fusion-extend';

let provider = new Web3.providers.WebsocketProvider("wss://testnetpublicgateway1.fusionnetwork.io:10001");
let web3 = new Web3(provider);
web3 = web3FusionExtend.extend(web3);


class Fusion extends React.Component {

    state = {
        output: [],
        web3: false,
        account: undefined,
        usan: undefined
    }

    addOutput(message) {
        let d = new Date();
        let b = this.state.output;
        b.push(`[ ${d.getHours()}:${d.getMinutes()} ] | ${message}`);
        this.setState({output: b})
        this.forceUpdate();
    }

    getAddressByNotation() {
        web3.fsn.getAddressByNotation(parseInt(this.state.usan)).then(function (r) {
            return this.addOutput(`Return address for USAN ${this.state.usan} is ${r}`);
        })
    }

    render() {
        return (
            <div className={'container'}>
                <div className="row">
                    <div className={'col-md-4'}>
                        <h6>Send Asset</h6>
                        <hr/>
                        <form>
                            <div className="form-group">
                                <label>To</label>
                                <input type="text" className="form-control" placeholder="Enter wallet address"/>
                                <small className="form-text text-muted">Enter a wallet address starting with 0x
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input type="text" className="form-control" placeholder="Enter amount"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>
                    <div className={'col-md-4'}>
                        <h6>Create Asset</h6>
                        <hr/>
                        <form>
                            <div className="form-group">
                                <label>To</label>
                                <input type="text" className="form-control" placeholder="Enter wallet address"/>
                                <small className="form-text text-muted">Enter a wallet address starting with 0x
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Amount</label>
                                <input type="text" className="form-control" placeholder="Enter amount"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>
                    <div className={'col-md-4'}>
                        <h6>Get Address By Notation</h6>
                        <hr/>

                        <div className="form-group">
                            <label>Short Account Number</label>
                            <input type="number" className="form-control" onChange={val => {
                                this.setState({usan: parseInt(val.target.value)})
                            }} placeholder="Enter wallet address"/>
                            <small className="form-text text-muted">Enter a USAN</small>
                        </div>
                        <button className="btn btn-primary" onClick={() => {
                            this.getAddressByNotation()
                        }}>Submit
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="jumbotron p-1 mt-2">
                            <small>OUTPUT</small>
                            <hr className="my-1"/>
                            {this.state.output ?
                                this.state.output.reverse().map((val =>
                                        <p className={'text-muted m-0'}>
                                            {val}
                                        </p>
                                ))

                                : ''}
                            <button onClick={() => {
                                this.addOutput('hihi')
                            }}>Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Fusion;

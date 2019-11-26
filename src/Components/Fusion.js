import React from 'react';
import Select from 'react-select'
import * as Web3 from 'web3';
import * as web3FusionExtend from 'web3-fusion-extend';
import * as BN from 'bignumber.js';

let provider = new Web3.providers.WebsocketProvider("wss://testnetpublicgateway1.fusionnetwork.io:10001");
let web3 = new Web3(provider);
web3 = web3FusionExtend.extend(web3);

let _FSNASSETID = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
let _CHAINID = 46688

class Fusion extends React.Component {

    state = {
        output: [],
        web3: false,
        account: undefined,
        usan: undefined,
        sendAssetTo: undefined,
        sendAssetAmount: undefined,
        selectedAssetBalance: undefined,
        createAssetName: undefined,
        createAssetSymbol: undefined,
        createAssetDecimals: undefined,
        createAssetTotalSupply: undefined,
        fsnBalance: '?'

    }

    async setAccount() {
        if (!this.state.privatekey) return
        if (this.state.privatekey.indexOf('0x') === -1) {
            this.setState({privatekey: "0x" + this.state.privatekey});
        }
        let a = web3.eth.accounts.privateKeyToAccount(
            this.state.privatekey
        );
        this.setState({account: a});
        if (a.address) {
            this.userHasFsn(a.address);
        }
        this.addOutput(`Succesfully decrypted wallet. Your address is : ${a.address}`);
        console.log(a.address);
    }

    makeBigNumber (amount, decimals) {
        // Allow .0
        if (amount.substr(0, 1) === ".") {
            let a = "0" + amount;
            amount = a;
        }
        let pieces = amount.split(".");
        let d = parseInt(decimals);
        if (pieces.length === 1) {
            amount = parseInt(amount);
            if (isNaN(amount) || amount < 0) {
                // error message
                return;
            }
            amount = new BN(amount + "0".repeat(parseInt(decimals)));
        } else if (pieces.length > 2) {
            console.log("error");
            // error message
            return;
        } else if (pieces[1].length > d) {
            console.log("error");
            return; // error
        } else {
            let dec = parseInt(pieces[1]);
            let reg = new RegExp("^\\d+$"); // numbers only
            if (isNaN(pieces[1]) || dec < 0 || !reg.test(pieces[1])) {
                console.log("error");
                return;
                // return error
            }
            dec = pieces[1];
            let declen = d - dec.toString().length;
            amount = parseInt(pieces[0]);
            if (isNaN(amount) || amount < 0) {
                console.log("error");
                // error message
                return;
            }
            amount = new BN(amount + dec + "0".repeat(parseInt(declen)));
        }
        return amount;
    };

    addOutput(message) {
        let d = new Date();
        let b = this.state.output;
        b.push(`[ ${d.getHours()}:${d.getMinutes()} ] | ${message}`);
        this.setState({output: b})
    }

    async getAddressByNotation() {
        let addr = await web3.fsn.getAddressByNotation(parseInt(this.state.usan));
        this.addOutput(`Return address for USAN ${this.state.usan} is ${addr}`);
    }

    async userHasFsn(address) {
        let assets = await web3.fsn.allInfoByAddress(address);
        let ids = Object.keys(assets.balances);
        if (ids.includes(_FSNASSETID)) {
            let balance = await this.formatFsnBalance(assets.balances[_FSNASSETID]);
            this.addOutput(`This address has ${balance} FSN.`);
            this.setState({hasFsn: true, fsnBalance: balance})
        }
    }

    async formatFsnBalance(amount) {
        let fsn = await web3.fsn.getAsset(_FSNASSETID);
        let amountBN = new BN(amount.toString());
        let decimalsBN = new BN(this.countDecimals(fsn.Decimals).toString());
        return amountBN.div(decimalsBN).toString();
    }

    async sendAsset() {
        if (!this.state.sendAssetTo || !this.state.sendAssetAmount) return;
        let value = this.makeBigNumber(this.state.sendAssetAmount.toString(),18);
        await web3.fsntx.buildSendAssetTx({
            from: this.state.account.address.toLowerCase(),
            to: this.state.sendAssetTo,
            value: value.toString(),
            asset: _FSNASSETID,
        })
            .then(tx => {
                tx.from = this.state.account.address.toLowerCase();
                tx.chainId = parseInt(_CHAINID);
                return web3.fsn.signAndTransmit(tx, this.state.account.signTransaction)
                    .then(txHash => {
                        this.addOutput(`Transaction Hash : ${txHash}`);
                    });
            });
    }

    async createAsset() {

    }

    countDecimals = function (decimals) {
        let returnDecimals = '1';
        for (let i = 0; i < decimals; i++) {
            returnDecimals += '0';
        }
        return parseInt(returnDecimals);
    }


    render() {
        return (
            <div className={'container'}>
                <div className="row">
                    {!this.state.account ?
                        <div className={'col-3'}>
                            <h6>Decrypt Wallet</h6>
                            <hr/>
                            <div className="form-group">
                                <label>Private Key</label>
                                <input type="text" className="form-control" onChange={val => {
                                    this.setState({privatekey: val.target.value})
                                }}
                                       placeholder="Enter Private Key"/>
                            </div>
                            <button className="btn btn-primary" onClick={() => {
                                this.setAccount()
                            }}>Decrypt
                            </button>
                        </div>
                        : ''}
                </div>

                <div className="row mt-2">
                    <div className={'col-md-4'}>
                        <h6>Send Asset (FUSION)</h6>
                        <hr/>
                        <p>FSN Balance: {this.state.fsnBalance}</p>
                        <div className="form-group">
                            <label>To</label>
                            <input type="text" className="form-control" placeholder="Enter wallet address"
                                   onChange={val => {
                                       this.setState({sendAssetTo: val.target.value})
                                   }}/>
                            <small className="form-text text-muted">Enter a wallet address starting with 0x
                            </small>
                        </div>
                        <div className="form-group">
                            <label>Amount</label>
                            <input type="text" className="form-control" placeholder="Enter amount"
                                   onChange={val => {
                                       this.setState({sendAssetAmount: parseInt(val.target.value)})
                                   }}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={() => {
                            this.sendAsset()
                        }}>Submit
                        </button>
                    </div>
                    <div className={'col-md-4'}>
                        <h6>Create Asset</h6>
                        <hr/>
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
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Fusion;

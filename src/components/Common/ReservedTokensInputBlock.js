import React from 'react'
import Web3 from 'web3'
import '../../assets/stylesheets/application.css';
import InputField from './InputField'
import { RadioInputField } from './RadioInputField'
import { TEXT_FIELDS, VALIDATION_TYPES } from '../../utils/constants'
import ReservedTokensItem from './ReservedTokensItem'
import update from 'immutability-helper'
import { inject, observer } from 'mobx-react';

const { ADDRESS, DIMENSION, VALUE } = TEXT_FIELDS
const {INVALID, VALID} = VALIDATION_TYPES;

@inject('reservedTokenStore', 'reservedTokenInputStore', 'reservedTokenElementStore') @observer
export class ReservedTokensInputBlock extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            validation: {
                address: {
                    valid: INVALID,
                    pristine: true
                }
            }
        }
    }

    updateReservedTokenInput = (event, property) => {
        const value = event.target.value;
        this.props.reservedTokenInputStore.setProperty(property, value);
    }

    addReservedTokensItem = () => {
        if (this.state.validation.address.valid === INVALID) {
            this.setState(update(this.state, {
                validation: {
                    address: {
                        pristine: { $set: false }
                    }
                }
            }))
            return;
        }

        const addr = this.props.reservedTokenInputStore.addr.toString();
        const dim = this.props.reservedTokenInputStore.dim.toString();
        const val = this.props.reservedTokenInputStore.val.toString();

        if (!dim || !val) {
            return
        }

        this.props.reservedTokenInputStore.clearInput();

        let newToken = {
            'addr': addr,
            'dim': dim,
            'val': val
        };

        if (!this.props.reservedTokenStore.findToken(newToken)) {
            this.props.reservedTokenStore.addToken(newToken);
        }
    }

    removeReservedToken = (index) => {
        this.props.reservedTokenStore.removeToken(index);
    }

    handleReservedTokensInputAddrChange = (e) => {
        this.props.onChange(e, 'token', 0, 'reservedtokens_addr')

        const address = e.target.value
        const validAddress = Web3.utils.isAddress(address) ?  VALID : INVALID

        this.setState(update(this.state, {
            validation: {
                address: {
                    $set: {
                        valid: validAddress,
                        pristine: false
                    }
                }
            },
            token: {
                reservedTokensInput: {
                    addr: {
                        $set: address
                    }
                }
            }
        }))
    }

    handleReservedTokensInputDimChange = (e) => {
        this.props.onChange(e, 'token', 0, 'reservedtokens_dim')
        this.setState(update(this.state, {
            token: {
                reservedTokensInput: {
                    dim: {
                        $set: e.target.value
                    }
                }
            }
        }))
    }

    handleReservedTokensInputValChange = (e) => {
        this.props.onChange(e, 'token', 0, 'reservedtokens_val')
        this.setState(update(this.state, {
            token: {
                reservedTokensInput: {
                    val: {
                        $set: e.target.value
                    }
                }
            }
        }))
    }

    render() {
        let { token } = this.state

        const reservedTokensElements = this.props.reservedTokenStore.tokens
            .map((token, index) => {
                return (
                    <ReservedTokensItem
                        key={index.toString()}
                        num={index}
                        addr={token.addr}
                        dim={token.dim}
                        val={token.val}
                        onRemove={(index) => this.removeReservedToken(index)}>
                    </ReservedTokensItem>
                )
            })

        return (
            <div className="reserved-tokens-container">
                <div className="reserved-tokens-input-container">
                    <div className="reserved-tokens-input-container-inner">
                      <InputField
                        side='reserved-tokens-input-property reserved-tokens-input-property-left'
                        type='text'
                        title={ADDRESS}
                        value={this.props.reservedTokenInputStore.addr}
                        pristine={this.state.validation.address.pristine}
                        valid={this.state.validation.address.valid}
                        errorMessage="The inserted address is invalid"
                        onChange={(e) => this.updateReservedTokenInput(e, 'addr')}
                        description={`Address where to send reserved tokens.`}
                      />
                      <RadioInputField
                        side='reserved-tokens-input-property reserved-tokens-input-property-middle'
                        title={DIMENSION}
                        items={["tokens", "percentage"]}
                        vals={["tokens", "percentage"]}
                        defaultValue={this.props.reservedTokenInputStore.dim}
                        name={'reserved-tokens-dim'}
                        onChange={(e) => this.updateReservedTokenInput(e, 'dim')}
                        description={`Fixed amount or % of crowdsaled tokens. Will be deposited to the account after fintalization of the crowdsale. `}
                      />
                      <InputField
                        side='reserved-tokens-input-property reserved-tokens-input-property-right'
                        type='number'
                        title={VALUE}
                        value={this.props.reservedTokenInputStore.val}
                        onChange={(e) => this.updateReservedTokenInput(e, 'val')}
                        description={`Value in tokens or percents. Don't forget to press + button for each reserved token.`}
                      />
                    </div>
                    <div className="plus-button-container">
                        <div onClick={(e) => this.addReservedTokensItem()} className="button button_fill button_fill_plus">
                        </div>
                    </div>
                </div>
                {reservedTokensElements}
            </div>
        )
    }
}

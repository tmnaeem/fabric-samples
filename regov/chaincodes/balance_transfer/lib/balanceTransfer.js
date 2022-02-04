'use strict'

const {Contract} = require('fabric-contract-api');
const accountObjType = "Account";

class BalanceTransfer extends Contract {
    async initAccount(ctx, id, balance){
        const accountBalance = parseFloat(balance);
        if(accountBalance < 0){
            throw new Error('account balance cannot be negative');
        }

        const account = {
            id: id,
            owner: this._getTxCreatorUID(ctx),
            balance: accountBalance
        }

        if(await this._accountExists(ctx, account.id)){
            throw new Error(`the account ${account.id} already exists`);
        }

        await this._putAccount(ctx, account);
    }

    async setBalance(ctx, id, newBalance){
        const accountBalance = parseFloat(newBalance);
        if(accountBalance < 0){
            throw new Error('account balance cannot be negative');
        }

        const account = {
            id: id,
            owner: this._getTxCreatorUID(ctx),
            balance: accountBalance
        }

        if(!(await this._accountExists(ctx, account.id))){
            throw new Error(`the account ${account.id} not exists`);
        }

        await this._putAccount(ctx, account);
    }

    async transfer(ctx, idFrom, idTo, amount){
        const sendAmount = parseFloat(amount);
        if(sendAmount <= 0){
            throw new Error('send amount cannot be negative or zero');
        }
        
        for(const id of [idFrom, idTo]){
            if(!(await this._accountExists(ctx, id))){
                throw new Error(`the account ${id} not exists`);
            } 
        }

        let account1 = await this._getAccount(ctx, idFrom)
        let account2 = await this._getAccount(ctx, idTo)
        
        const newBalance1 = account1.balance - sendAmount
        const newBalance2 = account2.balance + sendAmount

        if(newBalance1< 0){
            throw new Error('leftover amount from withdrawal account cannot be negative');
        }

        account1 = {
            id: idFrom,
            owner: this._getTxCreatorUID(ctx),
            balance: newBalance1
        }

        account2 = {
            id: idTo,
            owner: this._getTxCreatorUID(ctx),
            balance: newBalance2
        }

        await this._putAccount(ctx, account1)
        await this._putAccount(ctx, account2)
    }

    async listAccounts(ctx){
        const queryString = `{"selector": {}}`;
        const iteratorPromise = ctx.stub.getQueryResult(queryString);
        let results = [];
        for await ( const res of iteratorPromise ){
            results.push(JSON.parse(res.value.toString()));
        }

        return JSON.stringify(results);
    }

    async _accountExists(ctx, id){
        const compositekey = ctx.stub.createCompositeKey(accountObjType,[id]);
        const accountBytes = await ctx.stub.getState(compositekey);
        return accountBytes && accountBytes.length > 0;
    }

    async _getAccount(ctx, id){
        const compositekey = ctx.stub.createCompositeKey(accountObjType, [id]);
        const accountBytes = await ctx.stub.getState(compositekey);
        return JSON.parse(accountBytes.toString());
    }

    async getSelectedAccount(ctx, id){
        const compositekey = ctx.stub.createCompositeKey(accountObjType, [id]);
        const accountBytes = await ctx.stub.getState(compositekey);
        return JSON.parse(accountBytes.toString());
    }

    async _putAccount(ctx, account){
        const compositekey = ctx.stub.createCompositeKey(accountObjType, [account.id]);
        await ctx.stub.putState(compositekey, Buffer.from(JSON.stringify(account)))
    }

    async _getTxCreatorUID(ctx){
        return JSON.stringify({
            mspid: ctx.clientIdentity.getMSPID(),
            id: ctx.clientIdentity.getID(),
        })
    }
}

module.exports = BalanceTransfer;
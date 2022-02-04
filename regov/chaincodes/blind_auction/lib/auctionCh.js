'use strict'

const {Contract} = require('fabric-contract-api');

const LotStatus = {
    ForSale: 0,
    Sold:1,
    Withdrawn: 2
}

class BlindAuction extends Contract {
    async offerForSale(ctx, lotId, lotDescription, minimalBid, lotObjType){
        const minBid = parseFloat(minimalBid);
        if(minBid < 0){
            throw new Error('minimum bidding cannot be negative');
        }
        
        const offerLot = {
            lotId: lotId,
            lotDescription: lotDescription,
            minimalBid: minBid,
            status: 0
        }

        if(await this._lotIdExists(ctx, offerLot.lotId, lotObjType)){
            throw new Error(`the lot id ${offerLot.lotId} already exists`);
        }

        const compositekey = ctx.stub.createCompositeKey(lotObjType, [offerLot.lotId]);
        await ctx.stub.putState(compositekey, Buffer.from(JSON.stringify(offerLot)))
    }

    async placeBid(ctx, lotId){
        const lot = await this._getAsset(ctx, lotObjType, lotId);
        if (lot.status !== LotStatus.ForSale){
            throw new Error(`bid cannot be placed for a lot that is not offered for sale`)
        }

        if (lot.seller === ctx.clientIdentity.getMSPID()){
            throw new Error(`bid cannot be placed for your own lot`)
        }

        const transient = ctx.stub.getTransient();

        let price = parseFloat(transient.get('price').toString());

        if(price < lot.minimalBid){
            throw new Error(`price cannot be less then the minimal bid`);
        }

        const bid = {
            id: lot.bid,
            bidder: ctx.clientIdentity.getMSPID(),
            price: price
        }

        const collection = this._composeCollectionName(lot.seller,bid.bidder);
        if (await this._assetExists(ctx, bidObjType, bid.id, collection)) {
            throw new Error(`the bid ${bid.id} already exists`);
        }
        await this._putAsset(ctx, bidObjType, bid, collection);
    }

    async closeBidding(ctx, lotId){
        const lot = await this._getAsset(ctx, lotObjType, lotId);

        let bids = await this._getBidsForLot(ctx, lot);

        if(bids.length === 0){
            lot.status = LotStatus.Withdrawn;
        }else{
            bids.sort((bid1, bid2) => bid2.price - bid1.price);
            const bestBid = bids[0];
            lot.status = LotStatus.Sold;
            lot.buyer = bestBid.bidder;

            lot.hammerPrice = bestBid.price;
        }
        if (lot.status !== LotStatus.ForSale){
            throw new Error(`bid cannot be placed for a lot that is not offered for sale`)
        }

        await this._putAsset(ctx, lotObjType, lot);
    }

    async listBids(ctx, lotId){
        const lot = await this._getAsset(ctx, lotObjType, lotId);
        return await this._getBidsForLot(ctx, lot);
    }

    async listLotsForSale(ctx){
        const queryString = `{"selector": {"status":{$eq:${LotStatus.ForSale}}}}`;
        const iteratorPromise = ctx.stub.getQueryResult(queryString);
        let results = [];
        for await ( const res of iteratorPromise ){
            results.push(JSON.parse(res.value.toString()));
        }

        return JSON.stringify(results);
    }

    async listSoldLots(ctx){
        const queryString = `{"selector": {"status":{$eq:${LotStatus.Sold}}}}`;
        const iteratorPromise = ctx.stub.getQueryResult(queryString);
        let results = [];
        for await ( const res of iteratorPromise ){
            results.push(JSON.parse(res.value.toString()));
        }

        return JSON.stringify(results);
    }

    async listWithdrawnLots(ctx){
        const queryString = `{"selector": {"status":{$eq:${LotStatus.Withdrawn}}}}`;
        const iteratorPromise = ctx.stub.getQueryResult(queryString);
        let results = [];
        for await ( const res of iteratorPromise ){
            results.push(JSON.parse(res.value.toString()));
        }

        return JSON.stringify(results);
    }

    async _composeCollectionName(org1, org2){
        return [org1, org2].sort().join('-');
    }

    async _lotIdExists(ctx, id, lotObjType){
        const compositekey = ctx.stub.createCompositeKey(lotObjType,[id]);
        const lotsBytes = await ctx.stub.getState(compositekey);
        return lotsBytes && lotsBytes.length > 0;
    }

    async _assetExists(ctx, assetObjType, id, collection=''){
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [id]);
        
        let assetBytes;
        collection = collection || '';
        if (collection === '') {
            assetBytes = await ctx.stub.getState(compositeKey);
        } else {
            assetBytes = await ctx.stub.getPrivateData(collection,compositeKey);
        }

        return assetBytes && assetBytes.length > 0;
    }

    async _getAsset(ctx, assetObjType, id, collection=''){
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [id]);
        let assetBytes;
        collection = collection || '';
        if (collection === '') {
            assetBytes = await ctx.stub.getState(compositeKey);
        } else {
            assetBytes = await ctx.stub.getPrivateData(collection,compositeKey);
        }
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`the asset ${assetObjType} with ID ${id} does not exists`);
        }
        return JSON.parse(assetBytes.toString());
    }

    async _putAsset(ctx, assetObjType, asset, collection=''){
        const compositeKey = ctx.stub.createCompositeKey(assetObjType, [id]);
        let assetBytes;
        collection = collection || '';
        if (collection === '') {
            assetBytes = await ctx.stub.getState(compositeKey);
        } else {
            assetBytes = await ctx.stub.getPrivateData(collection,compositeKey);
        }
        if (!assetBytes || assetBytes.length === 0) {
            throw new Error(`the asset ${assetObjType} with ID ${id} does not exists`);
        }
        return JSON.parse(assetBytes.toString());
    }
}
# About
This is tutorial in running custom chaincode

## Shared Steps

- Navigate to test-network ```cd $HOME/go/src/github.com/hyperledger/fabric-samples/test-network```
- Kill any network running ```./network.sh down```
- Start up network and create network```./network.sh up createChannel -s couchdb```
- deploy chaincode to network ```./network.sh deployCC -ccn {type} -ccp ../regov/chaincodes/{type} -ccl javascript```
- Define necessary variables using ```source /home/naeem/go/src/github.com/hyperledger/fabric-samples/regov/chaincodes/{type}.sh```

## later
- Package chaincode into tar ```peer lifestyle chaincode package {type}.tar.gz --lang javascript --path ../regov/chaincodes/{type} --label cp_0```
- Install chaincode ```peer lifecycle chaincode install {type}.tar.gz```
- Get package ID ```peer lifecycle chaincode queryinstalled```
- export package ID ```export PACKAGE_ID={package id from queryinstalled}```


## report generation

- Navigate to test-network ```cd $HOME/go/src/github.com/hyperledger/fabric-samples/test-network```
- Initialize the ledger with assets ```peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n reportGeneration --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"init","Args":[]}'```
- Get Annual Report ```peer chaincode query -C mychannel -n reportGeneration -c '{"Args":["getAnnualReport","2018"]}'```
- Update report ```peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n reportGeneration --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"putRecord","Args":["id9","goods9","99","10/12/2020"]}'```
- custom query ```peer chaincode query -C mychannel -n reportGeneration -c '{"Args":["generateCustomReport", "{\"selector\":{\"price\":{\"$lt\":0}}, \"use_index\":[\"_design/indexPriceDoc\", \"indexPrice\"]}"]}'```

## balance_transfer
- Navigate to test-network ```cd $HOME/go/src/github.com/hyperledger/fabric-samples/test-network```
- Initialize the ledger with assets ```peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n balanceTransfer --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"initAccount","Args":["id1", "13900"]}'```
- list account ```peer chaincode query -C mychannel -n balanceTransfer -c '{"Args":["listAccounts"]}'```
- updating ledger by setting balance ```peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n balanceTransfer --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"setBalance","Args":["id1","900"]}'```
- transferring balance to other id ```peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n balanceTransfer --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"transfer","Args":["id1", "id2", "900"]}'```


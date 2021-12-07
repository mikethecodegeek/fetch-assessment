const path = require('path');
const fs = require('fs');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

const Points = require('../models/points');

describe('addTransaction(transaction)', () => {
    it('it should return an error if no transaction is provided', (done) => {
        const account = new Points();
        account.addTransaction().should.be.eql({error: 'No transaction provided'});
        done();
    });
    it('it should increase points when field is positive', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" })
        account.getTotalPoints().should.be.eql(1000);
        done();
    });
    it('it should decrease points when field is negative', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "DANNON", "points": -500, "timestamp": "2020-11-02T14:00:00Z" })
        account.getTotalPoints().should.be.eql(500);
        done();
    });
    it('it should not let points be negative', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": -500, "timestamp": "2020-11-02T14:00:00Z" })
        account.getTotalPoints().should.be.eql(0);
        done();
    });
    it('it should not remove points if payer doesnt exist', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 500, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "MILLER", "points": -100, "timestamp": "2020-11-02T14:00:00Z" })
        account.getTotalPoints().should.be.eql(500);
        done();
    });
    it('it should keep track of all transactions', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 500, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "MILLER", "points": 100, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "DANNON", "points": -100, "timestamp": "2020-11-02T14:00:00Z" })
        account.getTransactions().should.be.a('array');
        account.getTransactions().length.should.be.eql(3);
        account.getTransactions().should.be.eql([{ "payer": "DANNON", "points": 500, "timestamp": "2020-11-02T14:00:00Z" },{ "payer": "MILLER", "points": 100, "timestamp": "2020-11-02T14:00:00Z" },{ "payer": "DANNON", "points": -100, "timestamp": "2020-11-02T14:00:00Z" }]);
        done();
    });
});

describe('getBalance()', () => {
    it('it should return an empty object if there is no transactions', (done) => {
        const account = new Points();
        account.getBalance().should.be.a('object');
        account.getBalance().should.be.eql({});
        done();
    });
    it('it should return an object containing 1 payer', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" })
        account.getBalance().should.be.a('object');
        account.getBalance().should.be.eql({ "DANNON": 1000 });
        done();
    });
    it('it should return an object containing 3 payers', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" })
        account.addTransaction({ "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" })
        account.addTransaction({ "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" })
        account.addTransaction({ "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" })
        account.getBalance().should.be.a('object');
        account.getBalance().should.be.eql({ "DANNON": 1100, "UNILEVER": 200, "MILLER COORS" : 10000 });
        done();
    });
});

describe('spendPoints(points)', () => {
    it('it should return an error if there is not enough points', (done) => {
        const account = new Points();
        account.spendPoints(1000).should.be.eql({error: 'Not enough points'});
        account.getBalance().should.be.eql({});
        done();
    });
    it('it should spend points if available', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" })
        account.spendPoints(300).should.be.eql([{"payer":"DANNON","points": -300}]);
        done();
    });
    it('it should spend points from multiple payers', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 100, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "MILLER", "points": 300, "timestamp": "2020-11-02T14:00:00Z" })
        account.spendPoints(300).should.be.eql([{"payer":"DANNON","points": -100}, {"payer":"MILLER","points": -200}]);
        done();
    });
    it('it should spend oldest points first', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 100, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "MILLER", "points": 300, "timestamp": "2020-11-02T13:00:00Z" })
        account.spendPoints(300).should.be.eql([{"payer":"MILLER","points": -300}]);
        account.getBalance().should.be.eql({ "DANNON": 100, "MILLER": 0 });
        done();
    });
  
});

describe('spec', () => {
    it('it should return correct values according to spec', (done) => {
        const account = new Points();
        account.addTransaction({ "payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z" })
        account.addTransaction({ "payer": "UNILEVER", "points": 200, "timestamp": "2020-10-31T11:00:00Z" })
        account.addTransaction({ "payer": "DANNON", "points": -200, "timestamp": "2020-10-31T15:00:00Z" })
        account.addTransaction({ "payer": "MILLER COORS", "points": 10000, "timestamp": "2020-11-01T14:00:00Z" })
        account.addTransaction({ "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" })
        account.getBalance().should.be.eql({"DANNON": 1100, "UNILEVER": 200, "MILLER COORS" : 10000 });
        account.spendPoints(5000).should.be.eql(
            [
                { "payer": "DANNON", "points": -100 },
                { "payer": "UNILEVER", "points": -200 },
                { "payer": "MILLER COORS", "points": -4700 }
            ]
            )
        account.getBalance().should.be.eql({ "DANNON": 1000, "UNILEVER": 0, "MILLER COORS": 5300 });
        done();
    });
   
  
});

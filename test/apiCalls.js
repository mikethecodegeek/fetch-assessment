const path = require('path');
const fs = require('fs');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();

chai.use(chaiHttp);

describe('/GET api/balance', () => {
    it('it should return 0 if there is no transactions', (done) => {
      chai.request(server)
          .get('/api/balance')
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.eql(0);
            done();
          });
    });
});

describe('/POST api/transaction', () => {
    it('it should return transaction with valid data', (done) => {
      chai.request(server)
          .post('/api/transaction')
          .send({"payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z"})
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.eql( {"payer": "DANNON", "points": 1000, "timestamp": "2020-11-02T14:00:00Z"})
            done();
          });
    });
    it('it should return an error if missing payer field', (done) => {
      chai.request(server)
          .post('/api/transaction')
          .send({"points": 1000, "timestamp": "2020-11-02T14:00:00Z"})
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.contain.property('error');
                res.body.should.eql( {"error": "payer is required"})
            done();
          });
    });
    it('it should return an error if missing points field', (done) => {
      chai.request(server)
          .post('/api/transaction')
          .send({"payer": "DANNON", "timestamp": "2020-11-02T14:00:00Z"})
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.contain.property('error');
                res.body.should.eql( {"error": "points is required"})
            done();
          });
    });
    it('it should return an error if missing timestamp field', (done) => {
      chai.request(server)
          .post('/api/transaction')
          .send({"payer": "DANNON", "points": 1000})
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.contain.property('error');
                res.body.should.eql( {"error": "timestamp is required"})
            done();
          });
    });
});





module.exports = class Points {
  constructor() {
    this.totalPoints = 0;
    this.transactions = [];
    this.balance = {};
  }

  getTotalPoints() {
    return this.totalPoints;
  }

  addPoints(transaction) {
    if (transaction.points < 0) {
      if (this.balance[transaction.payer] === undefined) {
        return;
      }
      // make sure we don't go below 0
      if (this.totalPoints + transaction.points < 0) {
        transaction.points = this.totalPoints;
      }
    } 

    this.totalPoints += transaction.points;

    // if payer already exists then add points to balance
    // else create new entry in balance
    this.balance[transaction.payer] = this.balance[transaction.payer]
      ? this.balance[transaction.payer] + transaction.points
      : transaction.points;
  }

  createSpendingObject(sortedTransactions) {
    let spendingObject = {};
    sortedTransactions.forEach(transaction => {
      // create a new array if payer does not exist
        if (spendingObject[transaction.payer] === undefined) {
          spendingObject[transaction.payer] = [transaction.points];
        } else {
          // add points to existing array if transaction is positive
          if (transaction.points > 0) {
            spendingObject[transaction.payer].push(transaction.points);
          } else {
            // if transaction is negative we need to remove points from the
            // previous transaction rather than add new one
            let lastTransaction = spendingObject[transaction.payer].length - 1;
            spendingObject[transaction.payer][lastTransaction] += transaction.points;
          }
        }
    });
    return spendingObject;
  }

  spendPoints(points) {
    if (this.totalPoints < points) {
      return { error: "Not enough points" };
    } else {
      // sort the transactions by timestamp so that we can
      // spend points in the correct order
      let sortedTransactions = [...this.transactions].sort((a, b) => {
        return a.timestamp.localeCompare(b.timestamp);
      });

      let spentPoints = [];
      let spentPointsSum = 0;
      let currentSpend = 0;

      // spending object is a map of points in order by date
      let spendingObject = this.createSpendingObject(sortedTransactions);

      while (spentPointsSum < points) {
        let transaction = sortedTransactions.shift();
        if (transaction.points < 0) {
          continue;
        } else if (spentPointsSum + transaction.points <= points) {
          // if transaction is less than or equal to points left
          // add transaction to spent points
          currentSpend = spendingObject[transaction.payer].shift();
        
        } else {
          // if transaction has more points than we need to spend
          // take the difference and add to spent points
          currentSpend = points - spentPointsSum;
        }
          spentPoints.push({
            payer: transaction.payer,
            points: 0 - currentSpend,
          });
          spentPointsSum += currentSpend;
          this.addTransaction({
            payer: transaction.payer,
            points: 0 - currentSpend,
            timestamp: transaction.timestamp,
          });
      }
      return spentPoints;
    }
  }

  getBalance() {
    return this.balance;
  }

  addTransaction(transaction) {
    if (!transaction) {
      return { error: "No transaction provided" };
    }
    this.transactions.push(transaction);
    this.addPoints(transaction);
  }

  getTransactions() {
    return this.transactions;
  }
};

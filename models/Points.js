module.exports = class Points {
    constructor() {
      this.points = 0;
      this.transactions = [];
    }
  
    addPoints(points) {
      this.points += points;
    }
  
    spendPoints(points) {
      if (this.points < points) {
        return false;
      } else {
        let sortedTransactions = [...this.transactions].sort((a, b) => {
          return a.timestamp - b.timestamp;
        });

        let spentPoints = [];
        let spentPointsSum = 0;

        for (let i = 0; i < sortedTransactions.length; i++) {
          if (spentPointsSum === points) {
            break;
          } else if (sortedTransactions[i].points < 0) {
            break;
          }
          else if (spentPointsSum + sortedTransactions[i].points <= points) {
            spentPoints.push({
              payer: sortedTransactions[i].payer,
              points: 0-sortedTransactions[i].points,
              timestamp: sortedTransactions[i].timestamp
            });
            spentPointsSum += sortedTransactions[i].points;
          } else {
            spentPoints.push({
              payer: sortedTransactions[i].payer,
              points: 0 - (points - spentPointsSum),
              timestamp: sortedTransactions[i].timestamp
            });
            spentPointsSum = points
          }
        }
        this.points -= points;
        return spentPoints;
      }
  
    }
  
    getBalance() {
      return this.transactions;
    }
  
    addTransaction(transaction) {
      this.transactions.push(transaction);
      this.addPoints(transaction.points);
    }
  
  }
  
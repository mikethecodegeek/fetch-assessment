const express = require("express");
const router = express.Router();
const Points = require("../models/points");
const account = new Points();

// Return all payer point balances
router.get("/balance", async (req, res, next) => {
  res.json(account.getBalance());
});

// Add Transaction
router.post("/transaction", async (req, res, next) => {
  const { payer, points, timestamp } = req.body;

  if (!payer) {
    res.status(400).json({ error: "payer is required" });
  } else if (!points) {
    res.status(400).json({ error: "points is required" });
  } else if (!timestamp) {
    res.status(400).json({ error: "timestamp is required" });
  } else {
    const transaction = {payer, points, timestamp};
    account.addTransaction(transaction);
    res.json(transaction)
  }
});

// Spend points
router.put("/spend", async (req, res, next) => {
  const { points } = req.body;
  if (!points) {
    res.status(400).json({ error: "points is required" });
  } else {
    const spent = account.spendPoints(points);
    res.status(200).json(spent);
  }
});



module.exports = router;

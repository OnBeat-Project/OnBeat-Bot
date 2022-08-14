const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
  // console.log(req);
  if (req.hostname == "onbeat.me") {
    res.render("index.ejs", {req,res});
  }
});

module.exports = router;

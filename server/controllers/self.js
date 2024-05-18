const express = require('express')

const router = express.Router()

router.get("/", (req, res) => {
    if (req.user) { // from the middleware / session
      res.send(req.user);
    } else {
      res.status(401).end();
    }
  },
);

module.exports = router
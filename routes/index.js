const express = require("express");
const router = express.Router();
const releaseController = require("../controllers/releaseController");

router.get("/", releaseController.homePage);
router.get("/release", releaseController.getLatestRelease);
router.get(
  "/release/download/:assetId",
  releaseController.downloadLatestRelease
);

module.exports = router;

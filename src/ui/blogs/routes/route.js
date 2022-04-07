/* ----------------- This File Sets Up The Routes Used For Server Sent Events On Admin ----------------- */
// Created : 1-5-2021 by Prayag
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const router = require("express-promise-router")();
const SaveController = require("../controllers/SaveData");
const FetchController = require("../controllers/FetchDetails");
/* ------------------------------------------------------------------------------------------------------------------ */


// Get Blogs
// 1-5-2021 Prayag
router
	.route("/getallblogs")
	.get(FetchController.GetAllBlogs);

// Get Selected Blog
// 1-5-2021 Prayag
router
	.route("/getblog")
	.get(FetchController.GetBlog);


module.exports = router;

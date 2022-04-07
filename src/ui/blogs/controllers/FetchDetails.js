/* ----------------- This File Gets Data for Admin ----------------- */
/* ----------------- Created : 1-5-2021 by Prayag ----------------- */
/* -------------------------------------------------- Requirements -------------------------------------------------- */
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
/* ------------------------------------------------------------------------------------------------------------------ */

const BlogSchema = require("../../../models/blog-schema");


module.exports = {
    // Get All Blogs
    // 1-5-2021 Prayag
    GetAllBlogs: async (req, res) => {
        try {
            const AllBlogs = await BlogSchema.aggregate([
                { $sort: { 'created': -1 } },
            ]);
            res.json(AllBlogs);
        } catch (error) {
            console.log(error);
        }
    },

    // Get Selected Blog
    // 1-5-2021 Prayag
    GetBlog: async (req, res) => {
        try {
            const BlogID = req.query.BlogID;
            const SelectedBlog = await BlogSchema.findById(BlogID);
            res.status(200).json(SelectedBlog);
        } catch (error) {
            console.log(error);
        }
    },


};

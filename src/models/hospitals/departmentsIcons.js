const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const departments = new Schema({
	departmentId: Number,
	departmentName: String,
	departmentIconUrl: String,
});

const Departments = mongoose.model(
	"Departments",
	departments,
	"Departments_List"
);

module.exports = Departments;

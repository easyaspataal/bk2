/* ------------------------------------------------------------------------------------------------------------------ */
/*                              This File Checks The Validity Of Details Filled In Forms                              */
/* ------------------------------------------------------------------------------------------------------------------ */

/* -------------------------------------------------- Requirements -------------------------------------------------- */
const Joi = require("joi");

/* ------------------------------------------------------------------------------------------------------------------ */

module.exports = {
	validateBody: (schema) => {
		return (req, res, next) => {
			const result = schema.validate(req.body);
			if (result.error) {
				console.error(result.error);
				const returning_object = {
					Status: 0,
					Error: result.error.details[0].message,
				};
				return res.status(400).json(returning_object);
			}

			if (!req.value) {
				req.value = {};
			}
			req.value["body"] = result.value;
			next();
		};
	},

	schemas: {
		hospitalInfo: Joi.object().keys({
			ea_support_email: Joi.string().required(),
			hosp_name: Joi.string().required(),
			hosp_placeid: Joi.string().required(),
		}),
		hospitalSignin: Joi.object().keys({
			hospitalId: Joi.string().required(),
			password: Joi.string().required(),
		}),
	},
};

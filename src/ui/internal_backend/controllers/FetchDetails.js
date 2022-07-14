/* ----------------- This File Gets Data from internal pg database ----------------- */
/* ----------------- Credentials ----------------- */
const Pool=require("pg").Pool;
const pool=new Pool({
    user:"easy_admin",
    password:"EasyAspatal1212",
    database:"ea_hospital_dashboard",
    host:"easyaspataal-staging-instance-1.cbqgtf1hzzqq.ap-south-1.rds.amazonaws.com",
    port:5432
});



module.exports = {
    // Fetch All Internal Leads
    // 12-4-2021 Sampat
    GetInternalLeads: async (req, res) => {
        try {
            pool.query('SELECT * FROM internal_leads ORDER BY _id ASC', (error, results) => {
                if (error) {
                  throw error
                }
                res.status(200).json(results.rows)
              })
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error
            }
            res.json(result);
            console.log(error);
        }
    },


    // Fetch Single Internal Lead By _id
    // 12-4-2021 Sampat
    GetSingleInternalLead: async (req, res) => {
        try {
        
            const id = parseInt(req.query.id)

            pool.query('SELECT * FROM internal_leads WHERE _id = $1', [id], (error, results) => {
              if (error) {
                throw error
              }
              res.status(200).json(results.rows)
            })
        } catch (error) {
            const result = {
                code: 400,
                status: false,
                message: error
            }
            res.json(result);
            console.log(error);
        }
    },

    

};

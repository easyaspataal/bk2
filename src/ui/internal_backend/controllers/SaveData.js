/* ----------------- This File Saves Internal pg database ----------------- */

/* ----------------- credentials ----------------- */
const Pool=require("pg").Pool;
const pool=new Pool({
    user:"easy_admin",
    password:"EasyAspatal1212",
    database:"ea_hospital_dashboard",
    host:"easyaspataal-staging-instance-1.cbqgtf1hzzqq.ap-south-1.rds.amazonaws.com",
    port:5432
});
/* ----------------- credentials ----------------- */





module.exports = {
 // Save Internal Leads
    // 12-4-2021 Sampat
    SaveInternalLeads: async (req, res) => {
        try {
            const { name, contact, disease, status } = req.body

            pool.query('INSERT INTO internal_leads (name, contact, disease, status) VALUES ($1, $2, $3, $4)', [name, contact, disease, status], (error, results) => {
              if (error) {
                throw error
              }
              pool.query('SELECT * FROM internal_leads ORDER BY created_date DESC LIMIT 1', (error, results) => {
                if (error) {
                  throw error
                }
                res.status(200).json('Lead added with id :'  +  results.rows[0]._id)
              })
            
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

const axios = require('axios');
const dotenv = require('dotenv').config();

const SaveLead = async (userdata) => {
  try {
console.log(userdata)
    axios.post(
      'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=u$rd09db0575dec41f9a0d8cfbbb0d08548&secretKey=ef15aea4ff169b5d29fd15416151d8b469212889',
        userdata, 
        {
            headers: { 
                'Content-Type' : 'text/plain' 
            }
        }
).then(response => {
  console.log(response.data)
});

    // const dt = { data: userdata};
    // const SaveUserArr = await axios.post(process.env.LeadSquare_URL + 'RetrieveLeadByPhoneNumber' + process.env.LeadSquare_Keys, dt);
  } catch (err) {
    console.error(err)
    return false;
  }
}

module.exports = SaveLead;



const axios = require('axios');
const dotenv = require('dotenv').config();

const CheckUser = async (phone) => {
  try {
    const CheckUserArr = await axios.get(process.env.LeadSquare_URL + 'RetrieveLeadByPhoneNumber' + process.env.LeadSquare_Keys + 'phone=' + phone).then(res => res.data);
    return CheckUserArr;
  } catch (err) {
    console.error(err)
    return false;
  }
}

module.exports = CheckUser;



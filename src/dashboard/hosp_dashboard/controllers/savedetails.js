const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

module.exports = {
    SaveOPD: async (req, res) => {
        try {
            const projectId = 'eamigrate';
            const keyFilename = 'src/configuration/private_bucket_keys.json';
            const PrivateBucket = new Storage({ projectId, keyFilename });
    
            fs.writeFile(req.body.name, req.body.data, 'base64', error => {
                if (error) {
                    throw error;
                } else {
                    const bucket = PrivateBucket.bucket('main_pvt');
                    bucket.upload(req.body.name, { destination: "dashboard/billing/opd/" + req.body.name }, function (err, file) {
                        if (err){
                            throw new Error(err);
                        } 
                        fs.unlinkSync(req.body.name);
                    });
                }
            });
            res.json('Success')
        } catch (error) {
            console.log(error);
        }
    },
};

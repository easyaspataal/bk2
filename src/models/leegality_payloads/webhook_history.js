const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const webhook_history_schema = new Schema({
    documentId  : {
        type: String
    },
    irn :{
        type:String
    },
    Signer_Details : {
        type:Object
    },
    Request_Object : {
        type:Object
    },
    Verification_Object : {
        type:Object
    },
    auditTrailURL : {
        type:String
    },
    signedDocumentURL : {
        type: Array
    },
    time : {
        type: Number
    },
    type : {
        type: String,
        enum : ['SUCCESS WEBHOOK','ERROR WEBHOOK']
    }
})
const webhookHistoryModel = mongoose.model("Webhook History",webhook_history_schema,"Webhook_history")
module.exports = webhookHistoryModel;

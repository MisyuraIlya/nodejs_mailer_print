const GmailApi = require('./src/GmailApi')
const axios = require("axios");
const scriptService = require('./src/dal/dbQuery')
const Path = require('path')
const Fs = require('fs')
const Printer = require('pdf-to-printer')
class Script
{
    constructor() {
    }

    fetchUnreadEmailsIds = async () => {
        let data = await GmailApi.fetchUnreadIds()
        return data
    }

    checkIfThereAttachments = async (unreadMessageId) => {
        const response = await axios({method: 'get',url: `http://localhost:8000/api/mail/read/${unreadMessageId}`});
        let data = response.data.payload.parts
        let ids =[]

        data.forEach(element => {
            if(element.body.attachmentId){
                ids.push({
                    mailId:unreadMessageId,
                    attachId:element.body.attachmentId
                })
            }
        });

        if(ids.length > 0){
            return ids 
        } else {
            return false;
        }
    }

    insetIdsToDataBase = async (mailId,attachId) => {
        try{
            let response = await scriptService.insertAttachmentsIds(mailId,attachId)
            if(!response){
                return false
            }
            return true
        } catch (e) {
            console.log(e)
            return false
        }
    }

    downloadPdf = async (email,messageId,attachId) => {
        try {
            const path = Path.resolve(__dirname, './src/pdfs',`invoice_${messageId}.pdf`)
            const response = await axios({
                method: 'get',
                url: `http://localhost:8000/api/mail/reads/${email}/${messageId}/${attachId}`,
                responseType: 'stream',
            })
            response.data.pipe(Fs.createWriteStream(path))

            return new Promise((resolve, reject) => {

            response.data.on('end', () => {
                resolve(`invoice_${messageId}.pdf`)
            })

            response.data.on('error', err => {
                reject(false)
            })
            })
        } catch(e){
            console.log(e)
        }

        
    }

    insertPdfNametoDb = async (emailId,pdfName) => {
        try{
            let response = scriptService.insertPdfName(emailId,pdfName)
            if(!response){
                return false
            }
            return true
        } catch(e) {
            console.log(e)
            return false
        }
    }


    printUnprintedPdfs = async (pdflink) => {
        try {
            let response = await Printer.print(`./src/pdfs/${pdflink}`)
            console.log(response,'end')
            if(response != 'Operating System not supported'){
                return false
            } else {
                return true
            }
        } catch(e) {
            console.log(e)
            return false
        }
    }

    insertSuccessfulPrint = async (emailId) => {
        try{
            let response = scriptService.insertSuccessfulPrint(emailId)
            if(!response){
                return false
            }
            return true
        } catch(e) {
            console.log(e)
            return false
        }
    }

    checkIsPrinted = async (mailId) => {
        try{
            let response = await scriptService.checkIsPrinted(mailId)
            return response
        } catch(e) {
            console.log(e)
            return false
        }
    }


    runScript = async () => {
        let ids = await this.fetchUnreadEmailsIds()
        ids.forEach(async element => {
            let attachmentIds = await this.checkIfThereAttachments(element)
            if(attachmentIds){
                let checks = await this.checkIsPrinted(attachmentIds[0].mailId)
                if(!checks) {
                    let isInserted = await this.insetIdsToDataBase(attachmentIds[0].mailId,attachmentIds[0].attachId)
                    if(isInserted){
                        let downloadPdf = await this.downloadPdf('ilya.mi@digitrade.co.il',attachmentIds[0].mailId,attachmentIds[0].attachId)
                        if(downloadPdf.length > 0){
                            let insertPdftoDb = await this.insertPdfNametoDb(attachmentIds[0].mailId,downloadPdf)
                            if(insertPdftoDb){
                                let printed = await this.printUnprintedPdfs(downloadPdf)
                                if(printed){
                                    let result = await this.insertSuccessfulPrint(attachmentIds[0].mailId,downloadPdf)
                                }
                            }
                        }
                    }
                }
            }
        });
       


    }

}

let script = new Script();
script.runScript();
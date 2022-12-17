const mysql = require('mysql');

class dbQuery {
    constructor(){
        this.con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "root",
            database:"node_printer"
          });
          
          this.con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
          });
    }

    dbQuery = async (sql,params) => {
        return new Promise((resolve, reject) => {
            this.con.query(sql,params, (err, result) => {
            if (err) {
              return reject(err);
            }
            return resolve(result);
          });
        });
    }

    insertAttachmentsIds = async (mailId,attachmentId) => {
        let sql = 'INSERT INTO docs (mail_id,attachment_id) VALUES (?,?)';
        try{
            const result = await this.dbQuery(sql,[mailId,attachmentId])
            return true
        } catch(e){
            console.log(e)
            return false
        }
    }

    insertPdfName = async (mailId,name) => {
        const sql = 'UPDATE docs SET pdf_name = ? where mail_id = ?';
        try {
            const result = await this.dbQuery(sql,[name,mailId])
            return true
        } catch(e) {
            console.log(e)
            return false
        }
    }

    insertSuccessfulPrint = async (mailId) => {
        const sql = 'UPDATE docs SET is_printed = 1 where mail_id = ?';
        try {
            const result = await this.dbQuery(sql,[mailId])
            return true
        } catch(e) {
            console.log(e)
            return false
        }
    }

    checkIsPrinted = async (mailId = 0) => {
        const sql = 'SELECT * FROM docs where mail_id = ?';
        try {
            const result = await this.dbQuery(sql,[mailId])
            console.log(result[0].is_printed)
            if(result[0].is_printed){
                return true
            } else {
                return false
            }
        } catch(e) {
            console.log(e)
            return false
        }
    }
}

module.exports = new dbQuery();
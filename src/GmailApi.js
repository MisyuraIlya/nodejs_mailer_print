const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');



class GmailApi
{
    constructor() {
        this.name = 'Polygon';
        this.SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
        this.TOKEN_PATH = path.join(process.cwd(), 'src/enums/token.json');
        this.CREDENTIALS_PATH = path.join(process.cwd(), 'src/enums/credentials.json');
    }

    loadSavedCredentialsIfExist = async() => {
        try {
          const content = await fs.readFile(this.TOKEN_PATH);
          const credentials = JSON.parse(content);
          return google.auth.fromJSON(credentials);
        } catch (err) {
          return null;
        }
    }

    saveCredentials = async (client) => {
    const content = await fs.readFile(this.CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(this.TOKEN_PATH, payload);
    }

    authorize = async () => {
        let client = await this.loadSavedCredentialsIfExist();
        if (client) {
          return client;
        }
        client = await authenticate({
          scopes: this.SCOPES,
          keyfilePath: this.CREDENTIALS_PATH,
        });
        if (client.credentials) {
          await saveCredentials(client);
        }
        return client;
    }

    listLabels = async (auth) => {
    const gmail = google.gmail({version: 'v1', auth});
    const res = await gmail.users.labels.list({
        userId: 'me',
    });
    const labels = res.data.labels;
    if (!labels || labels.length === 0) {
        console.log('No labels found.');
        return;
    }
    console.log('Labels:');
    labels.forEach((label) => {
        console.log(`- ${label.name}`);
    });
    }

    listMessages = async (auth, query) => {  
        return new Promise((resolve, reject) => {    
          const gmail = google.gmail({version: 'v1', auth});    
          gmail.users.messages.list(      
            {        
              userId: 'me',        
              q: 'label:inbox',      
            },            (err, res) => {        
              if (err) { reject(err);          
                return;        
              }        
              if (!res.data.messages) { resolve([]);          
                return;        
              } 
              resolve(res.data.messages);      
            }    
          );  
        })
    }

    listUnreadMessages = async (auth, query) => {  
        return new Promise((resolve, reject) => {    
          const gmail = google.gmail({version: 'v1', auth});    
          gmail.users.messages.list(      
            {        
              userId: 'me',        
              q: 'label:unread',      
            },            (err, res) => {        
              if (err) { reject(err);          
                return;        
              }        
              if (!res.data.messages) { resolve([]);          
                return;        
              } 
              resolve(res.data.messages);      
            }    
          );  
        })
    }

    fetchUnreadIds = async () => {
        let ids = []
        let data = await this.authorize().then(this.listUnreadMessages).catch(console.error);
        data.map((item, index) => ids.push(item.id))
        return ids;
    }

}


module.exports = new GmailApi;

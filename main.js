'use strict'

const request = require('request');
const fs = require('fs');
const OBJECT = 'obj.json';
const path = require('path')
const { app, ipcMain } = require('electron')
const Window = require('./Window')
const DataStore = require('./DataStore')
const MailStore = require('./mailStore')
const UserStore = require('./userStore')
const http = require('http');
const opn = require('opn');
const { google } = require('googleapis');




require('electron-reload')(__dirname)

// create a new todo store JSON
const todosData = new DataStore({ name: 'Todos Main' });
const mailData = new MailStore({ name: 'Mails Main' });
const userData = new UserStore({ name: 'Users Main' });


const TOKEN_PATH = 'token2.json';
const GMAIL_CLIENT_ID = '9966615901-gi42os2oobnhclrep4qo3nk2d1ng7hmu.apps.googleusercontent.com';
const CLIENT_SECRET = 'y_axlMCVd8tEox7IYnfr0mtL';
const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID, CLIENT_SECRET, 'http://localhost:3000');


function main() {
  // todo list window
  let mainWindow = new Window({
    file: path.join('renderer', 'index.html')
  })
  mainWindow.webContents.openDevTools()
  // add todo window
  let addTodoWin

  // // TODO: put these events into their own file

  // // initialize with todos
  mainWindow.once('show', () => {
    mainWindow.webContents.send('todos', todosData.todos)
  })

  mainWindow.once('show', () => {
    mainWindow.webContents.send('mails', mailData.mails)
  })

  // create add todo window
  ipcMain.on('add-todo-window', () => {
    // if addTodoWin does not already exist
    if (!addTodoWin) {
      // create a new add todo window
      addTodoWin = new Window({
        file: path.join('renderer', 'add.html'),
        width: 400,
        height: 400,
        // close with the main window
        parent: mainWindow
      })

      // cleanup
      addTodoWin.on('closed', () => {
        addTodoWin = null
      })
    }
  })




  function start() {
    var port = process.env.PORT || 3000;
    fs.readFile('./answer.html', function (err, html) {
      if (err) {
        throw err;
      }
      var index = fs.readFileSync('./answer.html');
      http.createServer((request, response) => {
        
        const start = request.url.search('code') + 5
        const end = request.url.search('&')
        const code = request.url.slice(start, end)
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return console.error('Error retrieving access token', err);
          // const meResp = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
          //   method: 'GET',
          //   headers: { Authorization: `Bearer ${access_token}` },
          // });
          // oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          console.log(token.refresh_token)
          userData.addUsers(token.refresh_token)
          
          console.log('this is:' + token.refresh_token)
     
          console.log(tokensArray)
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log('Token stored to', TOKEN_PATH);
          });
          // callback(oAuth2Client);
        });
        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(index);
        response.end();
      }).listen(port);
    })

  }
  ipcMain.on('add-autor', () => {

    opn('https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fmail.google.com%2F%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontacts.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=9966615901-gi42os2oobnhclrep4qo3nk2d1ng7hmu.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000')
    start();
  })

  // add-todo from add todo window
  ipcMain.on('add-todo', (event, todo) => {
    const updatedTodos = todosData.addTodo(todo).todos
    mainWindow.send('todos', updatedTodos)
  })
  // delete-todo from todo list window
  ipcMain.on('delete-todo', (event, todo) => {
    const updatedTodos = todosData.deleteTodo(todo).todos
    mainWindow.send('todos', updatedTodos)
  })

  ipcMain.on('go-to-gmail', () => {
    // fs.readFile('client_secret.json', (err, content) => {
    //   if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Gmail API.
    // authorize(JSON.parse(content), getDraftsId);
    // });
    console.log(mailData.mails)
    console.log(userData.users)
    let newToken = {
      method: 'POST',
      url: 'https://www.googleapis.com/oauth2/v4/token',
      headers: { 'content-type': 'application/json' },
      body: {
        grant_type: 'refresh_token',
        client_id: GMAIL_CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: userData.users[0]
      },
      json: true
    };
    request(newToken, function (error, response, body) {
      if (error) throw new Error(error);
      body.access_token;
      getDraftsId(body.access_token);
    })
  })
  function authorize(credentials, callback) {
    const { client_secret, client_id } = credentials.web;
    let newToken = {
      method: 'POST',
      url: 'https://www.googleapis.com/oauth2/v4/token',
      headers: { 'content-type': 'application/json' },
      body: {
        grant_type: 'refresh_token',
        client_id: client_id,
        client_secret: client_secret,
        refresh_token: '1/KsW2qFZxVNhE64M8HKq6p_29kOUJ3POPDxxpM6zCWdY'
      },
      json: true
    };
    request(newToken, function (error, response, body) {
      if (error) throw new Error(error);
      body.access_token;
      callback(body.access_token);
    })
  }
  function getDraftsId(token) {
    var options = {
      method: 'GET',
      url: 'https://www.googleapis.com/gmail/v1/users/natalia.g@morning.agency/drafts',
      headers: { authorization: 'Bearer ' + token }
    }
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      fs.writeFile(OBJECT, JSON.stringify(response), (err) => {
        if (err) return console.error(err);
      });
      getDrafts(token);
    });
  }
  function getDrafts(token) {
    mailData.cleanMails();
    fs.readFile(OBJECT, (err, data) => {
      if (err) return console.error(err);
      const obj = JSON.parse(data);
      const body = JSON.parse(obj.body);
      const drafts = body.drafts
      for (let i of drafts) {
        var options = {
          method: 'GET',
          url: 'https://www.googleapis.com/gmail/v1/users/natalia.g@morning.agency/drafts/' + i.id,
          headers: { authorization: 'Bearer ' + token }
        }
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          const obj = JSON.stringify(response);
          let a = JSON.parse(obj);
          let b = JSON.parse(a.body);
          let mailSave = { id: b.message.id, message: b.message.snippet }
          mailData.addMail(mailSave);
          if (mailData.mails.length == drafts.length)
            mainWindow.send('mails', mailData.mails);
        });
      }
    });
  }
}


app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})

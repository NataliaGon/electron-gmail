'use strict'

const request = require("request");
const fs = require('fs');
const OBJECT = 'obj.json';
const path = require('path')
const { app, ipcMain } = require('electron')
const Window = require('./Window')
const DataStore = require('./DataStore')
const MailStore = require('./mailStore')

require('electron-reload')(__dirname)

// create a new todo store name "Todos Main" JSON
const todosData = new DataStore({ name: 'Todos Main' });

const mailData = new MailStore({name: 'Mails Main'})

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
    fs.readFile('client_secret.json', (err, content) => {     
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Gmail API.
      authorize(JSON.parse(content),  getDraftsId);
    });
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
        url: 'https://www.googleapis.com/gmail/v1/users/enotzp@gmail.com/drafts',
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
      fs.readFile(OBJECT,  (err, data) => {
        if (err) return console.error(err);
 
        const obj = JSON.parse(data);
        console.log(obj.body);
        
        const body = JSON.parse(obj.body);
        const drafts= body.drafts
        console.log(drafts);
        for ( let i of drafts){
          console.log(i.id);
          var options = {
            method: 'GET',
            url: 'https://www.googleapis.com/gmail/v1/users/enotzp@gmail.com/drafts/'+i.id,
            headers: { authorization: 'Bearer ' + token }
          }
          request(options, function (error, response, body) {
            if (error) throw new Error(error);  
            console.log(response);
            const obj= JSON.stringify(response);
            addGmail(obj);
          });
        }
      });
  
    }
   function addGmail(obj){
    const updatedMails = mailData.addMail(obj).mails;  
    mainWindow.send('mails', updatedMails);
   }
  }


app.on('ready', main)

app.on('window-all-closed', function () {
  app.quit()
})

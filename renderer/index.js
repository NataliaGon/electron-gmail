'use strict'

const { ipcRenderer } = require('electron')

// delete todo by its text value ( used below in event listener)
const deleteTodo = (e) => {
  ipcRenderer.send('delete-todo', e.target.textContent)
}

// create add todo window button
document.getElementById('createTodoBtn').addEventListener('click', () => {
  ipcRenderer.send('add-todo-window')
})
document.getElementById('goToGmail').addEventListener('click', () => {
  ipcRenderer.send('go-to-gmail')
})
document.getElementById('log-in').addEventListener('click', () => {
  event.preventDefault();
  ipcRenderer.send('add-autor')
  // console.log('e');
  // let a = window.location.href;
  // window.addEventListener("hashchange", ()=>alert(window.location.href));
//   window.open('https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile%20https%3A%2F%2Fmail.google.com%2F%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcontacts.readonly%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&response_type=code&client_id=9966615901-gi42os2oobnhclrep4qo3nk2d1ng7hmu.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A3000', "width=200, height=100")

})
// on receive todos
ipcRenderer.on('todos', (event, todos) => {
  // get the todoList ul
  const todoList = document.getElementById('todoList')

  // create html string
  const todoItems = todos.reduce((html, todo) => {
    html += `<li class="todo-item">${todo}</li>`

    return html
  }, '')

  // set list html to the todo items
  todoList.innerHTML = todoItems

  // add click handlers to delete the clicked todo
  todoList.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', deleteTodo)
  })
})



ipcRenderer.on('mails', (event, mails) => {
console.log(mails);
for (let i of mails){
  console.log(i)
}
  const container = document.getElementById('container-emails');
  const mailItems = mails.reduce((htm, mail) => {
    htm += `<li class="email">${mail.message}</li>`
    return htm
  }, '');

  container.innerHTML = mailItems;


})
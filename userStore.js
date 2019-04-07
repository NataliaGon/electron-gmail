'use strict'

const Store = require('electron-store');

class UserStore extends Store {
    constructor(settings) {
        super(settings)

        // initialize with todos or empty array

        this.users = this.get('users') || [] //new
    }
    saveUsers () {
        // save todos to JSON file
        this.set('users', this.users)
    
        // returning 'this' allows method chaining
        return this
      }
    getUsers () {
        // set object's todos to todos in JSON file
        this.users = this.get('users') || []
    
        return this
      }
    addUsers(user) {
        this.users = [...this.users, user]
        return this.saveUsers()
    }
  
}

module.exports = UserStore;
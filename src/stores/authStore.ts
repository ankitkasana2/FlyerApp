import { makeAutoObservable } from 'mobx';

export class AuthStore {
  isAuthenticated: boolean = false;
  user: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  login(username: string, password: string) {
    // Simulate an API call for authentication
    if (username === 'admin' && password === 'password') {
      this.isAuthenticated = true;
      this.user = { username: 'admin' };
      return true;
    }
    return false;
  }

  logout() {
    this.isAuthenticated = false;
    this.user = null;
  }
}

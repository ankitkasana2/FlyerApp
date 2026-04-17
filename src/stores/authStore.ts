import { makeAutoObservable } from 'mobx';

export class AuthStore {
  isAuthenticated: boolean = false;
  user: any = null;

  constructor() {
    makeAutoObservable(this);
  }

  login(username: string, password: string) {
    // Authenticate any user for testing, as requested.
    this.isAuthenticated = true;
    this.user = { username: username || 'Guest' };
    return true;
  }

  logout() {
    this.isAuthenticated = false;
    this.user = null;
  }
}

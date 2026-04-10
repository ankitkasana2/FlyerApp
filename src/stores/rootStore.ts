import UserStore from './userStore';
import { AuthStore } from './authStore';

class RootStore {
  userStore: UserStore;
  authStore: AuthStore;

  constructor() {
    this.userStore = new UserStore();
    this.authStore = new AuthStore();
  }
}

export const rootStore = new RootStore();

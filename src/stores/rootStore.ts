import UserStore from './userStore';
import { AuthStore } from './authStore';
import PostStore from './postStore';
import FlyerStore from './flyerStore';

class RootStore {
  userStore: UserStore;
  authStore: AuthStore;
  postStore: PostStore;
  flyerStore: FlyerStore;

  constructor() {
    this.userStore = new UserStore();
    this.authStore = new AuthStore();
    this.postStore = new PostStore();
    this.flyerStore = new FlyerStore();
  }
}

export const rootStore = new RootStore();
export type RootStoreType = RootStore;

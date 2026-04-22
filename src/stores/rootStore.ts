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
    this.flyerStore = new FlyerStore();
    this.userStore = new UserStore();
    this.postStore = new PostStore();
    // Pass flyerStore so authStore can reset it on logout
    this.authStore = new AuthStore(this.flyerStore);
  }
}

export const rootStore = new RootStore();
export type RootStoreType = RootStore;

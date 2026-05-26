import UserStore from './userStore';
import { AuthStore } from './authStore';
import PostStore from './postStore';
import FlyerStore from './flyerStore';
import CartStore from './cartStore';
import OrderStore from './orderStore';

class RootStore {
  userStore: UserStore;
  authStore: AuthStore;
  postStore: PostStore;
  flyerStore: FlyerStore;
  cartStore: CartStore;
  orderStore: OrderStore;

  constructor() {
    this.flyerStore = new FlyerStore();
    this.cartStore = new CartStore();
    this.userStore = new UserStore();
    this.postStore = new PostStore();
    this.orderStore = new OrderStore();
    // Pass flyerStore and cartStore so authStore can reset them on logout
    this.authStore = new AuthStore(this.flyerStore, this.cartStore);
  }
}

export const rootStore = new RootStore();
export type RootStoreType = RootStore;

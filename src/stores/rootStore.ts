import UserStore from './userStore';
import { AuthStore } from './authStore';
import PostStore from './postStore';
import FlyerStore from './flyerStore';
import CartStore from './cartStore';
import OrderStore from './orderStore';
import NotificationStore from './notificationStore';

class RootStore {
  userStore: UserStore;
  authStore: AuthStore;
  postStore: PostStore;
  flyerStore: FlyerStore;
  cartStore: CartStore;
  orderStore: OrderStore;
  notificationStore: NotificationStore;

  constructor() {
    this.flyerStore = new FlyerStore();
    this.cartStore = new CartStore();
    this.userStore = new UserStore();
    this.postStore = new PostStore();
    this.orderStore = new OrderStore();
    this.notificationStore = new NotificationStore();
    // Pass stores that should be cleared on logout.
    this.authStore = new AuthStore(
      this.flyerStore,
      this.cartStore,
      this.notificationStore,
    );
  }
}

export const rootStore = new RootStore();
export type RootStoreType = RootStore;

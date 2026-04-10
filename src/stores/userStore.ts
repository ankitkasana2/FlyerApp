import { makeAutoObservable, runInAction } from 'mobx';

export interface User {
  id: string;
  name: string;
  email: string;
}

class UserStore {
  user: User | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // 👉 Set user manually (after login)
  setUser(user: User) {
    this.user = user;
  }

  // 👉 Clear user (logout)
  clearUser() {
    this.user = null;
  }

  // 👉 Example API call
  async fetchUser() {
    this.loading = true;
    this.error = null;

    try {
      // dummy API (replace later)
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/users/1',
      );
      const data = await response.json();

      runInAction(() => {
        this.user = {
          id: data.id.toString(),
          name: data.name,
          email: data.email,
        };
        this.loading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }
}

export default UserStore;

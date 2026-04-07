class PostStore {
  posts: Post[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchPosts() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      runInAction(() => {
        this.posts = data;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }
}

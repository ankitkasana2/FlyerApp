import { makeAutoObservable } from 'mobx';

export interface Post {
  id: string;
  title: string;
  body: string;
  userId: string;
}

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
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts?_limit=10',
      );
      const data = await response.json();
      this.posts = data.map((p: any) => ({
        id: String(p.id),
        title: p.title,
        body: p.body,
        userId: String(p.userId),
      }));
    } catch (err: any) {
      this.error = err.message ?? 'Failed to fetch posts';
    } finally {
      this.loading = false;
    }
  }
}

export default PostStore;

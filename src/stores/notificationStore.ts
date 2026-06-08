import { makeAutoObservable, runInAction, computed } from 'mobx';
import * as notificationService from '../services/notificationService';
import { getAccessToken } from '../services/tokenStore';
import type { Notification } from '../types/api';

const DEFAULT_PAGE_SIZE = 20;

class NotificationStore {
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = false;
  isRefreshing = false;
  isLoadingMore = false;
  hasMore = true;
  page = 1;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      unreadNotifications: computed,
      sortedNotifications: computed,
    });
  }

  get unreadNotifications(): Notification[] {
    return this.notifications.filter(n => n.is_read === 0);
  }

  get sortedNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  private mergeNotifications(nextItems: Notification[]) {
    const seen = new Set<number>();
    const merged: Notification[] = [];

    for (const item of [...this.notifications, ...nextItems]) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      merged.push(item);
    }

    return merged;
  }

  fetchNotifications = async (opts: { reset?: boolean } = {}) => {
    if (!getAccessToken()) {
      runInAction(() => {
        this.error = null;
        if (opts.reset) {
          this.notifications = [];
          this.unreadCount = 0;
          this.page = 1;
          this.hasMore = true;
        }
        this.isLoading = false;
        this.isRefreshing = false;
        this.isLoadingMore = false;
      });
      return;
    }

    const { reset = false } = opts;
    const nextPage = reset ? 1 : this.page + 1;

    if (!reset) {
      if (this.isLoadingMore || !this.hasMore) return;
      runInAction(() => {
        this.isLoadingMore = true;
        this.error = null;
      });
    } else {
      runInAction(() => {
        this.error = null;
        if (this.notifications.length > 0) {
          this.isRefreshing = true;
        } else {
          this.isLoading = true;
        }
        this.page = 1;
        this.hasMore = true;
      });
    }

    try {
      const { data } = await notificationService.getNotifications(nextPage, DEFAULT_PAGE_SIZE);
      runInAction(() => {
        const nextNotifications = data.success ? data.notifications : [];
        this.notifications = reset
          ? nextNotifications
          : this.mergeNotifications(nextNotifications);
        this.unreadCount = data.success ? data.unread_count : 0;
        this.page = data.pagination?.page ?? nextPage;
        this.hasMore = data.pagination?.hasMore ?? nextNotifications.length === DEFAULT_PAGE_SIZE;
        this.isLoading = false;
        this.isRefreshing = false;
        this.isLoadingMore = false;
      });
    } catch (err: any) {
      const message = String(err?.message || '');
      runInAction(() => {
        if (/unauthorized/i.test(message) || /401/.test(message)) {
          this.error = null;
          if (opts.reset) {
            this.notifications = [];
            this.unreadCount = 0;
          }
        } else {
          this.error = err.message ?? 'Failed to load notifications';
        }
        this.isLoading = false;
        this.isRefreshing = false;
        this.isLoadingMore = false;
      });
    }
  };

  refreshNotifications = async () => {
    await this.fetchNotifications({ reset: true });
  };

  loadMoreNotifications = async () => {
    if (this.notifications.length === 0 || !this.hasMore || this.isLoadingMore || this.isLoading || this.isRefreshing) {
      return;
    }
    await this.fetchNotifications({ reset: false });
  };

  markRead = async (id: number) => {
    const target = this.notifications.find(n => n.id === id);
    if (!target || target.is_read === 1) return;

    runInAction(() => {
      target.is_read = 1;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
    try {
      await notificationService.markNotificationRead(id);
    } catch {
      runInAction(() => {
        target.is_read = 0;
        this.unreadCount += 1;
      });
    }
  };

  markAllRead = async () => {
    const prevStates = this.notifications.map(n => ({ id: n.id, is_read: n.is_read }));
    runInAction(() => {
      this.notifications.forEach(n => { n.is_read = 1; });
      this.unreadCount = 0;
    });
    try {
      await notificationService.markAllNotificationsRead();
    } catch {
      runInAction(() => {
        prevStates.forEach(({ id, is_read }) => {
          const n = this.notifications.find(x => x.id === id);
          if (n) n.is_read = is_read;
        });
        this.unreadCount = prevStates.filter(x => x.is_read === 0).length;
      });
    }
  };

  reset() {
    this.notifications = [];
    this.unreadCount = 0;
    this.isLoading = false;
    this.isRefreshing = false;
    this.isLoadingMore = false;
    this.hasMore = true;
    this.page = 1;
    this.error = null;
  }
}

export default NotificationStore;

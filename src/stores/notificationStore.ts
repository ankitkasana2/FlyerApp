import { makeAutoObservable, runInAction, computed } from 'mobx';
import * as notificationService from '../services/notificationService';
import type { Notification } from '../types/api';

const AUTO_REFRESH_MS = 30_000;

class NotificationStore {
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = false;
  error: string | null = null;

  private _refreshTimer: ReturnType<typeof setInterval> | null = null;

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
    return [...this.notifications].sort((a, b) => {
      if (a.is_read !== b.is_read) return a.is_read - b.is_read;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  fetchNotifications = async () => {
    runInAction(() => {
      this.isLoading = true;
      this.error = null;
    });
    try {
      const { data } = await notificationService.getNotifications();
      runInAction(() => {
        this.notifications = data.success ? data.notifications : [];
        this.unreadCount = data.success ? data.unread_count : 0;
        this.isLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message ?? 'Failed to load notifications';
        this.isLoading = false;
      });
    }
  };

  startAutoRefresh = () => {
    this.stopAutoRefresh();
    this._refreshTimer = setInterval(() => {
      void this.fetchNotifications();
    }, AUTO_REFRESH_MS);
  };

  stopAutoRefresh = () => {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
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
    this.stopAutoRefresh();
    this.notifications = [];
    this.unreadCount = 0;
    this.isLoading = false;
    this.error = null;
  }
}

export default NotificationStore;

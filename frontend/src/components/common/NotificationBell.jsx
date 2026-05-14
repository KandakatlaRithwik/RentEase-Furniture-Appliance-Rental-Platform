import { useState } from 'react';
import { FiBell, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useNotifications } from '../../hooks/useNotifications';
import { useTheme } from '../../context/ThemeContext';

export default function NotificationBell() {
  const { dark } = useTheme();
  const { notifications, removeNotification, clearAll, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'maintenance':
        return <FiAlertCircle className="text-lg text-accent" />;
      case 'maintenance_status':
      case 'order_status':
        return <FiCheckCircle className="text-lg text-success" />;
      case 'order':
        return <FiBell className="text-lg text-ink-300" />;
      default:
        return <FiBell className="text-lg text-ink-300" />;
    }
  };

  const getNotificationBg = (type) => {
    if (dark) {
      switch (type) {
        case 'maintenance':
          return 'bg-dm-card border-l-4 border-accent';
        case 'maintenance_status':
        case 'order_status':
          return 'bg-dm-card border-l-4 border-success';
        default:
          return 'bg-dm-card';
      }
    }
    switch (type) {
      case 'maintenance':
        return 'bg-accent-light/10 border-l-4 border-accent';
      case 'maintenance_status':
      case 'order_status':
        return 'bg-success-light/10 border-l-4 border-success';
      default:
        return 'bg-ink-50';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition-colors ${
          dark
            ? 'hover:bg-dm-border text-dm-text'
            : 'hover:bg-ink-100 text-ink-700'
        }`}
        title="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {open && (
        <div
          className={`absolute right-0 mt-2 w-96 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col border ${
            dark
              ? 'bg-dm-card border-dm-border'
              : 'bg-white border-ink-100'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b ${dark ? 'border-dm-border' : 'border-ink-100'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${dark ? 'text-dm-text' : 'text-ink-900'}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={clearAll}
                  className={`text-sm ${
                    dark
                      ? 'text-dm-muted hover:text-dm-text'
                      : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className={`p-8 text-center ${dark ? 'text-dm-muted' : 'text-ink-500'}`}>
                <FiBell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-ink-100 dark:divide-dm-border">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors hover:opacity-75 cursor-pointer ${getNotificationBg(
                      notif.type
                    )}`}
                    onClick={async () => {
                      await markAsRead(notif.id);
                      removeNotification(notif.id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm ${
                            dark ? 'text-dm-text' : 'text-ink-900'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            dark ? 'text-dm-muted' : 'text-ink-600'
                          }`}
                        >
                          {notif.message}
                        </p>
                        {notif.data && (
                          <div className={`text-xs mt-2 space-y-1 ${
                            dark ? 'text-dm-muted' : 'text-ink-500'
                          }`}>
                            {notif.data.productName && (
                              <p>
                                <span className="font-medium">Product:</span> {notif.data.productName}
                              </p>
                            )}
                            {notif.data.issue && (
                              <p>
                                <span className="font-medium">Issue:</span> {notif.data.issue}
                              </p>
                            )}
                            {notif.data.priority && (
                              <p>
                                <span className="font-medium">Priority:</span>{' '}
                                <span
                                  className={`px-2 py-0.5 rounded ${
                                    notif.data.priority === 'high'
                                      ? 'bg-danger-light text-danger'
                                      : notif.data.priority === 'medium'
                                      ? 'bg-accent-light text-accent-dark'
                                      : 'bg-success-light text-success'
                                  }`}
                                >
                                  {notif.data.priority}
                                </span>
                              </p>
                            )}
                            {notif.data.userName && (
                              <p>
                                <span className="font-medium">From:</span> {notif.data.userName}
                              </p>
                            )}
                            {notif.data.adminNote && (
                              <p>
                                <span className="font-medium">Note:</span> {notif.data.adminNote}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={async (event) => {
                          event.stopPropagation();
                          await markAsRead(notif.id);
                          removeNotification(notif.id);
                        }}
                        className={`flex-shrink-0 p-1 rounded transition-colors ${
                          dark
                            ? 'hover:bg-dm-border text-dm-muted hover:text-dm-text'
                            : 'hover:bg-ink-100 text-ink-400 hover:text-ink-600'
                        }`}
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}

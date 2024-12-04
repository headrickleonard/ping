import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell, Copy, ChevronDown, ChevronUp, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Sound effects for notifications
const NOTIFICATION_SOUNDS = {
  default: '/sounds/notification.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  warning: '/sounds/warning.mp3',
  info: '/sounds/info.mp3'
};

// Notification Types
const NOTIFICATION_TYPES = {
  SUCCESS: {
    icon: CheckCircle,
    defaultStyle: {
      background: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200'
    },
    defaultPriority: 'NORMAL'
  },
  ERROR: {
    icon: AlertCircle,
    defaultStyle: {
      background: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200'
    },
    defaultPriority: 'HIGH'
  },
  WARNING: {
    icon: AlertCircle,
    defaultStyle: {
      background: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200'
    },
    defaultPriority: 'NORMAL'
  },
  INFO: {
    icon: Info,
    defaultStyle: {
      background: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200'
    },
    defaultPriority: 'LOW'
  }
};

// Priority Levels
const PRIORITY_LEVELS = {
  URGENT: {
    level: 'URGENT',
    duration: 0, // Infinite duration
    sound: true,
    desktop: true
  },
  HIGH: {
    level: 'HIGH',
    duration: 8000,
    sound: true,
    desktop: true
  },
  NORMAL: {
    level: 'NORMAL',
    duration: 5000,
    sound: false,
    desktop: false
  },
  LOW: {
    level: 'LOW',
    duration: 3000,
    sound: false,
    desktop: false
  }
};

// Animation Presets
const ANIMATION_PRESETS = {
  fade: 'animate-fade',
  slide: 'animate-slide',
  bounce: 'animate-bounce',
  shake: 'animate-shake',
  flash: 'animate-flash'
};

// Notification templates
const NOTIFICATION_TEMPLATES = {
  taskComplete: {
    title: 'Task Complete',
    type: 'SUCCESS',
    duration: 4000,
    sound: true,
    desktop: true,
    template: (data) => ({
      message: `Successfully completed task: ${data.taskName}`,
      description: data.description,
      actions: [
        {
          label: 'View Details',
          onClick: data.onView
        }
      ]
    })
  },
  errorWithRetry: {
    title: 'Error Occurred',
    type: 'ERROR',
    duration: 8000,
    sound: true,
    desktop: true,
    priority: 'HIGH',
    template: (data) => ({
      message: `Error: ${data.message}`,
      description: data.details,
      actions: [
        {
          label: 'Retry',
          onClick: data.onRetry
        },
        {
          label: 'Report',
          onClick: data.onReport
        }
      ]
    })
  },
  newMessage: {
    title: 'New Message',
    type: 'INFO',
    duration: 5000,
    sound: true,
    desktop: true,
    category: 'messages',
    template: (data) => ({
      message: `${data.sender}: ${data.preview}`,
      description: `Received at ${new Date().toLocaleTimeString()}`,
      actions: [
        {
          label: 'Reply',
          onClick: data.onReply
        },
        {
          label: 'Mark as Read',
          onClick: data.onMarkRead
        }
      ]
    })
  }
};

// Enhanced Notification Context
const NotificationContext = createContext(null);

// Utility function for notification positioning
const getPositionClasses = (position) => {
  switch (position) {
    case 'top-right':
      return 'top-0 right-0';
    case 'top-left':
      return 'top-0 left-0';
    case 'bottom-right':
      return 'bottom-0 right-0';
    case 'bottom-left':
      return 'bottom-0 left-0';
    case 'top-center':
      return 'top-0 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-0 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-0 right-0';
  }
};

// Enhanced Notification Provider with advanced features
export const NotificationProvider = ({ 
  children, 
  position = 'top-right', 
  maxNotifications = 5,
  defaultDuration = 5000,
  customTypes = {},
  globalStyles = {},
  pauseOnHover = true,
  enableUndo = true,
  allowMarkdown = true
}) => {
  const [notifications, setNotifications] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const notificationQueue = useRef([]);
  const queueTimeoutRef = useRef(null);

  // Merge custom notification types with defaults
  const notificationTypes = useMemo(() => ({
    ...NOTIFICATION_TYPES,
    ...customTypes
  }), [customTypes]);

  // Process queued notifications
  const processQueue = useCallback(() => {
    if (notificationQueue.current.length > 0) {
      const notification = notificationQueue.current.shift();
      setNotifications(prev => [...prev, notification].slice(-maxNotifications));
      queueTimeoutRef.current = setTimeout(processQueue, 100);
    }
  }, [maxNotifications]);

  const addToQueue = useCallback((notification) => {
    notificationQueue.current.push(notification);
    if (!queueTimeoutRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && enableUndo) {
        setUndoStack(stack => [notification, ...stack]);
      }
      return prev.filter(n => n.id !== id);
    });
  }, [enableUndo]);

  const undoLastDismissal = useCallback(() => {
    if (undoStack.length > 0) {
      const [lastDismissed, ...remainingStack] = undoStack;
      setUndoStack(remainingStack);
      const restoredNotification = {
        ...lastDismissed,
        id: Date.now(), // Generate new ID to avoid conflicts
      };
      setNotifications(prev => [...prev, restoredNotification].slice(-maxNotifications));
    }
  }, [maxNotifications]);

  const addNotification = useCallback((
    message,
    type = 'INFO',
    customStyle = {},
    duration = defaultDuration,
    priority = 'NORMAL'
  ) => {
    const id = Date.now();
    const notificationType = notificationTypes[type.toUpperCase()] || notificationTypes.INFO;
    
    const newNotification = {
      id,
      message,
      type: notificationType,
      customStyle,
      duration: duration || defaultDuration,
      priority,
      timestamp: new Date()
    };

    if (notifications.length >= maxNotifications) {
      addToQueue(newNotification);
    } else {
      setNotifications(prev => [...prev, newNotification].slice(-maxNotifications));
    }
  }, [notifications.length, maxNotifications, defaultDuration, addToQueue, notificationTypes]);

  const contextValue = useMemo(() => ({
    addNotification,
    removeNotification,
    undoLastDismissal,
    notifications,
    undoStack
  }), [addNotification, removeNotification, undoLastDismissal, notifications, undoStack]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className={`fixed ${getPositionClasses(position)} z-50 p-4 space-y-2`}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
            pauseOnHover={pauseOnHover}
            allowMarkdown={allowMarkdown}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Enhanced Notification Item with Custom Styling and Auto-dismiss
const NotificationItem = ({ 
  message, 
  type, 
  customStyle, 
  onClose, 
  onToggleExpand, 
  allowMarkdown, 
  pauseOnHover, 
  expanded, 
  count, 
  priority,
  duration = 5000,
  animation,
  image
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(!image);
  const dragStartX = useRef(0);
  const notificationRef = useRef(null);

  // Handle image loading
  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.src = image;
    }
  }, [image]);

  // Touch and mouse event handlers for swipe-to-dismiss
  const handleDragStart = useCallback((clientX) => {
    setIsDragging(true);
    dragStartX.current = clientX;
  }, []);

  const handleDragMove = useCallback((clientX) => {
    if (isDragging) {
      const offset = clientX - dragStartX.current;
      setDragOffset(offset);
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (Math.abs(dragOffset) > 100) {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    } else {
      setDragOffset(0);
    }
    setIsDragging(false);
  }, [dragOffset, onClose]);

  // Auto-dismiss logic
  useEffect(() => {
    let dismissTimeout;
    let exitTimeout;
    let progressTimeout;

    if (duration !== Infinity && !isDragging && imageLoaded) {
      const startTime = Date.now();
      const updateProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingPercent = Math.max(0, 100 - (elapsedTime / duration) * 100);
        setProgress(remainingPercent);

        if (remainingPercent > 0) {
          progressTimeout = setTimeout(updateProgress, 10);
        }
      };

      updateProgress();

      dismissTimeout = setTimeout(() => {
        setIsLeaving(true);
        exitTimeout = setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300);
      }, duration);
    }

    return () => {
      clearTimeout(dismissTimeout);
      clearTimeout(exitTimeout);
      clearTimeout(progressTimeout);
    };
  }, [duration, onClose, isDragging, imageLoaded]);

  // Event handlers
  const handleMouseDown = useCallback((e) => handleDragStart(e.clientX), [handleDragStart]);
  const handleMouseMove = useCallback((e) => handleDragMove(e.clientX), [handleDragMove]);
  const handleMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);
  const handleTouchStart = useCallback((e) => handleDragStart(e.touches[0].clientX), [handleDragStart]);
  const handleTouchMove = useCallback((e) => handleDragMove(e.touches[0].clientX), [handleDragMove]);
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  if (!isVisible) return null;

  const { icon: Icon, defaultStyle } = type;

  // Merge default and custom styles
  const combinedStyles = {
    background: customStyle.background || defaultStyle.background,
    text: customStyle.text || defaultStyle.text,
    border: customStyle.border || defaultStyle.border
  };

  return (
    <div 
      ref={notificationRef}
      className={`
        relative flex items-start p-4 rounded-lg shadow-lg 
        transition-all duration-300 ease-in-out cursor-pointer
        ${combinedStyles.background}
        ${combinedStyles.text}
        ${isLeaving ? 'opacity-0 transform translate-x-full' : 'opacity-100'}
        hover:shadow-xl
        ${animation}
      `}
      style={{
        ...customStyle.containerStyle,
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'all 0.3s ease-in-out'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="alert"
    >
      <div className="flex items-start space-x-3 flex-grow min-w-0">
        <Icon className={`flex-shrink-0 ${expanded ? '' : 'animate-bounce-once'}`} size={24} />
        <div className="flex flex-col overflow-hidden w-full">
          {customStyle.title && (
            <div className="font-bold text-sm truncate">{customStyle.title}</div>
          )}
          {image && (
            <div className="my-2 rounded-lg overflow-hidden max-h-48">
              <img 
                src={image} 
                alt="Notification" 
                className="w-full h-full object-cover"
                onLoad={() => setImageLoaded(true)}
              />
            </div>
          )}
          <div className={`text-sm ${expanded ? '' : 'line-clamp-2'}`}>
            {allowMarkdown ? (
              <ReactMarkdown className="prose prose-sm max-w-none">
                {message}
              </ReactMarkdown>
            ) : (
              message
            )}
          </div>
          {customStyle.description && (
            <div className={`text-xs opacity-75 ${expanded ? '' : 'line-clamp-1'}`}>
              {customStyle.description}
            </div>
          )}
          {count > 1 && (
            <div className="text-xs font-semibold mt-1">
              +{count - 1} similar {count === 2 ? 'notification' : 'notifications'}
            </div>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-2 flex-shrink-0">
        {customStyle.actions?.map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              if (action.dismissOnClick) onClose();
            }}
            className={`text-xs px-2 py-1 rounded ${action.className || 'hover:bg-gray-100'}`}
          >
            {action.label}
          </button>
        ))}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(message);
          }}
          className="hover:bg-gray-100 rounded-full p-1"
          title="Copy to clipboard"
        >
          <Copy size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsLeaving(true);
            setTimeout(onClose, 300);
          }}
          className="hover:bg-gray-100 rounded-full p-1"
        >
          <X size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="hover:bg-gray-100 rounded-full p-1"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {duration !== Infinity && (
        <div 
          className="absolute bottom-0 left-0 h-[2px] bg-current opacity-25"
          style={{
            width: `${progress}%`,
            transition: 'width 10ms linear'
          }}
        />
      )}

      {priority === PRIORITY_LEVELS.URGENT.level && (
        <div className="absolute top-0 right-0 px-2 py-1 text-xs bg-red-500 text-white rounded-bl-lg rounded-tr-lg">
          Urgent
        </div>
      )}
    </div>
  );
};

// Custom hook for using notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export { NOTIFICATION_TYPES, PRIORITY_LEVELS, ANIMATION_PRESETS };
export default NotificationProvider;
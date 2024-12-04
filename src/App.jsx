import React from 'react';
import { NotificationProvider, useNotification } from './pages/Index';

const NotificationDemo = () => {
  const { addNotification, undoLastDismissal } = useNotification();

  const showSuccess = () => {
    addNotification(
      'Operation completed successfully!',
      'SUCCESS',
      {
        title: 'Success',
        description: 'Your action has been processed'
      },
      5000,
      'NORMAL'
    );
  };

  const showMarkdown = () => {
    addNotification(
      '**Bold Text** and *Italic Text*\n\n- List item 1\n- List item 2\n\n[Link Example](https://example.com)',
      'INFO',
      {
        title: 'Markdown Example',
        description: 'This notification uses markdown formatting'
      },
      8000,
      'NORMAL'
    );
  };

  const showImageNotification = () => {
    addNotification(
      'Check out this beautiful image!',
      'INFO',
      {
        title: 'Image Notification',
        description: 'This notification includes an image'
      },
      5000,
      'NORMAL',
      null,
      null,
      'general',
      'slide',
      'https://picsum.photos/400/200' // Random demo image
    );
  };

  const showUrgentNotification = () => {
    addNotification(
      'Critical system update required!',
      'ERROR',
      {
        title: 'Urgent Update',
        description: 'Please take immediate action',
        actions: [
          {
            label: 'Update Now',
            onClick: () => console.log('Update clicked'),
            className: 'bg-red-500 text-white hover:bg-red-600'
          }
        ]
      },
      10000,
      'URGENT'
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Notification Demo</h1>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={showSuccess}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Show Success
          </button>
          <button
            onClick={showMarkdown}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Show Markdown
          </button>
          <button
            onClick={showImageNotification}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Show Image
          </button>
          <button
            onClick={showUrgentNotification}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Show Urgent
          </button>
          <button
            onClick={undoLastDismissal}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Undo Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <NotificationProvider
      position="top-right"
      maxNotifications={5}
      defaultDuration={5000}
      groupSimilar={true}
      pauseOnHover={true}
      enableHistory={true}
      maxHistory={50}
      enableUndo={true}
      allowMarkdown={true}
      soundEnabled={true}
      desktopEnabled={true}
    >
      <NotificationDemo />
    </NotificationProvider>
  );
};

export default App;

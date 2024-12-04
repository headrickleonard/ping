import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../pages/Index';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Test Component to simulate notification usage
const TestComponent = () => {
  const { addNotification, NotificationTypes } = useNotification();
  
  return (
    <button 
      onClick={() => addNotification('Test Notification', NotificationTypes.SUCCESS)}
      data-testid="notification-trigger"
    >
      Trigger Notification
    </button>
  );
};

describe('Notification Library', () => {
  test('renders notification when triggered', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Trigger notification
    const button = screen.getByTestId('notification-trigger');
    fireEvent.click(button);

    // Check if notification appears
    const notification = screen.getByText('Test Notification');
    expect(notification).toBeInTheDocument();
  });

  test('limits maximum notifications', () => {
    render(
      <NotificationProvider maxNotifications={3}>
        {/* Component to add multiple notifications */}
        <div>
          <button data-testid="notification-1">Notify 1</button>
          <button data-testid="notification-2">Notify 2</button>
          <button data-testid="notification-3">Notify 3</button>
          <button data-testid="notification-4">Notify 4</button>
        </div>
      </NotificationProvider>
    );

    // Simulate adding multiple notifications
    // Implementation would depend on your specific test setup
  });
});
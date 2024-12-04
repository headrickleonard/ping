import { describe, test, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../pages/Index';

// Test Component to simulate notification usage
const TestComponent = () => {
  const { addNotification, notificationTypes } = useNotification();
  
  const handleClick = () => {
    console.log('Button clicked');
    console.log('Available notification types:', notificationTypes);
    addNotification('Test Notification', 'SUCCESS');
  };

  return (
    <button 
      onClick={handleClick}
      data-testid="notification-trigger"
    >
      Trigger Notification
    </button>
  );
};

describe('Notification Library', () => {
  test('renders notification when triggered', async () => {
    vi.spyOn(console, 'log');
    
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Trigger notification
    const button = screen.getByTestId('notification-trigger');
    fireEvent.click(button);

    // Debug: Log all available text in the document
    screen.debug();

    // Use a more flexible text matcher
    const notification = screen.getByRole('alert');
    expect(notification).toBeDefined();
    expect(notification.textContent).toContain('Test Notification');
  });

  test('limits maximum notifications', () => {
    const TestMultipleNotifications = () => {
      const { addNotification } = useNotification();
      
      const addNotif = (num) => {
        addNotification(`Notification ${num}`, 'INFO');
      };

      return (
        <div>
          <button onClick={() => addNotif(1)} data-testid="notification-1">Notify 1</button>
          <button onClick={() => addNotif(2)} data-testid="notification-2">Notify 2</button>
          <button onClick={() => addNotif(3)} data-testid="notification-3">Notify 3</button>
          <button onClick={() => addNotif(4)} data-testid="notification-4">Notify 4</button>
        </div>
      );
    };

    render(
      <NotificationProvider maxNotifications={3}>
        <TestMultipleNotifications />
      </NotificationProvider>
    );

    // Trigger all notifications
    fireEvent.click(screen.getByTestId('notification-1'));
    fireEvent.click(screen.getByTestId('notification-2'));
    fireEvent.click(screen.getByTestId('notification-3'));
    fireEvent.click(screen.getByTestId('notification-4'));

    // Check notifications
    expect(screen.queryByText('Notification 1')).toBeNull();
    expect(screen.getByText('Notification 2')).toBeDefined();
    expect(screen.getByText('Notification 3')).toBeDefined();
    expect(screen.getByText('Notification 4')).toBeDefined();
  });
});
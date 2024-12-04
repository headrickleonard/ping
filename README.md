# React-Notifire, a powerful notification library for React applications

A powerful, feature-rich notification system for React applications with advanced customization and interaction capabilities.

## Features

- 🎨 Multiple notification types (SUCCESS, ERROR, WARNING, INFO)
- ⚡ Priority levels (URGENT, HIGH, NORMAL, LOW)
- 🎭 Animation presets (fade, slide, bounce, shake, flash)
- 📝 Markdown support
- 🖼️ Image support
- ↩️ Undo dismiss functionality
- 🎯 Click-to-copy functionality
- 📱 Swipe-to-dismiss support
- ⏸️ Pause on hover
- 🎨 Highly customizable styles
- 🔄 Queue system for smooth notification handling

## Installation

```bash
npm install react-notifire
# or
yarn add react-notifire
```

## Quick Start

```jsx
import { NotificationProvider, useNotification } from 'react-notifire';
import 'react-notifire/dist/index.css';

// Wrap your app with NotificationProvider
function App() {
  return (
    <NotificationProvider>
      <YourComponent />
    </NotificationProvider>
  );
}

// Use notifications in any component
function YourComponent() {
  const { addNotification } = useNotification();

  const showNotification = () => {
    addNotification(
      'Operation successful!',
      'SUCCESS',
      {
        title: 'Success',
        description: 'Your action has been completed'
      }
    );
  };

  return <button onClick={showNotification}>Show Notification</button>;
}
```

## API Reference

### NotificationProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| position | string | 'top-right' | Notification position ('top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center') |
| maxNotifications | number | 5 | Maximum number of notifications shown at once |
| defaultDuration | number | 5000 | Default duration in milliseconds |
| pauseOnHover | boolean | true | Pause notification timer on hover |
| enableUndo | boolean | true | Enable undo dismiss functionality |
| allowMarkdown | boolean | true | Enable markdown support |

### useNotification Hook

```jsx
const { addNotification, removeNotification, undoLastDismissal } = useNotification();
```

#### addNotification Parameters

```jsx
addNotification(
  message: string,
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO',
  customStyle?: {
    title?: string,
    description?: string,
    actions?: Array<{
      label: string,
      onClick: () => void,
      className?: string
    }>
  },
  duration?: number,
  priority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
);
```

## Notification Types

- SUCCESS: Green theme, CheckCircle icon
- ERROR: Red theme, XCircle icon
- WARNING: Yellow theme, AlertTriangle icon
- INFO: Blue theme, Info icon

## Priority Levels

- URGENT: Infinite duration, requires manual dismissal
- HIGH: 8000ms duration
- NORMAL: 5000ms duration
- LOW: 3000ms duration

## Animation Presets

- fade
- slide
- bounce
- shake
- flash

## Advanced Usage

### Custom Styling

```jsx
addNotification(
  'Custom styled notification',
  'INFO',
  {
    title: 'Custom Style',
    description: 'This notification has custom styling',
    background: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  }
);
```

### With Markdown

```jsx
addNotification(
  '**Bold text** and *italic text*\n- List item 1\n- List item 2',
  'INFO',
  {
    title: 'Markdown Support',
    description: 'This notification uses markdown'
  }
);
```

### With Image

```jsx
addNotification(
  'Check out this image!',
  'INFO',
  {
    title: 'Image Example',
    description: 'This notification includes an image'
  },
  5000,
  'NORMAL',
  null,
  null,
  'general',
  'slide',
  'https://example.com/image.jpg'
);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT 

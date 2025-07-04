import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function toast({ title, description, variant = 'default' }: ToastOptions) {
  const message = description ? `${title} — ${description}` : title;

  if (variant === 'destructive') {
    hotToast.error(message, {
      style: {
        border: '1px solid #f87171',
        background: '#fef2f2',
        color: '#991b1b',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fef2f2',
      },
    });
  } else {
    hotToast.success(message);
  }
}

import toast, { Toaster } from 'react-hot-toast';

export { toast, Toaster };

// Custom toast configurations
export const toastConfig = {
    success: (message) =>
        toast.success(message, {
            duration: 3000,
            style: {
                background: '#10B981',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#10B981',
            },
        }),
    error: (message) =>
        toast.error(message, {
            duration: 4000,
            style: {
                background: '#EF4444',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
            },
            iconTheme: {
                primary: '#fff',
                secondary: '#EF4444',
            },
        }),
    custom: (message) =>
        toast(message, {
            duration: 3000,
            style: {
                background: '#1A1A1A',
                color: '#fff',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px',
            },
        }),
};

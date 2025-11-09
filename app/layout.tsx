import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Performance Dashboard',
  description: 'Real-time high-performance visualizations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

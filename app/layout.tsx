/* eslint-disable @next/next/no-img-element */
import { Toaster } from 'sonner';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import Link from 'next/link';
import type { Metadata } from 'next';

import './globals.css';
import { StarButton } from '@/components/star-button';

export const metadata: Metadata = {
  title: '2b2AI',
  description:
    'The AI powered 2b2t player summarizer.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>  
        <div className="fixed right-0 left-0 w-full top-0 bg-white dark:bg-zinc-950">
          <div className="flex justify-between items-center p-4">
            <div className="flex flex-row items-center gap-2 shrink-0 ">
              <span className="jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-2 home-links">
                <Link
                  className="text-zinc-800 dark:text-zinc-100 -translate-y-[.5px]"
                  rel="noopener"
                  target="_blank"
                  href="https://youngfizz.co.uk"
                >
                <img
                          src="https://cdn.discordapp.com/avatars/1229934153454325843/e499ae24601d1fcd6883b05ebc25d535.webp?size=80"
                          alt="2b2AI Avatar"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                </Link>
                <div className="jsx-e3e12cc6f9ad5a71 w-4 text-lg text-center text-zinc-300 dark:text-zinc-600">
                    <svg
                      data-testid="geist-icon"
                      height={16}
                      strokeLinejoin="round"
                      viewBox="0 0 16 16"
                      width={16}
                      style={{ color: 'currentcolor' }}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.01526 15.3939L4.3107 14.7046L10.3107 0.704556L10.6061 0.0151978L11.9849 0.606077L11.6894 1.29544L5.68942 15.2954L5.39398 15.9848L4.01526 15.3939Z"
                        fill="currentColor"
                      />
                    </svg>
                </div>
                <div className="jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-4">
                  <Link className="flex flex-row items-center gap-2" href="/">
                    <div className="jsx-e3e12cc6f9ad5a71 flex flex-row items-center gap-2">
                      <div className="jsx-e3e12cc6f9ad5a71">
                      </div>
                      <div className="jsx-e3e12cc6f9ad5a71 text-lg font-bold text-zinc-800 dark:text-zinc-100">
                        2b2AI
                      </div>
                    </div>
                  </Link>
                </div>
              </span>
            </div>
            <div className="flex flex-row items-center gap-2 shrink-0">
              <StarButton />
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}

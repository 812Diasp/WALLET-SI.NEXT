// components/DemoMenu.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

interface DemoItem {
    link: string;
    text: string;
    image: string;
}

interface DemoMenuProps {
    items: DemoItem[];
    theme: 'light' | 'dark';
}

export const DemoMenu: FC<DemoMenuProps> = ({ items, theme }) => {
    const overlayBg = theme === 'dark' ? 'bg-black-111 bg-opacity-40' : 'bg-white bg-opacity-40';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center ">
            {items.map((item, idx) => (
                <Link
                    key={idx}
                    href={item.link}
                    className="relative block overflow-hidden rounded-lg shadow-lg transform hover:scale-[1.02] transition w-56 h-56 "
                >
                    <Image
                        src={item.image}
                        alt={item.text}
                        fill
                        className="object-cover"
                    />
                    <div className={`absolute inset-0 ${overlayBg} hover:opacity-100 transition-opacity flex items-center justify-center`}>
                        <span className={`text-lg font-semibold ${textColor}`}>{item.text}</span>
                    </div>
                </Link>
            ))}
        </div>
    );
};

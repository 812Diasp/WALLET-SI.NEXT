'use client'
import React from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

export default function Footer() {
    const theme = useSelector((state: RootState) => state.theme.mode);

    const bgClass = theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800';
    const titleColor = theme === 'dark' ? 'text-white' : 'text-black';
    const linkColor = theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
    const dividerColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';

    return (
        <footer className={`${bgClass} pt-8 pb-6 border-t ${borderColor}`}>
            <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {[
                        {
                            title: 'SI.NEXT',
                            content: (
                                <p className="text-md">
                                    Your personal assistant for making informed investment decisions powered by AI.
                                </p>
                            ),
                        },
                        {
                            title: 'Quick Links',
                            content: (
                                <ul className="space-y-2 text-md">
                                    {[
                                        { href: '/', text: 'Home' },
                                        { href: '/pages/about', text: 'About' },
                                        { href: '/pages/wallet', text: 'Wallet' },
                                        { href: '/pages/invest', text: 'Investments' },
                                    ].map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className={`${linkColor} transition duration-200 block`}
                                            >
                                                {link.text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ),
                        },
                        {
                            title: 'Legal',
                            content: (
                                <ul className="space-y-2 text-md">
                                    {[
                                        { href: '/pages/privacy', text: 'Privacy Policy' },
                                        { href: '/pages/terms', text: 'Terms of Use' },
                                        { href: '/pages/cookie', text: 'Cookie Policy' },
                                    ].map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className={`${linkColor} transition duration-200 block`}
                                            >
                                                {link.text}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ),
                        },
                    ].map((section, index) => (
                        <div
                            key={section.title}
                            className={`
                                px-4 py-2
                                ${index !== 0 ? `md:border-l ${dividerColor}` : ''}
                            `}
                        >
                            <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>
                                {section.title}
                            </h3>
                            {section.content}
                        </div>
                    ))}
                </div>

                <hr className={`my-6 ${borderColor}`} />

                <div className="text-center text-sm">
                    <p>{new Date().getFullYear()} Investment Helper AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

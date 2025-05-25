// components/Footer.tsx
import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 pt-8 pb-6">
            <div className="max-w-5xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Investment Helper AI</h3>
                        <p className="text-sm">
                            Your personal assistant for making informed investment decisions powered by AI.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-blue-400 transition duration-200">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400 transition duration-200">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400 transition duration-200">
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-blue-400 transition duration-200">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400 transition duration-200">
                                    Terms of Use
                                </a>
                            </li>
                            <li>
                                <a href="#" className="hover:text-blue-400 transition duration-200">
                                    Disclaimer
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-6 border-gray-700" />

                <div className="text-center text-sm">
                    <p>© {new Date().getFullYear()} Investment Helper AI. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
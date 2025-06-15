import React from 'react';

interface DemoItem {
    link: string;
    text: string;
}

interface DemoMenuProps {
    items: DemoItem[];
    theme: 'light' | 'dark';
}

const DemoMenu: React.FC<DemoMenuProps> = ({ items, theme }) => {
    return (
        <div className={`py-12 px-4 transition-colors duration-300 rounded-2xl ${theme === 'dark' ? 'bg-gray-900 text-white' : ' bg-gray-50 text-gray-800'}`}>
            <div className={`max-w-6xl mx-auto ${theme === 'dark' ? 'bg-gray-900 text-white' : ' bg-gray-50 text-gray-800'}`}>
                <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-500">
                    Выберите раздел
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                        <li key={index} className="group">
                            <a
                                href={item.link}
                                className={`
                  block p-6 rounded-xl shadow-lg border transition-all duration-300 transform 
                  group-hover:-translate-y-2 group-hover:shadow-2xl
                  ${theme === 'dark'
                                    ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                                    : 'bg-white border-gray-200 hover:border-purple-400'
                                }
                  relative overflow-hidden
                `}
                            >
                                {/* Background gradient border effect */}
                                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                                    background: 'linear-gradient(45deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
                                }}></div>

                                {/* Emoji + Title */}
                                <div className="relative z-10 flex items-center space-x-3">
                                    {/* Emoji as icon */}
                                    <span className="text-2xl transition-transform duration-300 group-hover:scale-125">{item.text.split(' ').slice(-1)[0]}</span>
                                    <span className="text-xl font-semibold">{item.text.split(' ').slice(0, -1).join(' ')}</span>
                                </div>

                                {/* Arrow Icon */}
                                <div className="mt-2 ml-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DemoMenu;
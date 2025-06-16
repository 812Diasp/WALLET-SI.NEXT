"use client";

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppSelector } from '@/hooks';

export default function ChatAi() {
    const [input, setInput] = useState('');
    const [chat, setChat] = useState<{ role: string; content: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const theme = useAppSelector((state) => state.theme.mode);

    // Реф для контейнера с сообщениями
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Цвета для темной и светлой темы
    const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    const cardBgColor = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const userMessageBg = theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500';
    const aiMessageBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
    const inputBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
    const buttonBg = theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600';
    const API = 'http://localhost:8000';
    // Функция автоскролла (внутри контейнера)
    const INITIAL_AI_MESSAGE = "I am your investing helper. How can I assist you today?";

    // автоскролл внизу
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    // 1) При маунте: инициализируем session_id
    useEffect(() => {
        (async () => {
            let sid = localStorage.getItem('session_id');

            try {
                if (sid) {
                    // Проверяем существующую сессию
                    const res = await axios.post(`${API}/check-session`, {
                        session_id: sid, message: "",
                    });

                    if (res.data.status === 'ok') {
                        sid = res.data.session_id;
                    } else {
                        sid = res.data.session_id;
                        if (sid != null) {
                            localStorage.setItem('session_id', sid);
                        }
                    }
                } else {
                    // Нет session_id вообще
                    const res = await axios.post(`${API}/session`);
                    sid = res.data.session_id;
                    if (sid != null) {
                        localStorage.setItem('session_id', sid);
                    }
                }

                setSessionId(sid);

                const saved = localStorage.getItem(`chat-${sid}`);
                if (saved) {
                    setChat(JSON.parse(saved));
                } else {
                    setChat([{ role: 'assistant', content: INITIAL_AI_MESSAGE }]);
                }
            } catch (e) {
                console.error('Ошибка при проверке/создании сессии', e);
            }
        })();
    }, []);


    // 2) Сохраняем историю и скроллим
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem(`chat-${sessionId}`, JSON.stringify(chat));
            scrollToBottom();
        }
    }, [chat, sessionId]);

    const handleSend = async () => {
        if (!input.trim() || !sessionId) return;

        const userMsg = { role: 'user', content: input };
        setChat((c) => [...c, userMsg]);
        setInput('');
        setLoading(true);
        setChat((c) => [...c, { role: 'assistant', content: 'loading-dots' }]);

        try {
            const res = await axios.post(
                `${API}/chat`,
                { session_id: sessionId, message: input },
                { timeout: 10000 } // 10 секунд таймаут
            );

            const ai = res.data.response;
            setChat((c) => {
                const copy = [...c];
                copy.pop(); // убрать loading-dots
                copy.push({ role: 'assistant', content: ai });
                return copy;
            });
        } catch (err) {
            console.error('Ошибка или таймаут:', err);

            // Попробуем восстановить сессию
            try {
                const res = await axios.post(`${API}/session`);
                const newSid = res.data.session_id;

                if (newSid) {
                    // Переносим историю
                    localStorage.setItem('session_id', newSid);
                    localStorage.setItem(`chat-${newSid}`, JSON.stringify(chat));

                    setSessionId(newSid);
                    alert('Сессия была восстановлена из-за ошибки или таймаута.');
                }
            } catch (sessionErr) {
                console.error('Не удалось восстановить сессию:', sessionErr);
                alert('Ошибка при восстановлении сессии.');
            }

            // Убираем индикатор
            setChat((c) => {
                const copy = [...c];
                copy.pop();
                return copy;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (
        <>
            {/* Основной контент — чат */}
            <div className={`min-h-screen ${bgColor} ${textColor} pt-6 pb-20 transition-colors duration-300 mt-12 md:mt-25`}>
                <div className={`max-w-3xl mx-auto ${cardBgColor} rounded-xl shadow-lg overflow-hidden transition-colors duration-300`}>
                    <div className={`p-5 border-b ${borderColor}`}>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <span className="text-blue-400">🤖</span> AI chat with Bolvan4ik - financial advisor and helper
                        </h1>
                    </div>

                    {/* Messages Container */}
                    <div
                        ref={chatContainerRef}
                        className={`p-4 space-y-4 max-h-[70vh] overflow-y-auto markdown-chat-output ${theme === 'dark' ? 'markdown-dark' : 'markdown-light'}`}
                        style={{ overflowX: 'hidden' }}
                    >
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 ${
                                    msg.role === 'user' ? 'justify-end' : ''
                                }`}
                            >
                                <div
                                    className={`${
                                        msg.role === 'user'
                                            ? `${userMessageBg} text-white order-2`
                                            : `${aiMessageBg} ${textColor}`
                                    } p-4 rounded-lg max-w-md break-words transition-colors duration-300`}
                                >
                                    <strong className="block mb-1">
                                        {msg.role === 'user' ? 'You' : 'AI'}:
                                    </strong>
                                    {msg.role === 'assistant' ? (
                                        msg.content === 'loading-dots' ? (
                                            <DotsLoader theme={theme} />
                                        ) : (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    table: ({ node, ...props }) => (
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full" {...props} />
                                                        </div>
                                                    ),
                                                    th: ({ node, ...props }) => (
                                                        <th className="px-4 py-2 text-left border" {...props} />
                                                    ),
                                                    td: ({ node, ...props }) => (
                                                        <td className="px-4 py-2 border" {...props} />
                                                    ),
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        )
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Form */}
                    <div className={`p-4 border-t ${borderColor} ${cardBgColor} transition-colors duration-300`}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex gap-3"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Enter your question..."
                                disabled={loading}
                                className={`flex-1 px-4 py-3 ${inputBg} ${textColor} border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-3 ${buttonBg} text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <DotsLoader theme={theme} />
                                        <span>Thinking...</span>
                                    </span>
                                ) : (
                                    'Отправить'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Добавляем стили для markdown в зависимости от темы */}
            <style jsx global>{`
                .markdown-dark {
                    --tw-prose-body: #e5e7eb;
                    --tw-prose-headings: #ffffff;
                    --tw-prose-links: #93c5fd;
                    --tw-prose-bold: #ffffff;
                    --tw-prose-counters: #d1d5db;
                    --tw-prose-bullets: #d1d5db;
                    --tw-prose-quotes: #e5e7eb;
                    --tw-prose-code: #ffffff;
                    --tw-prose-pre-code: #d1d5db;
                    --tw-prose-pre-bg: #1f2937;
                }

                .markdown-light {
                    --tw-prose-body: #1a1a1a; /* Более темный серый для лучшей читаемости */
                    --tw-prose-headings: #111827;
                    --tw-prose-links: #2563eb; /* Более насыщенный синий */
                    --tw-prose-bold: #000000; /* Чистый черный для жирного текста */
                    --tw-prose-counters: #4b5563;
                    --tw-prose-bullets: #4b5563;
                    --tw-prose-quotes: #2d3748;
                    --tw-prose-code: #1a1a1a;
                    --tw-prose-pre-code: #4b5563;
                    --tw-prose-pre-bg: #f8fafc;
                }

                /* Общие стили для текста */
                .markdown-light p,
                .markdown-light li,
                .markdown-light blockquote {
                    color: #272727;
                }

                .markdown-light strong {
                    color: #000000;
                    font-weight: 600;
                }

                /* Стили для таблиц */
                .markdown-chat-output table {
                    display: block;
                    width: 100%;
                    overflow-x: auto;
                    border-collapse: collapse;
                    margin: 1rem 0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .markdown-chat-output th,
                .markdown-chat-output td {
                    padding: 0.75rem 1rem;
                    border: 1px solid;
                    ${theme === 'dark' ?
                `color: #e5e7eb;
       border-color: #4b5563;` :
                `color: #1a1a1a;
       border-color: #e2e8f0;`}
                }

                .markdown-chat-output th {
                    font-weight: 600;
                    ${theme === 'dark' ?
                `background-color: #374151;
       color: #ffffff;` :
                `background-color: #f1f5f9;
       color: #1a1a1a;`}
                }

                /* Темная тема для таблиц */
                .markdown-dark .markdown-chat-output tr:nth-child(odd) {
                    background-color: #1f2937;
                }

                .markdown-dark .markdown-chat-output tr:nth-child(even) {
                    background-color: #374151;
                }

                /* Светлая тема для таблиц */
                .markdown-light .markdown-chat-output tr:nth-child(odd) {
                    background-color: #f8fafc; /* Очень светлый серый */
                }

                .markdown-light .markdown-chat-output tr:nth-child(even) {
                    background-color: #ffffff; /* Чистый белый */
                }

                /* Стили для кода */
                .markdown-light pre {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #1a1a1a;
                }

                .markdown-light code {
                    background-color: #f1f5f9;
                    color: #001d61; /* Красный для кода */
                    padding: 0.2em 0.4em;
                    border-radius: 0.25em;
                }

                /* Общие стили для markdown */
                .markdown-chat-output {
                    max-width: 100%;
                    overflow-wrap: break-word;
                    line-height: 1.6;
                }

                .markdown-chat-output pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    border-radius: 0.5rem;
                    padding: 1rem;
                }

                /* Ссылки */
                .markdown-light a {
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 500;
                }

                .markdown-light a:hover {
                    text-decoration: underline;
                }

                /* Общие стили для Markdown в чате */
                .markdown-chat-output ul,
                .markdown-chat-output ol {
                    list-style-type: disc;
                    padding-left: 1.25rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }

                .markdown-chat-output li {
                    margin-bottom: 0.25rem;
                }

                /* Заголовки */
                .markdown-chat-output h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-top: 1rem;
                    margin-bottom: 0.5rem;
                    ${theme === 'dark' ? 'color: #3b82f6;' : 'color: #1d4ed8;'}
                }

                .markdown-chat-output h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-top: 0.75rem;
                    margin-bottom: 0.5rem;
                    ${theme === 'dark' ? 'color: #60a5fa;' : 'color: #2563eb;'}
                }

                .markdown-chat-output h3 {
                    font-size: 1.125rem;
                    font-weight: 500;
                    margin-top: 0.5rem;
                    margin-bottom: 0.25rem;
                    ${theme === 'dark' ? 'color: #93c5fd;' : 'color: #3b82f6;'}
                }

                /* Текст и параграфы */
                .markdown-chat-output p {
                    margin-bottom: 0.5rem;
                    ${theme === 'dark' ? 'color: #e5e7eb;' : 'color: #1f2937;'}
                    line-height: 1.6;
                }

                /* Ссылки */
                .markdown-chat-output a {
                    ${theme === 'dark' ? 'color: #93c5fd;' : 'color: #2563eb;'}
                    text-decoration: underline;
                }

                .markdown-chat-output a:hover {
                    ${theme === 'dark' ? 'color: #bfdbfe;' : 'color: #1d4ed8;'}
                }

                /* Жирный и курсив */
                .markdown-chat-output strong {
                    font-weight: 600;
                    ${theme === 'dark' ? 'color: #ffffff;' : 'color: #111827;'}
                }

                .markdown-chat-output em {
                    font-weight: 600;
                    font-style: italic;
                    ${theme === 'dark' ? 'color: #93c5fd;' : 'color: #2563eb;'}
                }

                /* Таблицы */
                .markdown-chat-output table {
                    min-width: 100%;
                    ${theme === 'dark' ? 'background-color: #1f2937;' : 'background-color: #ffffff;'}
                    border-collapse: collapse;
                    margin: 1rem 0;
                    ${theme === 'dark' ? 'border: 1px solid #374151;' : 'border: 1px solid #e5e7eb;'}
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    border: 1px solid #dcdcdc;
                }

                .markdown-chat-output th,
                .markdown-chat-output td {
                    padding: 0.75rem 1rem;
                    ${theme === 'dark' ? 'border: 1px solid #374151;' : 'border: 1px solid #e5e7eb;'}
                    text-align: left;
                    ${theme === 'dark' ? 'color: #f3f4f6;' : 'color: #111827;'}
                }

                .markdown-chat-output th {
                    font-weight: 600;
                    ${theme === 'dark' ?
                'background-color: #374151; color: #ffffff;' :
                'background-color: #f3f4f6; color: #111827;'}
                }

                .markdown-chat-output tr:nth-child(even) {
                    ${theme === 'dark' ?
                'background-color: #374151;' :
                'background-color: #f9fafb;'}
                }

                /* Цитаты */
                .markdown-chat-output blockquote {
                    border-left: 4px solid;
                    padding-left: 1rem;
                    font-style: italic;
                    margin: 1rem 0;
                    ${theme === 'dark' ?
                'border-color: #3b82f6; color: #d1d5db;' :
                'border-color: #2563eb; color: #4b5563;'}
                }

                /* Блоки кода */
                .markdown-chat-output pre {
                    ${theme === 'dark' ?
                'background-color: #1f2937;' :
                'background-color: #f3f4f6;'}
                    padding: 0.75rem;
                    border-radius: 0.375rem;
                    overflow-x: auto;
                    font-size: 0.875rem;
                    margin: 1rem 0;
                    ${theme === 'dark' ?
                'border: 1px solid #374151;' :
                'border: 1px solid #e5e7eb;'}
                }

                .markdown-chat-output code {
                    ${theme === 'dark' ?
                'background-color: #374151; color: #93c5fd;' :
                'background-color: #e5e7eb; color: #dc2626;'}
                    padding: 0.2em 0.4em;
                    border-radius: 0.25em;
                    font-family: monospace;
                }
            `}</style>
        </>
    );
}

// Компонент анимации точек с поддержкой темы
function DotsLoader({ theme }: { theme: 'light' | 'dark' }) {
    const dotColor = theme === 'dark' ? 'bg-white' : 'bg-gray-700';

    return (
        <span className="flex items-center h-5">
            <span className={`w-2 h-2 ${dotColor} rounded-full mr-1 animate-bounce`} style={{ animationDelay: '0ms' }}></span>
            <span className={`w-2 h-2 ${dotColor} rounded-full mr-1 animate-bounce`} style={{ animationDelay: '150ms' }}></span>
            <span className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></span>
        </span>
    );
}
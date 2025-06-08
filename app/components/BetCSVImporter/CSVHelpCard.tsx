'use client';

interface CSVHelpCardProps {
    theme?: 'dark' | 'light';
}

export default function CSVHelpCard({ theme = 'light' }: CSVHelpCardProps) {
    const cardBg = theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200';
    const codeBg = theme === 'dark' ? 'bg-gray-900 text-green-400' : 'bg-gray-100 text-green-700';

    return (
        <div className={`mt-6 p-4 rounded-xl shadow border ${cardBg}`}>
            <h3 className="text-lg font-semibold mb-2">📄 Инструкция по импорту CSV</h3>
            <p className="text-sm mb-3">
                Для импорта ставок используйте CSV-файл с разделителями-запятыми. Файл должен содержать заголовки:
                <code className={`px-2 py-1 ml-1 rounded ${codeBg}`}>stake</code> ,
                <code className={`px-2 py-1 ml-1 rounded ${codeBg}`}>odds</code> ,
                <code className={`px-2 py-1 ml-1 rounded ${codeBg}`}>result</code>
            </p>
            <p className="text-sm mb-3">
                Допустимые значения для <code className={`px-2 py-1 ml-1 ${codeBg} rounded`}>result</code> : <strong>win</strong> или <strong>lose</strong>.
            </p>
            <div className="text-sm">
                <p className="mb-1 font-semibold">Пример содержимого файла:</p>
                <pre className={`p-3 rounded overflow-auto text-sm font-mono ${codeBg}`}>
stake,odds,result<br/>
100,2.5,win<br/>
50,1.8,lose<br/>
75,3.2,win<br/>
        </pre>
            </div>
        </div>
    );
}

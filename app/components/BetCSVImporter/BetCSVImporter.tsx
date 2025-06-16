'use client';

import { useRef, useState } from 'react';
import Papa from 'papaparse';

interface BetEntry {
    stake: number;
    odds: number;
    result: 'win' | 'lose';
}

interface BetCSVImporterProps {
    onImport: (entries: BetEntry[]) => void;
    theme?: 'dark' | 'light';
}

// @ts-ignore
// @ts-ignore
export default function BetCSVImporter({ onImport, theme = 'light' }: BetCSVImporterProps) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [importError, setImportError] = useState<string>('');

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function (results:any) {
                const imported: BetEntry[] = [];
                const errors: string[] = [];

                (results.data as any[]).forEach((row, idx) => {
                    const stake = parseFloat((row.stake || '').toString().replace(',', '.'));
                    const odds = parseFloat((row.odds || '').toString().replace(',', '.'));
                    const result = (row.result || '').toString().toLowerCase();

                    if (isNaN(stake) || isNaN(odds) || !(result === 'win' || result === 'lose')) {
                        errors.push(`Ошибка в строке ${idx + 2}`);
                        return;
                    }

                    imported.push({ stake, odds, result: result as 'win' | 'lose' });
                });

                if (errors.length > 0) {
                    setImportError(errors.join(', '));
                } else {
                    setImportError('');
                    onImport(imported);
                }
            },
            error: (err:any) => {
                setImportError('Ошибка чтения CSV: ' + err.message);
            }
        });

        e.target.value = '';
    };

    const buttonClass = theme === 'dark'
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-green-700 hover:bg-green-600 text-white';

    return (
        <div className="mt-4">
            <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2 rounded ${buttonClass} `}
            >
                Импорт из CSV
            </button>
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleImportCSV}
                className="hidden"
            />
            {importError && (
                <div className="text-red-500 text-sm mt-2">{importError}</div>
            )}
        </div>
    );
}

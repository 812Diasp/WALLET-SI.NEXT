export const API_URL = 'http://localhost:5095/api'; // порт из launchSettings.json

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
interface Transaction {
    id: string;
    type: 'expense' | 'income';
    category: string;
    amount: number;
    date: string;
}

interface Loan {
    id: string;
    name: string;
    principal: number;
    interestRate: number; // годовая %
    termYears: number;
    startDate: string;
}
export const auth = {
    register: async (username: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    },
    login: async (username: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    }
};

export const wallet = {
    get: async () => {
        const res = await fetch(`${API_URL}/wallet/me`, {
            headers: getAuthHeaders()
        });
        return await res.json();
    },
    addTransaction: async (tx: Omit<Transaction, 'id'>) => {
        const res = await fetch(`${API_URL}/wallet/transaction`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...tx, id: crypto.randomUUID() })
        });
        return await res.json();
    },
    addLoan: async (loan: Omit<Loan, 'id'>) => {
        const res = await fetch(`${API_URL}/wallet/loan`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ...loan, id: crypto.randomUUID() })
        });
        return await res.json();
    }
};
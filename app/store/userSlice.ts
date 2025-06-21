// userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = {
    user: null | { email: string };
    token: string | null;
    userId: string | null;
    walletId: string | null;
    isLoading: boolean;
    error: string | null;
};

const initialState: UserState = {
    user: null,
    token: null,
    userId: null,
    walletId: null,
    isLoading: false,
    error: null,
};
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<{ email: string }>) => {
            state.user = action.payload;
            state.error = null;
        },
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        setWalletId: (state, action: PayloadAction<string>) => {
            state.walletId = action.payload;
        },
        setToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload;
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('authToken');
        },
    },
});

export const { setUser, setToken, setLoading, setError, logout, setUserId,setWalletId} = userSlice.actions;
export default userSlice.reducer;
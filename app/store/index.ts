
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import userReducer from './userSlice';
export const store = configureStore({
    reducer: {
        theme: themeReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat()
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>
export default store;
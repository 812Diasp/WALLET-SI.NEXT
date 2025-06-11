// Import necessary hooks and types from React Redux
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './app/store/index';

// Custom hook for dispatching actions with proper typing
// This provides type safety when dispatching actions
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for selecting state with proper typing
// This ensures type safety when accessing state properties
// The TypedUseSelectorHook ensures that the selector function
// receives the correct RootState type and returns the proper type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
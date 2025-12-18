import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import type { PersistPartial } from 'redux-persist/lib/persistReducer'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'] // Only persist auth state
}

const rootReducer = combineReducers({
    auth: authReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
})

export const persistor = persistStore(store)

type RootStateBase = {
  auth: ReturnType<typeof authReducer>
}

export type RootState = RootStateBase & PersistPartial
export type AppDispatch = typeof store.dispatch

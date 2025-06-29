'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Client } from '@/types/client';
import { Worker } from '@/types/worker';
import { Task } from '@/types/task';

interface DataState {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'SET_WORKERS'; payload: Worker[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'UPDATE_WORKER'; payload: Worker }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'ADD_WORKER'; payload: Worker }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'DELETE_WORKER'; payload: string }
  | { type: 'DELETE_TASK'; payload: string };

const initialState: DataState = {
  clients: [],
  workers: [],
  tasks: [],
  isLoading: false,
  error: null,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'SET_WORKERS':
      return { ...state, workers: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.ClientID === action.payload.ClientID ? action.payload : client
        ),
      };
    case 'UPDATE_WORKER':
      return {
        ...state,
        workers: state.workers.map(worker =>
          worker.WorkerID === action.payload.WorkerID ? action.payload : worker
        ),
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.TaskID === action.payload.TaskID ? action.payload : task
        ),
      };
    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] };
    case 'ADD_WORKER':
      return { ...state, workers: [...state.workers, action.payload] };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.ClientID !== action.payload),
      };
    case 'DELETE_WORKER':
      return {
        ...state,
        workers: state.workers.filter(worker => worker.WorkerID !== action.payload),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.TaskID !== action.payload),
      };
    default:
      return state;
  }
}

interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  setClients: (clients: Client[]) => void;
  setWorkers: (workers: Worker[]) => void;
  setTasks: (tasks: Task[]) => void;
  updateClient: (client: Client) => void;
  updateWorker: (worker: Worker) => void;
  updateTask: (task: Task) => void;
  addClient: (client: Client) => void;
  addWorker: (worker: Worker) => void;
  addTask: (task: Task) => void;
  deleteClient: (clientId: string) => void;
  deleteWorker: (workerId: string) => void;
  deleteTask: (taskId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const setClients = (clients: Client[]) => {
    dispatch({ type: 'SET_CLIENTS', payload: clients });
  };

  const setWorkers = (workers: Worker[]) => {
    dispatch({ type: 'SET_WORKERS', payload: workers });
  };

  const setTasks = (tasks: Task[]) => {
    dispatch({ type: 'SET_TASKS', payload: tasks });
  };

  const updateClient = (client: Client) => {
    dispatch({ type: 'UPDATE_CLIENT', payload: client });
  };

  const updateWorker = (worker: Worker) => {
    dispatch({ type: 'UPDATE_WORKER', payload: worker });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const addClient = (client: Client) => {
    dispatch({ type: 'ADD_CLIENT', payload: client });
  };

  const addWorker = (worker: Worker) => {
    dispatch({ type: 'ADD_WORKER', payload: worker });
  };

  const addTask = (task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const deleteClient = (clientId: string) => {
    dispatch({ type: 'DELETE_CLIENT', payload: clientId });
  };

  const deleteWorker = (workerId: string) => {
    dispatch({ type: 'DELETE_WORKER', payload: workerId });
  };

  const deleteTask = (taskId: string) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId });
  };

  const value: DataContextType = {
    state,
    dispatch,
    setClients,
    setWorkers,
    setTasks,
    updateClient,
    updateWorker,
    updateTask,
    addClient,
    addWorker,
    addTask,
    deleteClient,
    deleteWorker,
    deleteTask,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 
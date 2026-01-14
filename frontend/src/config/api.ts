// API Configuration
// In development, use empty string to leverage Vite proxy
// In production, use the full API URL
const isDevelopment = import.meta.env.DEV;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (isDevelopment ? '' : "https://leavemangement-1.onrender.com/api");

// Set axios default base URL
import axios from 'axios';
axios.defaults.baseURL = "https://leavemangement-1.onrender.com/";

import apiClient from './apiConfig';
import axios from 'axios';

// Types
export interface Document {
  id: string;
  title: string;
  content: string;
  documentType: string; // Can be 'BloodType' or 'ComponentType'
  createdDate: string;
  createdBy: string;
  createdByName: string;
}

export interface DocumentsResponse {
  data: Document[];
  count: number;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
}

/**
 * Fetches all documents (both blood types and component types)
 */
export const getAllDocuments = async (): Promise<DocumentsResponse> => {
  try {
    const response = await apiClient.get<DocumentsResponse>('/documents/all');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentsResponse;
    }
    throw error;
  }
};

/**
 * Fetches blood type documents
 */
export const getBloodTypeDocuments = async (): Promise<DocumentsResponse> => {
  try {
    const response = await apiClient.get<DocumentsResponse>('/documents/blood-types');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentsResponse;
    }
    throw error;
  }
};

/**
 * Fetches component type documents
 */
export const getComponentTypeDocuments = async (): Promise<DocumentsResponse> => {
  try {
    const response = await apiClient.get<DocumentsResponse>('/documents/component-types');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentsResponse;
    }
    throw error;
  }
};

/**
 * Fetches a single document by ID
 */
export const getDocumentById = async (id: string): Promise<DocumentsResponse> => {
  try {
    const response = await apiClient.get<DocumentsResponse>(`/documents/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentsResponse;
    }
    throw error;
  }
}; 
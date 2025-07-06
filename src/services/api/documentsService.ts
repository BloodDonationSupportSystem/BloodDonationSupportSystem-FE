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
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
}

export interface DocumentResponse {
  data: Document;
  success: boolean;
  message: string;
  statusCode: number;
  errors: string[];
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  documentType: string;
  createdBy: string;
}

export interface UpdateDocumentRequest {
  title: string;
  content: string;
  documentType: string;
}

export interface DocumentsParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortAscending?: boolean;
  searchTerm?: string;
  documentType?: string;
}

/**
 * Fetches documents with pagination and filtering
 */
export const getDocuments = async (params: DocumentsParams = {}): Promise<DocumentsResponse> => {
  try {
    const response = await apiClient.get<DocumentsResponse>('/Documents', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentsResponse;
    }
    throw error;
  }
};

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
export const getDocumentById = async (id: string): Promise<DocumentResponse> => {
  try {
    const response = await apiClient.get<DocumentResponse>(`/Documents/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentResponse;
    }
    throw error;
  }
};

/**
 * Creates a new document
 */
export const createDocument = async (document: CreateDocumentRequest): Promise<DocumentResponse> => {
  try {
    const response = await apiClient.post<DocumentResponse>('/Documents', document);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentResponse;
    }
    throw error;
  }
};

/**
 * Updates an existing document
 */
export const updateDocument = async (id: string, document: UpdateDocumentRequest): Promise<DocumentResponse> => {
  try {
    const response = await apiClient.put<DocumentResponse>(`/Documents/${id}`, document);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentResponse;
    }
    throw error;
  }
};

/**
 * Deletes a document
 */
export const deleteDocument = async (id: string): Promise<DocumentResponse> => {
  try {
    const response = await apiClient.delete<DocumentResponse>(`/Documents/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as DocumentResponse;
    }
    throw error;
  }
}; 
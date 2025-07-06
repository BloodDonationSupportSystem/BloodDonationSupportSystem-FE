import { useState } from 'react';
import {
    documentsService,
    Document,
    DocumentsParams,
    CreateDocumentRequest,
    UpdateDocumentRequest
} from '@/services/api';
import { message } from 'antd';

interface UseAdminDocumentsResult {
    documents: Document[];
    loading: boolean;
    error: string | null;
    totalCount: number;
    pageSize: number;
    pageNumber: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    fetchDocuments: (params?: DocumentsParams) => Promise<void>;
    createDocument: (document: CreateDocumentRequest) => Promise<boolean>;
    updateDocument: (id: string, document: UpdateDocumentRequest) => Promise<boolean>;
    deleteDocument: (id: string) => Promise<boolean>;
    getDocumentById: (id: string) => Promise<Document | null>;
}

export function useAdminDocuments(): UseAdminDocumentsResult {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [pageSize, setPageSize] = useState<number>(10);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);

    const fetchDocuments = async (params: DocumentsParams = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Set default document type if not provided
            const queryParams = {
                ...params,
                documentType: params.documentType || 'BloodType'
            };

            const response = await documentsService.getDocuments(queryParams);

            if (response.success) {
                setDocuments(response.data);
                setTotalCount(response.totalCount);
                setPageSize(response.pageSize);
                setPageNumber(response.pageNumber);
                setTotalPages(response.totalPages);
                setHasPreviousPage(response.hasPreviousPage);
                setHasNextPage(response.hasNextPage);
            } else {
                setError(response.message || 'Failed to fetch documents');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching documents');
        } finally {
            setLoading(false);
        }
    };

    const createDocument = async (document: CreateDocumentRequest): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await documentsService.createDocument(document);

            if (response.success) {
                message.success('Document created successfully');
                // Refresh the documents list
                await fetchDocuments({ pageNumber, pageSize, documentType: document.documentType });
                return true;
            } else {
                message.error(response.message || 'Failed to create document');
                return false;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while creating the document');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateDocument = async (id: string, document: UpdateDocumentRequest): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await documentsService.updateDocument(id, document);

            if (response.success) {
                message.success('Document updated successfully');
                // Refresh the documents list
                await fetchDocuments({ pageNumber, pageSize, documentType: document.documentType });
                return true;
            } else {
                message.error(response.message || 'Failed to update document');
                return false;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while updating the document');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteDocument = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            const response = await documentsService.deleteDocument(id);

            if (response.success) {
                message.success('Document deleted successfully');
                // Refresh the documents list
                await fetchDocuments({ pageNumber, pageSize });
                return true;
            } else {
                message.error(response.message || 'Failed to delete document');
                return false;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while deleting the document');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getDocumentById = async (id: string): Promise<Document | null> => {
        try {
            setLoading(true);
            const response = await documentsService.getDocumentById(id);

            if (response.success) {
                return response.data;
            } else {
                message.error(response.message || 'Failed to fetch document');
                return null;
            }
        } catch (err: any) {
            message.error(err.message || 'An error occurred while fetching the document');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        documents,
        loading,
        error,
        totalCount,
        pageSize,
        pageNumber,
        totalPages,
        hasPreviousPage,
        hasNextPage,
        fetchDocuments,
        createDocument,
        updateDocument,
        deleteDocument,
        getDocumentById
    };
} 
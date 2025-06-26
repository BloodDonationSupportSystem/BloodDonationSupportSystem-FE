import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Interface for both blood type and component type documents
 */
interface BloodTypeDocument {
  id: string;
  title: string;
  content: string;
  documentType: string; // Can be 'BloodType' or 'ComponentType'
  createdDate: string;
  createdBy: string;
  createdByName: string;
}

/**
 * State for blood information, including both blood types and component types
 */
interface BloodInfoState {
  documents: BloodTypeDocument[];
  selectedDocument: BloodTypeDocument | null;
  loading: boolean;
  error: string | null;
}

const initialState: BloodInfoState = {
  documents: [],
  selectedDocument: null,
  loading: false,
  error: null,
};

export const bloodInfoSlice = createSlice({
  name: 'bloodInfo',
  initialState,
  reducers: {
    // Set all documents (both blood types and component types)
    setDocuments: (state, action: PayloadAction<BloodTypeDocument[]>) => {
      state.documents = action.payload;
      if (action.payload.length > 0 && !state.selectedDocument) {
        state.selectedDocument = action.payload[0];
      }
    },
    // Select a specific document (either blood type or component type)
    selectDocument: (state, action: PayloadAction<BloodTypeDocument>) => {
      state.selectedDocument = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setDocuments, selectDocument, setLoading, setError } = bloodInfoSlice.actions;
export default bloodInfoSlice.reducer; 
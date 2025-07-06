import { v4 as uuidv4 } from 'uuid';

// Base URL for OpenMap.vn API
const OPENMAP_API_BASE_URL = 'https://mapapis.openmap.vn/v1';
const OPENMAP_API_KEY = 'Fca7FB9MxT00OntvC6WjZruBko5MBDRF';

// Types for autocomplete response
export interface AutocompleteMatchedSubstring {
    length: number;
    offset: number;
}

export interface AutocompleteStructuredFormatting {
    main_text: string;
    main_text_matched_substrings: AutocompleteMatchedSubstring[];
    secondary_text: string;
    secondary_text_matched_substrings: AutocompleteMatchedSubstring[];
}

export interface AutocompleteTerm {
    offset: number;
    value: string;
}

export interface AutocompletePrediction {
    description: string;
    distance_meters: number | null;
    matched_substrings: AutocompleteMatchedSubstring[];
    place_id: string;
    structured_formatting: AutocompleteStructuredFormatting;
    terms: AutocompleteTerm[];
    types: string[];
}

export interface AutocompleteResponse {
    predictions: AutocompletePrediction[];
    status: string;
}

// Types for place details response
export interface PlaceAddressComponent {
    long_name: string;
    short_name: string;
}

export interface PlaceGeometry {
    location: {
        lat: number;
        lng: number;
    };
    viewport: any;
}

export interface PlaceDetailGoogle {
    address_components: PlaceAddressComponent[];
    formatted_address: string;
    geometry: PlaceGeometry;
    name: string;
    place_id: string;
    types: string[];
    url: string;
}

export interface PlaceDetailGoogleResponse {
    result: PlaceDetailGoogle;
    status: string;
}

export interface PlaceFeatureProperties {
    name: string;
    housenumber: string | null;
    street: string | null;
    short_address: string;
    postalcode: string | null;
    label: string;
    country: string;
    country_code: string;
    category: string[];
    website: string | null;
    opening_hours: number[][][] | null;
    phone: string | null;
    region: string;
    county: string;
    locality: string;
    distance: number | null;
    id: string;
    continent: string;
    source: string;
}

export interface PlaceFeature {
    type: string;
    geometry: {
        coordinates: number[];
        type: string;
    };
    properties: PlaceFeatureProperties;
}

export interface PlaceDetailResponse {
    errors: any;
    features: PlaceFeature[];
    bbox: any[];
    type: string;
}

// Session token management
let currentSessionToken: string | null = null;

/**
 * Get a session token for OpenMap.vn API requests
 * Creates a new one if none exists or reuses the current one
 */
export const getSessionToken = (): string => {
    if (!currentSessionToken) {
        currentSessionToken = uuidv4();
    }
    return currentSessionToken;
};

/**
 * Reset the session token
 * Call this when starting a new search session
 */
export const resetSessionToken = (): void => {
    currentSessionToken = uuidv4();
};

/**
 * Search for location suggestions using OpenMap.vn autocomplete API
 * @param input Search query
 * @param sessionToken Optional session token (will use or create a token if not provided)
 * @returns Promise with autocomplete results
 */
export const searchLocationSuggestions = async (
    input: string,
    sessionToken?: string
): Promise<AutocompleteResponse> => {
    try {
        const token = sessionToken || getSessionToken();
        const url = new URL(`${OPENMAP_API_BASE_URL}/autocomplete`);

        url.searchParams.append('input', input);
        url.searchParams.append('sessiontoken', token);
        url.searchParams.append('apikey', OPENMAP_API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`OpenMap API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error searching for location suggestions:', error);
        return { predictions: [], status: 'ERROR' };
    }
};

/**
 * Get place details using OpenMap.vn place API with Google format
 * @param placeId Place ID from autocomplete results
 * @param sessionToken Session token (should be the same used for autocomplete)
 * @returns Promise with place details
 */
export const getPlaceDetailsGoogle = async (
    placeId: string,
    sessionToken?: string
): Promise<PlaceDetailGoogleResponse> => {
    try {
        const token = sessionToken || getSessionToken();
        const url = new URL(`${OPENMAP_API_BASE_URL}/place`);

        url.searchParams.append('ids', placeId);
        url.searchParams.append('sessiontoken', token);
        url.searchParams.append('format', 'google');
        url.searchParams.append('apikey', OPENMAP_API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`OpenMap API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting place details:', error);
        return { result: {} as PlaceDetailGoogle, status: 'ERROR' };
    }
};

/**
 * Get place details using OpenMap.vn place API with GeoJSON format
 * @param placeId Place ID from autocomplete results
 * @param sessionToken Session token (should be the same used for autocomplete)
 * @returns Promise with place details
 */
export const getPlaceDetails = async (
    placeId: string,
    sessionToken?: string
): Promise<PlaceDetailResponse> => {
    try {
        const token = sessionToken || getSessionToken();
        const url = new URL(`${OPENMAP_API_BASE_URL}/place`);

        url.searchParams.append('ids', placeId);
        url.searchParams.append('sessiontoken', token);
        url.searchParams.append('apikey', OPENMAP_API_KEY);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`OpenMap API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error getting place details:', error);
        return { errors: null, features: [], bbox: [], type: 'FeatureCollection' };
    }
}; 
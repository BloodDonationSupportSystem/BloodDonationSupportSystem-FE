export interface Location {
    id: string;
    name: string;
    description?: string;
    latitude: string;
    longitude: string;
    address: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LocationFilter {
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface LocationsResponse {
    data: Location[];
    total: number;
    page: number;
    pageSize: number;
} 
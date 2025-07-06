'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Select, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
    searchLocationSuggestions,
    getPlaceDetailsGoogle,
    resetSessionToken,
    AutocompletePrediction
} from '@/services/api/mapService';
import debounce from 'lodash/debounce';

const { Option } = Select;

export interface LocationAutocompleteValue {
    address: string;
    latitude: number;
    longitude: number;
    placeId: string;
}

interface LocationAutocompleteProps {
    value?: LocationAutocompleteValue;
    onChange?: (value: LocationAutocompleteValue | undefined) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
    allowClear?: boolean;
}

export default function LocationAutocomplete({
    value,
    onChange,
    placeholder = 'Search for a location',
    className,
    style,
    disabled = false,
    allowClear = true
}: LocationAutocompleteProps) {
    const [searchText, setSearchText] = useState<string>('');
    const [suggestions, setSuggestions] = useState<AutocompletePrediction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Reset session token when component mounts
    useEffect(() => {
        resetSessionToken();
    }, []);

    // Update search text when value changes
    useEffect(() => {
        if (value?.address) {
            setSearchText(value.address);
        } else {
            setSearchText('');
        }
    }, [value]);

    // Debounced function for searching locations
    const debouncedSearch = useCallback(
        debounce(async (value: string) => {
            if (!value || value.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await searchLocationSuggestions(value);
                if (response.status === 'OK') {
                    setSuggestions(response.predictions);
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error('Error searching for locations:', err);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchText(value);
        debouncedSearch(value);
    };

    // Handle suggestion selection
    const handleSuggestionSelect = async (placeId: string) => {
        if (!placeId) {
            onChange?.(undefined);
            return;
        }

        setLoading(true);
        try {
            const selected = suggestions.find(s => s.place_id === placeId);
            if (selected) {
                // Get place details
                const placeDetails = await getPlaceDetailsGoogle(placeId);

                if (placeDetails.status === 'OK' && placeDetails.result) {
                    const { lat, lng } = placeDetails.result.geometry.location;

                    onChange?.({
                        address: placeDetails.result.formatted_address,
                        latitude: lat,
                        longitude: lng,
                        placeId: placeId
                    });
                }
            }
        } catch (err) {
            console.error('Error getting place details:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle clear
    const handleClear = () => {
        onChange?.(undefined);
        setSearchText('');
        setSuggestions([]);
    };

    return (
        <Select
            showSearch
            value={searchText}
            placeholder={placeholder}
            defaultActiveFirstOption={false}
            showArrow={false}
            filterOption={false}
            onSearch={handleSearchChange}
            onChange={handleSuggestionSelect}
            onClear={handleClear}
            notFoundContent={loading ? <Spin size="small" /> : <Empty description="No locations found" />}
            className={className}
            style={style}
            disabled={disabled}
            allowClear={allowClear}
            loading={loading}
            suffixIcon={<SearchOutlined />}
        >
            {suggestions.map(suggestion => (
                <Option key={suggestion.place_id} value={suggestion.place_id}>
                    <div className="flex flex-col">
                        <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                        <div className="text-xs text-gray-500">
                            {suggestion.structured_formatting.secondary_text}
                        </div>
                    </div>
                </Option>
            ))}
        </Select>
    );
} 
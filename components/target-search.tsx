import { Input, List, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef, useCallback } from "react";
import { FilterValues } from "@/types";

interface SearchSuggestion {
    address: string;
    parcel_id: string;
    owner_name: string;
}

export default function TargetSearch({ onSearch }: { onSearch: (filters: FilterValues) => void }) {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.search-container')) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSearch = useCallback(() => {
        const filterValues: FilterValues = {};
        if (searchText.trim()) {
            filterValues.search = searchText.trim();
        }
        onSearch(filterValues);
    }, [onSearch, searchText]);

    // Debounced search function
    const debouncedSearch = useCallback((query: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (query.trim().length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('target', query.trim());
                queryParams.append('limit', '1000'); // Limit to 10 results for suggestions

                const response = await fetch(`/api/properties?${queryParams.toString()}`);
                const data = await response.json();

                const searchSuggestions: SearchSuggestion[] = (data.features || []).map((feature: any) => ({
                    address: feature.properties.address,
                    parcel_id: feature.properties.parcel_id,
                    owner_name: feature.properties.owner_name
                }));

                setSuggestions(searchSuggestions);
            } catch (error) {
                console.error('Error fetching search suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce delay
    }, []);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchText(value);
        setSelectedIndex(-1);

        if (value.trim().length >= 2) {
            setShowSuggestions(true);
            debouncedSearch(value);
        } else {
            setShowSuggestions(false);
            setSuggestions([]);
        }
    }, [debouncedSearch]);

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback((suggestion: SearchSuggestion, searchText: string) => {
        if (searchText.includes(suggestion.address)) {
            setSearchText(suggestion.address);
        } else if (searchText.includes(suggestion.parcel_id)) {
            setSearchText(suggestion.parcel_id);
        } else {
            // Check if search text matches any word in owner name (wildcard matching)
            const searchWords = searchText.toLowerCase().split(/\s+/).filter(word => word.length > 0);
            const ownerWords = suggestion.owner_name.toLowerCase().split(/\s+/);
            
            const hasMatch = searchWords.some(searchWord => 
                ownerWords.some(ownerWord => ownerWord.includes(searchWord))
            );
            
            if (hasMatch) {
                setSearchText(suggestion.owner_name);
            }
        }
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);

        // Trigger search with the selected address
        const filterValues: FilterValues = {};
        filterValues.target = suggestion.address;
        onSearch(filterValues);
    }, [onSearch]);

    const handleTargetSearch = useCallback((value: string) => {
        setSearchText(value);
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedIndex(-1);

        const filterValues: FilterValues = {};
        filterValues.target = value;
        onSearch(filterValues);
    }, [onSearch]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionSelect(suggestions[selectedIndex], searchText);
                } else if (searchText.trim()) {
                    handleTargetSearch(searchText);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    }, [showSuggestions, suggestions, selectedIndex, searchText, handleSuggestionSelect, handleTargetSearch]);

    return (
        <div className="search-container relative flex items-center">
            <Input
                placeholder="Address, Parcel ID, or Owner"
                value={searchText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                prefix={<SearchOutlined className="mr-1" />}
            />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || loading) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center">
                            <Spin size="small" />
                            <span className="ml-2">Searching...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <List
                            size="small"
                            dataSource={suggestions}
                            renderItem={(suggestion, index) => (
                                <List.Item
                                    className={`px-3 py-2 cursor-pointer hover:bg-gray-50 ${index === selectedIndex ? 'bg-blue-50' : ''
                                        }`}
                                    onClick={() => handleSuggestionSelect(suggestion, searchText)}
                                >
                                    <div className="w-full">
                                        <div className="font-medium text-sm">{suggestion.address}</div>
                                        <div className="text-xs">
                                            Parcel: {suggestion.parcel_id} • Owner: {suggestion.owner_name}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    ) : searchText.trim().length >= 2 ? (
                        <div className="p-4 text-center">
                            No results found
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
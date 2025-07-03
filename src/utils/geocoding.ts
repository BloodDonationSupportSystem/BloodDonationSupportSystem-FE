/**
 * Get address from latitude and longitude using Nominatim API (OpenStreetMap)
 * 
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with address string or null if not found
 */
export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
): Promise<string | null> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                    'User-Agent': 'BloodDonationApp/1.0'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch address: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.display_name) {
            return data.display_name;
        }

        return null;
    } catch (error) {
        console.error('Error getting address from coordinates:', error);
        return null;
    }
}; 
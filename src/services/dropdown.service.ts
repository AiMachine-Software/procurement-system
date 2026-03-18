import axiosClient from '../utils/axiosClient';

export interface DropdownItem {
    id?: string;
    code: string;
    name: string;
}

export const dropdownService = {
    getDropdown: async (type: string): Promise<DropdownItem[]> => {
        const response = await axiosClient.get(`/v1/dropdown/${type}`);
        const result = response.data;

        // 1. Try to find the array in various common backend response structures
        let rawItems: any[] = [];
        if (Array.isArray(result?.data?.item)) rawItems = result.data.item;
        else if (Array.isArray(result?.item)) rawItems = result.item;
        else if (Array.isArray(result?.data)) rawItems = result.data;
        else if (Array.isArray(result)) rawItems = result;

        // 2. Map the items to our DropdownItem interface (handle key/value or code/name)
        return rawItems.map(item => ({
            id: item.key || item.id || item.code,
            code: item.key || item.code || '',
            name: item.value || item.name || '',
        }));
    }
};

import React, { useEffect, useState } from 'react';
import { Select, MenuItem, Typography } from '@mui/material';
import { GetLookupList } from '../../api/item.service';

const ItemLookup = ({ value, onChange, ...props }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await GetLookupList();
                if (response.data) {
                    setItems(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch item lookup list", err);
            }
        };
        fetchItems();
    }, []);

    // Helper to find item name for renderValue if needed, though Select handles it if items are present.
    // However, if items are loading, it might show ID.
    // But since we are just returning the Select, the parent controls a lot.
    // Actually, to make it a drop-in replacement that handles the "Select item..." placeholder:

    return (
        <Select
            value={value}
            onChange={onChange}
            displayEmpty
            renderValue={(selected) => {
                if (!selected) {
                    return <Typography color="text.secondary" fontSize="0.875rem">Select item...</Typography>;
                }
                // If items are loaded, Select usually finds the label. 
                // But with renderValue, we must return what we want to see.
                // We need to find the item name from the ID.
                const selectedItem = items.find(i => i.itemID === selected);
                return selectedItem ? selectedItem.itemName : selected;
            }}
            {...props}
        >
            {items.map((item) => (
                <MenuItem key={item.itemID} value={item.itemID}>
                    {item.itemName}
                </MenuItem>
            ))}
        </Select>
    );
};

export default ItemLookup;

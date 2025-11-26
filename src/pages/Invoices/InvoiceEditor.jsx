import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Grid,
    TextField,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Divider,
    Dialog,
    InputAdornment,
    useTheme,
    FormHelperText,
    Snackbar,
    Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";
import ItemLookup from "../Items/ItemLookup";
import api, { postData, putData } from "../../utils/axiosintance";

const InvoiceEditor = ({ open, close, mode, invoiceId, onSaved }) => {
    const theme = useTheme();

    // Form State
    const [updatedOn, setUpdatedOn] = useState(null)
    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [customerName, setCustomerName] = useState(null);
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState({});
    const [lineErrors, setLineErrors] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });
    const [errorSnackbar, setErrorSnackbar] = useState({
        open: false,
        message: "",
        severity: "error"
    });

    // Line Items State
    const [items, setItems] = useState([
        { id: 1, itemID: "", description: "", quantity: 0, rate: 0, discountPct: 0, amount: 0 }
    ]);

    // Totals State
    const [taxPercentage, setTaxPercentage] = useState(0);

    // Calculations
    const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subTotal * (taxPercentage / 100);
    const totalAmount = subTotal + taxAmount;

    // Handlers
    const handleAddItem = () => {
        setItems([...items, {
            id: items.length + 1,
            itemID: "",
            description: "",
            quantity: 0,
            rate: 0,
            discountPct: 0,
            amount: 0
        }]);
    };

    useEffect(() => {
        if (mode === "edit" && invoiceId) {
            LoadInvoiceData();
        }
        else {

            GetInvoiceData();
        }
    }, [invoiceId]);





    function getNextInvoiceNo(invoices) {
        if (!invoices || invoices.length === 0) return 1;

        const maxInvoiceNo = Math.max(
            ...invoices
                .map(inv => parseInt(inv.invoiceNo))  // string → number
                .filter(num => !isNaN(num))          // valid number only
        );

        return maxInvoiceNo + 1;
    }



    const GetInvoiceData = async () => {

        try {

            const res = await api.get(`/Invoice/GetList`);
            const maxInvoiceNo = getNextInvoiceNo(res.data)
            setInvoiceNo(maxInvoiceNo)
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        }
    }

    const LoadInvoiceData = async () => {
        try {
            const res = await api.get(`/Invoice/${invoiceId}`);
            const data = res.data;
            setInvoiceNo(data.invoiceNo);
            setInvoiceDate(dayjs(data.invoiceDate).format("YYYY-MM-DD"));
            setCustomerName(data.customerName);
            setAddress(data.address);
            setCity(data.city);
            setTaxPercentage(data.taxPercentage);
            setNotes(data.notes);
            setUpdatedOn(data.updatedOn)
            data.lines.map(r => {
                r.amount = (r.quantity * r.rate) * (1 - r.discountPct / 100)
            })
            setItems(data.lines);
        } catch (err) {
            console.log("Load error", err);
        }
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        // Clear errors for removed item
        const newLineErrors = lineErrors.filter((_, i) => i !== index);
        setLineErrors(newLineErrors);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Recalculate amount for the row
        // Formula: Row Amount = quantity × Rate − (quantity × Rate × Disc% / 100)
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        const discountPct = parseFloat(newItems[index].discountPct) || 0;

        const baseAmount = quantity * rate;
        const discountPctAmount = (baseAmount * discountPct) / 100;
        newItems[index].amount = baseAmount - discountPctAmount;

        setItems(newItems);

        // Clear error for this field when user changes it
        if (lineErrors[index]) {
            const newLineErrors = [...lineErrors];
            if (newLineErrors[index] && newLineErrors[index][field]) {
                delete newLineErrors[index][field];
                setLineErrors(newLineErrors);
            }
        }
    };

    const handleItemLookupChange = async (index, event, selectedItem) => {
        const newItemID = event.target.value;
        const newItems = [...items];
        newItems[index].itemID = newItemID;
        setItems(newItems);
        // Clear itemID error when user selects an item
        if (lineErrors[index]) {
            const newLineErrors = [...lineErrors];
            if (newLineErrors[index] && newLineErrors[index].itemID) {
                delete newLineErrors[index].itemID;
                setLineErrors(newLineErrors);
            }
        }

        if (newItemID) {
            try {
                const res = await api.get(`/Item/${newItemID}`);
                const fullItem = res.data;

                setItems(currentItems => {
                    const updatedItems = [...currentItems];
                    if (updatedItems[index] && updatedItems[index].itemID === newItemID) {
                        updatedItems[index].description = fullItem.description || "";
                        updatedItems[index].rate = fullItem.salesRate || 0;
                        updatedItems[index].discountPct = fullItem.discountPct || 0;

                        // Recalculate amount
                        // Formula: Row Amount = quantity × Rate − (quantity × Rate × Disc% / 100)
                        const quantity = parseFloat(updatedItems[index].quantity) || 0;
                        const rate = parseFloat(updatedItems[index].rate) || 0;
                        const discountPct = parseFloat(updatedItems[index].discountPct) || 0;

                        const baseAmount = quantity * rate;
                        const discountPctAmount = (baseAmount * discountPct) / 100;
                        updatedItems[index].amount = baseAmount - discountPctAmount;
                    }
                    return updatedItems;
                });
            } catch (err) {
                console.error("Failed to fetch item details", err);
            }
        }
    };

    const validateLineItems = () => {
        const newLineErrors = [];
        let hasValidLine = false;

        items.forEach((item, index) => {
            const itemErrors = {};

            // 1. Item is required
            if (!item.itemID) {
                itemErrors.itemID = "Item is required";
            }

            // 2. quantity >= 0
            const quantity = parseFloat(item.quantity);
            if (isNaN(quantity) || quantity < 0) {
                itemErrors.quantity = "quantity must be >= 0";
            } else if (quantity > 0) {
                hasValidLine = true;
            }

            // 3. Rate >= 0
            const rate = parseFloat(item.rate);
            if (isNaN(rate) || rate < 0) {
                itemErrors.rate = "Rate must be >= 0";
            }

            // 4. Disc 0-100
            const discountPct = parseFloat(item.discountPct);
            if (isNaN(discountPct) || discountPct < 0 || discountPct > 100) {
                itemErrors.discountPct = "Disc must be 0-100";
            }

            newLineErrors[index] = itemErrors;
        });

        // 5. At least one line with quantity > 0
        if (!hasValidLine) {
            // Mark the first line's quantity field with this error
            if (newLineErrors[0]) {
                newLineErrors[0].quantity = "Enter qty";
            } else {
                newLineErrors[0] = { quantity: "Enter qty" };
            }
        }
        setLineErrors(newLineErrors);
        return newLineErrors.every(errors => Object.keys(errors).length === 0);
    };

    const handleSave = async () => {
        // Validation
        const newErrors = {};
        if (!invoiceDate) newErrors.invoiceDate = "Invoice Date is required";
        if (!customerName) newErrors.customerName = "Customer Name is required";

        if (items.length === 0) {
            newErrors.items = "At least one item is required";
        }
        const lineItemsValid = validateLineItems();

        if (Object.keys(newErrors).length > 0 || !lineItemsValid) {
            setErrors(newErrors);
            setErrorSnackbar({ open: true, message: newErrors.invoiceDate || newErrors.customerName || newErrors.items || "Enter quantity", severity: "error" });
            return;
        }

        try {
            let payload = {
                invoiceNo: invoiceNo,
                invoiceDate: invoiceDate,
                customerName: customerName,
                address: address,
                city: city,
                taxPercentage: parseFloat(taxPercentage) || 0,
                notes: notes,
                lines: items.map((item, index) => ({
                    rowNo: index + 1,
                    itemID: item.itemID,
                    description: item.description,
                    quantity: parseFloat(item.quantity) || 0,
                    rate: parseFloat(item.rate) || 0,
                    discountPct: parseFloat(item.discountPct) || 0
                }))
            };

            if (mode === "add") {
                const res = await postData("/Invoice", payload);

                if (res.status === 201) {
                    setSnackbar({
                        open: true,
                        message: "Invoice added successfully!",
                        severity: "success"
                    });

                    setTimeout(() => {
                        close();
                        if (onSaved) onSaved();
                    }, 1000);
                }
            } else {
                // Handle edit mode
                const DataToUpdate = {
                    ...payload,
                    updatedOn: updatedOn,
                    invoiceID: invoiceId
                }
                const res = await putData("/Invoice", DataToUpdate);
                if (res.status === 200) {
                    setSnackbar({
                        open: true,
                        message: "Invoice updated successfully!",
                        severity: "success"
                    });

                    setTimeout(() => {
                        close();
                        if (onSaved) onSaved();
                    }, 1000);
                }
            }
        } catch (error) {
            console.log(error);
            // Handle API errors
            let errorMessage = "Failed to save invoice";

            if (error.response) {
                // Check for duplicate invoice number error
                if (error.response.status === 400 || error.response.status === 409) {
                    if (error.response.data && typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data && error.response.data.title) {
                        errorMessage = error.response.data.title;
                    }
                } else {
                    errorMessage = error.response.data?.message || error.response.data || errorMessage;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error"
            });
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
                    close();
                }}
                fullWidth
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: '0 20px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        height: '90vh',
                        maxHeight: '95vh'
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>

                    {/* Left Side - Invoice Details */}
                    <Box sx={{
                        width: { xs: '100%', md: '30%' },
                        bgcolor: '#f8f9fa',
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: { md: '1px solid #eee' },
                        overflowY: 'auto'
                    }}>
                        {/* <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, fontWeight: 600, letterSpacing: 0.5 }}>
                            INVOICE DETAILS
                        </Typography> */}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} mb={1}>Invoice No</Typography>
                                <TextField
                                    value={invoiceNo}

                                    fullWidth
                                    placeholder="Invoice No"
                                    type="text"
                                    inputMode="numeric"
                                    size="small"
                                    sx={{ bgcolor: "#fff" }}
                                    disabled

                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 10,
                                        }
                                    }}
                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                />
                            </Box>
                            <Box>
                                {/* <Typography variant="subtitle2" fontWeight={600} mb={1}>Invoice Date</Typography> */}
                                <TextField
                                    required
                                    label="Invoice Date"
                                    fullWidth
                                    type="date"
                                    size="small"
                                    value={invoiceDate}
                                    onChange={(e) => {
                                        setInvoiceDate(e.target.value);
                                        if (errors.invoiceDate) setErrors({ ...errors, invoiceDate: "" });
                                    }}
                                    error={!!errors.invoiceDate}
                                    helperText={errors.invoiceDate}
                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                />
                            </Box>
                            <Box>
                                {/* <Typography variant="subtitle2" fontWeight={600} mb={1}>Customer Name *</Typography> */}
                                <TextField
                                    required
                                    label="Customer Name"
                                    fullWidth
                                    placeholder="Enter customer name"
                                    size="small"
                                    value={customerName || ""}
                                    onChange={(e) => {
                                        setCustomerName(e.target.value);
                                        if (errors.customerName) setErrors({ ...errors, customerName: "" });
                                    }}
                                    error={!!errors.customerName}
                                    helperText={errors.customerName}
                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 50,
                                        }
                                    }}
                                />
                            </Box>
                            <Box>
                                {/* <Typography variant="subtitle2" fontWeight={600} mb={1}>City</Typography> */}
                                <TextField
                                    label="City"
                                    fullWidth
                                    placeholder="Enter city"
                                    size="small"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 50,
                                        }
                                    }}
                                />
                            </Box>
                            <Box>
                                {/* <Typography variant="subtitle2" fontWeight={600} mb={1}>Address</Typography> */}
                                <TextField
                                    label="Address"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Enter address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 500,
                                        }
                                    }}
                                />
                            </Box>
                            <Box>
                                {/* <Typography variant="subtitle2" fontWeight={600} mb={1}>Notes</Typography> */}
                                <TextField
                                    label="Notes"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Additional notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                    slotProps={{
                                        htmlInput: {
                                            maxLength: 500,
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Right Side - Line Items & Totals */}
                    <Box sx={{
                        width: { xs: '100%', md: '70%' },
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight="700" sx={{ color: '#1a1a1a' }}>
                                {mode === "edit" ? "Edit Invoice" : "New Invoice"}
                            </Typography>
                            <IconButton onClick={close} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {/* Line Items Actions */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Typography variant="h6" fontWeight={600}>Line Items</Typography>
                            <Box>
                                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddItem} sx={{ mr: 1, color: "text.primary", borderColor: "#e0e0e0", borderRadius: 2, textTransform: 'none' }}>
                                    Add Row
                                </Button>
                                <Button startIcon={<ContentCopyIcon />} variant="outlined" size="small" sx={{ mr: 1, color: "text.primary", borderColor: "#e0e0e0", borderRadius: 2, textTransform: 'none' }}>
                                    Copy
                                </Button>
                                <Button startIcon={<DeleteOutlineIcon />} variant="outlined" size="small" color="error" sx={{ borderColor: "#e0e0e0", borderRadius: 2, textTransform: 'none' }}>
                                    Delete
                                </Button>
                            </Box>
                        </Box>

                        {/* Table */}
                        <TableContainer sx={{ mb: 4, border: '1px solid #f0f0f0', borderRadius: 2 }}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600, width: "50px" }}>S.No</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "200px" }}>Item *</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "100px" }}>quantity *</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "200px" }}>Rate *</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "100px" }}>Disc %</TableCell>
                                        <TableCell sx={{ fontWeight: 600, width: "150px", textAlign: "right" }}>Amount</TableCell>
                                        <TableCell sx={{ width: "50px" }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                <Box>
                                                    <ItemLookup
                                                        fullWidth
                                                        size="small"
                                                        value={item.itemID}
                                                        onChange={(e, selectedItem) => handleItemLookupChange(index, e, selectedItem)}
                                                        sx={{
                                                            borderRadius: 2,
                                                            bgcolor: '#fff',
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                border: lineErrors[index]?.itemID ? '1px solid #d32f2f' : '1px solid #e0e0e0'
                                                            }
                                                        }}
                                                    />
                                                    {lineErrors[index]?.itemID && (
                                                        <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                                                            {lineErrors[index].itemID}
                                                        </FormHelperText>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                    InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        placeholder="0"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                        error={!!lineErrors[index]?.quantity}
                                                        InputProps={{
                                                            sx: {
                                                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                                    WebkitAppearance: 'none',
                                                                    margin: 0,
                                                                },
                                                                '& input[type=number]': {
                                                                    MozAppearance: 'textfield',
                                                                },
                                                                borderRadius: 2,
                                                                bgcolor: '#fff',
                                                                '& fieldset': { border: '1px solid #e0e0e0' }
                                                            }
                                                        }}
                                                    />
                                                    {lineErrors[index]?.quantity && (
                                                        <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                                                            {lineErrors[index].quantity}
                                                        </FormHelperText>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={item.rate}
                                                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                                        error={!!lineErrors[index]?.rate}
                                                        InputProps={{
                                                            sx: {
                                                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                                    WebkitAppearance: 'none',
                                                                    margin: 0,
                                                                },
                                                                '& input[type=number]': {
                                                                    MozAppearance: 'textfield',
                                                                },
                                                                borderRadius: 2,
                                                                bgcolor: '#fff',
                                                                '& fieldset': { border: '1px solid #e0e0e0' }
                                                            }
                                                        }}
                                                    />
                                                    {lineErrors[index]?.rate && (
                                                        <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                                                            {lineErrors[index].rate}
                                                        </FormHelperText>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="number"
                                                        placeholder="0"
                                                        value={item.discountPct}
                                                        onChange={(e) => handleItemChange(index, "discountPct", e.target.value)}
                                                        error={!!lineErrors[index]?.discountPct}
                                                        InputProps={{
                                                            sx: {
                                                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                                    WebkitAppearance: 'none',
                                                                    margin: 0,
                                                                },
                                                                '& input[type=number]': {
                                                                    MozAppearance: 'textfield',
                                                                },
                                                                borderRadius: 2,
                                                                bgcolor: '#fff',
                                                                '& fieldset': { border: '1px solid #e0e0e0' }
                                                            }
                                                        }}
                                                    />
                                                    {lineErrors[index]?.discountPct && (
                                                        <FormHelperText error sx={{ ml: 0, mt: 0.5 }}>
                                                            {lineErrors[index].discountPct}
                                                        </FormHelperText>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                                ${item.amount?.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleRemoveItem(index)}>
                                                    <DeleteOutlineIcon fontSize="small" color="error" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Totals Section */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Box sx={{ width: { xs: '100%', md: '50%' }, bgcolor: '#f8f9fa', p: 3, borderRadius: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                    <Typography color="text.secondary">Sub Total</Typography>
                                    <Typography fontWeight={600}>${subTotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                    <Typography color="text.secondary">Tax</Typography>
                                    <Box sx={{ display: "flex", gap: 2, width: "60%", justifyContent: 'flex-end' }}>
                                        <TextField
                                            size="small"
                                            placeholder="0"
                                            value={taxPercentage}
                                            onChange={(e) => setTaxPercentage(e.target.value)}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } }
                                            }}
                                            sx={{ width: "80px" }}
                                        />
                                        <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                                            ${taxAmount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6" fontWeight={600}>Total Amount</Typography>
                                    <Typography variant="h5" fontWeight={700} color="primary.main">${totalAmount.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Footer Buttons */}
                        <Box sx={{ mt: 'auto', pt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                onClick={close}
                                sx={{
                                    color: 'text.secondary',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: 3
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                disableElevation
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1,
                                    bgcolor: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: '#333'
                                    }
                                }}
                                onClick={handleSave}
                            >
                                Save
                            </Button>
                        </Box>

                    </Box>
                </Box>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
            {errorSnackbar.open && (
                <>
                    <Snackbar
                        open={errorSnackbar.open}
                        autoHideDuration={4000}
                        onClose={() => setErrorSnackbar({ ...errorSnackbar, open: false })}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <Alert
                            onClose={() => setErrorSnackbar({ ...errorSnackbar, open: false })}
                            severity={errorSnackbar.severity}
                            variant="filled"
                            sx={{ width: "100%" }}
                        >
                            {errorSnackbar.message}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </>
    );
};

export default InvoiceEditor;
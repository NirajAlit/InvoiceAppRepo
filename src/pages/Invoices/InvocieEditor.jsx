import React, { useState } from "react";
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
    useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";
import ItemLookup from "../Items/ItemLookup";
import { postData } from "../../utils/axiosintance";

const InvoiceEditor = ({ open, close, mode = "add", invoiceId = 0 }) => {
    const theme = useTheme();

    // Form State
    const [invoiceNo, setInvoiceNo] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [customerName, setCustomerName] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState({});

    // Line Items State
    const [items, setItems] = useState([
        { id: 1, itemID: "", description: "", qty: 0, rate: 0, discount: 0, amount: 0 }
    ]);

    // Totals State
    const [taxPercentage, setTaxPercentage] = useState(0);

    // Calculations
    const subTotal = items.reduce((sum, item) => sum + (item.qty * item.rate * (1 - item.discount / 100)), 0);
    const taxAmount = subTotal * (taxPercentage / 100);
    const totalAmount = subTotal + taxAmount;

    // Handlers
    const handleAddItem = () => {
        setItems([...items, {
            id: items.length + 1,
            itemID: "",
            description: "",
            qty: 0,
            rate: 0,
            discount: 0,
            amount: 0
        }]);
    };

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Recalculate amount for the row
        const qty = parseFloat(newItems[index].qty) || 0;
        const rate = parseFloat(newItems[index].rate) || 0;
        const discount = parseFloat(newItems[index].discount) || 0;
        newItems[index].amount = qty * rate * (1 - discount / 100);

        setItems(newItems);
    };

    const handleSave = async () => {
        // Validation
        const newErrors = {};
        if (!invoiceDate) newErrors.invoiceDate = "Invoice Date is required";
        if (!customerName) newErrors.customerName = "Customer Name is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const payload = {
                invoiceNo: invoiceId,
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
                    quantity: parseFloat(item.qty) || 0,
                    rate: parseFloat(item.rate) || 0,
                    discountPct: parseFloat(item.discount) || 0
                }))
            };

            if (mode === "add") {
                const res = await postData("/Invoice", payload);
                if (res.status === 200) {
                    close();
                }
            } else {
                // Handle edit mode if needed in future
                const res = await postData("/Invoice", payload);
                if (res.status === 200) {
                    close();
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="xl"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
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
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, fontWeight: 600, letterSpacing: 0.5 }}>
                        INVOICE DETAILS
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>Invoice No</Typography>
                            <TextField
                                value={invoiceNo}
                                onChange={(e) => setInvoiceNo(e.target.value)}
                                fullWidth
                                placeholder="Invoice No"
                                type="number"
                                size="small"
                                //helperText="Auto next available number"
                                sx={{ bgcolor: "#fff" }}
                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>Invoice Date *</Typography>
                            <TextField
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
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>Customer Name *</Typography>
                            <TextField
                                fullWidth
                                placeholder="Enter customer name"
                                size="small"
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    if (errors.customerName) setErrors({ ...errors, customerName: "" });
                                }}
                                error={!!errors.customerName}
                                helperText={errors.customerName}
                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>City</Typography>
                            <TextField
                                fullWidth
                                placeholder="Enter city"
                                size="small"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>Address</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Enter address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>Notes</Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Additional notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
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
                            New Invoice
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
                                    <TableCell sx={{ fontWeight: 600, width: "100px" }}>Qty *</TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: "120px" }}>Rate *</TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: "100px" }}>Disc %</TableCell>
                                    <TableCell sx={{ fontWeight: 600, width: "120px", textAlign: "right" }}>Amount</TableCell>
                                    <TableCell sx={{ width: "50px" }}></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <ItemLookup
                                                fullWidth
                                                size="small"
                                                value={item.itemID}
                                                onChange={(e) => handleItemChange(index, "itemID", e.target.value)}
                                                sx={{ borderRadius: 2, bgcolor: '#fff', '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #e0e0e0' } }}
                                            />
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
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                placeholder="0"
                                                value={item.qty}
                                                onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                placeholder="0.00"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="number"
                                                placeholder="0"
                                                value={item.discount}
                                                onChange={(e) => handleItemChange(index, "discount", e.target.value)}
                                                InputProps={{ sx: { borderRadius: 2, bgcolor: '#fff', '& fieldset': { border: '1px solid #e0e0e0' } } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                                            ${item.amount.toFixed(2)}
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
    );
};

export default InvoiceEditor;
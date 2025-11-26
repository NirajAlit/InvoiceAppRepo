import { Alert, Box, Button, Dialog, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography, useTheme } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import api, { postData } from '../../utils/axiosintance';
import { CheckDuplicateItemName, Picture, UpdateItemPicture } from '../../api/item.service';

const ItemEditor = ({ open, close, onSaved, itemId, mode }) => {
    const theme = useTheme();
    const [form, setForm] = useState({
        itemName: "",
        description: "",
        salesRate: "",
        discountPct: "",
        updatedOn: ""
    });

    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [logo, setLogo] = useState({
        file: null,
        fileURL: null
    });
    const [errorOpen, setErrorOpen] = useState(false);
    const [apiError, setApiError] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    async function urlToBlob(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob;
    }

    useEffect(() => {
        if (mode === "edit" && itemId) {
            loadItem();
            loadItemImage();
        }
    }, [itemId]);

    const loadItemImage = async () => {
        try {
            const res = await Picture(itemId);
            let url = res.data;
            if (typeof url === "string") {
                url = url.replace(/%5C/g, "/");
                const file = await urlToBlob(url);
                setLogo({
                    file: null,
                    fileURL: window.URL.createObjectURL(file)
                });
            }
        } catch (error) {
            console.log("Error loading image:", error);
        }
    };

    const loadItem = async () => {
        try {
            const res = await api.get(`/Item/${itemId}`);
            const data = res.data;
            setForm({
                itemName: data.itemName,
                description: data.description,
                salesRate: data.salesRate,
                discountPct: data.discountPct,
                updatedOn: data.updatedOn
            });

        } catch (err) {
            console.log("Load error", err);
        }
    };

    const validateForm = () => {
        let temp = {};

        if (!form.itemName) temp.itemName = "Please enter your item name.";
        else if (errors.itemName) {
            temp.itemName = errors.itemName;
        }
        if (!form.salesRate) temp.salesRate = "Enter a valid sales rate.";

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    };

    const handleConfirm = async () => {
        setTouched({
            itemName: true,
            salesRate: true,
            discountPct: true,
        });

        if (!validateForm()) return;
        try {
            let payload = {
                itemName: form.itemName,
                description: form.description,
                salesRate: Number(form.salesRate),
                discountPct: Number(form.discountPct)
            };

            let itemID = itemId;

            if (mode === "add") {
                const res = await postData("/Item", payload);
                itemID = res.data.primaryKeyID;
            } else {
                payload = {
                    itemID: itemID,
                    updatedOn: form.updatedOn,
                    itemName: form.itemName,
                    description: form.description,
                    salesRate: Number(form.salesRate),
                    discountPct: Number(form.discountPct),
                };
                await api.put("/Item", payload);
            }

            if (itemID && (logo.file || logo.hasLogoRemove === null)) {
                const fd = new FormData();
                fd.append("ItemID", itemID);
                fd.append("File", logo.file);
                await UpdateItemPicture(fd);
            }

            setSnackbar({
                open: true,
                message: mode === "add" ? "Item added successfully!" : "Item updated successfully!",
                severity: "success"
            });

            setTimeout(() => {
                handleClose();
                if (onSaved) onSaved();
            }, 1000);


        } catch (err) {
            console.log("Save error:", err);
            setSnackbar({
                open: true,
                message: "Failed to save item!",
                severity: "error"
            });
        }
    };

    const handleClose = () => {
        setForm({
            itemName: "",
            description: "",
            salesRate: "",
            discountPct: "",
            updatedOn: ""
        });
        setLogo({
            file: null,
            fileURL: null
        })
        close();
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    const handleRemoveLogo = (e) => {
        e.stopPropagation();
        setLogo({
            hasLogoRemove: null,
            file: null,
            fileURL: null
        });
    };

    const handleErrorClose = () => setErrorOpen(false);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileSizeMB = file.size / (1024 * 1024);
        const validTypes = ["image/png", "image/jpeg"];

        if (!validTypes.includes(file.type)) {
            setApiError("Only PNG and JPG image formats are allowed.");
            setErrorOpen(true);
            return;
        }

        if (fileSizeMB > 5) {
            setApiError("Logo size must be between 2 MB and 5 MB.");
            setErrorOpen(true);
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = () => {
            setLogo({
                file: file,
                fileURL: fileReader.result
            });
        };
        fileReader.readAsDataURL(file);
    };

    const checkDuplicate = async (value) => {
        try {
            const res = await CheckDuplicateItemName(value, mode === "edit" ? itemId : 0);
            if (res.data === true) {
                setErrors(prev => ({ ...prev, itemName: "This item name already exists." }));
            } else {
                setErrors(prev => ({ ...prev, itemName: "" }));
            }

        } catch (err) {
            setErrors(prev => ({ ...prev, itemName: "This item name already exists." }));
        }
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={(event, reason) => {
                    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
                    handleClose();
                }}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        maxHeight: '90vh'
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>

                    {/* Left Side - Image Upload */}
                    <Box sx={{
                        width: { xs: '100%', md: '40%' },
                        bgcolor: '#f8f9fa',
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: { md: '1px solid #eee' },
                        position: 'relative'
                    }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, alignSelf: 'flex-start', fontWeight: 600, letterSpacing: 0.5 }}>
                            IMAGE
                        </Typography>

                        <Box
                            component="label"
                            sx={{
                                width: '100%',
                                aspectRatio: '1/1',
                                borderRadius: 3,
                                border: `2px dashed ${logo.fileURL ? 'transparent' : '#e0e0e0'}`,
                                bgcolor: logo.fileURL ? 'transparent' : '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    bgcolor: '#fff',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />

                            {logo.fileURL ? (
                                <>
                                    <img
                                        src={logo.fileURL}
                                        alt="item_preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        bgcolor: 'rgba(0,0,0,0.4)',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': { opacity: 1 }
                                    }}>
                                        <CloudUploadIcon sx={{ color: '#fff', fontSize: 32 }} />
                                    </Box>
                                    <IconButton
                                        onClick={handleRemoveLogo}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            bgcolor: 'white',
                                            '&:hover': { bgcolor: '#ffebee', color: 'error.main' }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </>
                            ) : (
                                <>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: '50%',
                                        bgcolor: 'primary.light',
                                        color: 'primary.main',
                                        mb: 2,
                                        opacity: 0.1
                                    }}>
                                        <AddPhotoAlternateIcon sx={{ fontSize: 40 }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                                        Click to upload image
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        PNG, JPG up to 5MB
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* Right Side - Form */}
                    <Box sx={{
                        width: { xs: '100%', md: '60%' },
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h5" fontWeight="700" sx={{ color: '#1a1a1a' }}>
                                {mode === 'add' ? 'Add Item' : 'Edit Item'}
                            </Typography>
                            <IconButton onClick={handleClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Box>


                        <Grid item xs={12}>
                            {/* <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                DETAILS
                            </Typography> */}
                            <TextField
                                label="Item Name"
                                required
                                name="itemName"
                                placeholder="Enter Item Name"
                                fullWidth
                                value={form.itemName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setForm({ ...form, itemName: value });
                                    setErrors(prev => ({ ...prev, itemName: "" }));
                                    checkDuplicate(value);
                                }}
                                error={touched.itemName && !!errors.itemName}
                                helperText={touched.itemName && errors.itemName}
                                onBlur={handleBlur}
                                InputProps={{
                                    sx: { borderRadius: 2, bgcolor: '#f8f9fa', '& fieldset': { border: 'none' } }
                                }}
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 50,
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <TextField
                                label="Description"
                                multiline
                                rows={4}
                                name="description"
                                placeholder="Product description..."
                                fullWidth
                                value={form.description}
                                onChange={handleChange}
                                InputProps={{
                                    sx: { borderRadius: 2, bgcolor: '#f8f9fa', '& fieldset': { border: 'none' } }
                                }}
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 500,
                                    }
                                }}
                            />
                        </Grid>


                        <Grid item xs={12} md={6} pt={2}>
                            {/* <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                PRICING
                            </Typography> */}
                            <TextField
                                label="Slaes Rate"
                                required
                                name="salesRate"
                                placeholder="0.00"
                                fullWidth
                                value={form.salesRate}
                                error={touched.salesRate && !!errors.salesRate}
                                helperText={touched.salesRate && errors.salesRate}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (/^\d*\.?\d*$/.test(value)) {
                                        setForm({ ...form, salesRate: value });
                                    }
                                }}
                                onBlur={() => {
                                    setTouched({ ...touched, salesRate: true });
                                    let value = form.salesRate;
                                    if (value === "" || value === null) {
                                        setForm({ ...form, salesRate: "" });
                                        return;
                                    }
                                    const num = parseFloat(value);
                                    if (!isNaN(num)) {
                                        setForm({ ...form, salesRate: num.toFixed(2) });
                                    }
                                }}
                                // InputProps={{
                                //     htmlInput: { maxLength: 15 },
                                //     startAdornment: (<InputAdornment position="start">$</InputAdornment>),
                                //     sx: { borderRadius: 2, bgcolor: '#f8f9fa', '& fieldset': { border: 'none' } }
                                // }}
                                slotProps={{
                                    htmlInput: { maxLength: 10 },
                                    input: {
                                        sx: {
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            MozAppearance: 'textfield',
                                            borderRadius: 2, bgcolor: '#f8f9fa', '& fieldset': { border: 'none' }
                                        },
                                        inputMode: 'decimal',
                                        startAdornment: (<InputAdornment position="start">$</InputAdornment>),
                                    }
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} pt={1}>
                            {/* <Typography variant="caption" fontWeight="600" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                DISCOUNT
                            </Typography> */}
                            <TextField
                                label="Discount"
                                name="discountPct"
                                placeholder="0"
                                fullWidth
                                value={form?.discountPct}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                                        if (value === "") {
                                            setForm({ ...form, discountPct: "" });
                                            return;
                                        }
                                        const num = parseFloat(value);
                                        if (!isNaN(num) && num <= 100) {
                                            setForm({ ...form, discountPct: value });
                                        }
                                    }
                                }}

                                slotProps={{
                                    htmlInput: { maxLength: 7 },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">%</InputAdornment>
                                        )
                                    },
                                    sx: { borderRadius: 2, bgcolor: '#f8f9fa', '& fieldset': { border: 'none' } }
                                }}
                            />
                        </Grid>






                        <Box sx={{ mt: 'auto', pt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                onClick={handleClose}
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
                                onClick={handleConfirm}
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
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Dialog>

            <Snackbar
                open={errorOpen}
                autoHideDuration={4000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleErrorClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {apiError}
                </Alert>
            </Snackbar>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default ItemEditor

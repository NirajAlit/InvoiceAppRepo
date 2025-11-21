import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormHelperText, Grid, IconButton, InputAdornment, Snackbar, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close';
import api, { postData } from '../../utils/axiosintance';
import { CheckDuplicateItemName, Picture, UpdateItemPicture } from '../../api/item.service';

const maxImageSizeLength = 1 * 1024 * 1024;
const ItemEditor = ({ open, close, onSaved, itemId, mode }) => {

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
            // duplicate error present
            temp.itemName = errors.itemName;
        }
        if (!form.salesRate) temp.salesRate = "Enter a valid rate.";


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

    const handleRemoveLogo = () => {
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

        // 🔹 Type Validation
        if (!validTypes.includes(file.type)) {
            setApiError("Only PNG and JPG image formats are allowed.");
            setErrorOpen(true);
            return;
        }

        // 🔹 Size Validation (2–5 MB)
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


            >
                <DialogTitle>
                    Add Item
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        //color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>


                <DialogContent>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            border: "1px solid #ccc",
                            padding: "8px",
                            borderRadius: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 90,
                                height: 90,
                                border: "1px solid #ddd",
                                borderRadius: 1,
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#fff",
                            }}
                        >

                            {logo.fileURL ? (
                                <img
                                    src={logo.fileURL}
                                    alt="item_image"
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />

                            ) : (
                                <Typography variant="caption">No Image</Typography>
                            )}
                        </Box>

                        <Button variant="contained" component="label">
                            Upload
                            <input
                                hidden
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                        </Button>

                        {logo.fileURL && (
                            <>
                                <Button color="error" onClick={handleRemoveLogo}>
                                    Remove
                                </Button>
                            </>
                        )}

                    </Box>
                    <Grid py={1}>
                        <TextField
                            required
                            name="itemName"
                            label="Item"
                            fullWidth
                            size="small"
                            value={form.itemName}
                            onChange={(e) => {
                                const value = e.target.value;
                                setForm({ ...form, itemName: value });

                                // clear old error
                                setErrors(prev => ({ ...prev, itemName: "" }));

                                // call duplicate check
                                checkDuplicate(value);
                            }}
                            error={touched.itemName && !!errors.itemName}
                            onBlur={handleBlur}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 50,
                                }
                            }}
                        />
                        <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                            {touched.itemName && errors.itemName}
                        </FormHelperText>
                    </Grid>

                    <Grid py={1}>
                        <TextField
                            multiline
                            maxRows={6}
                            minRows={3}
                            name="description"
                            label="Description"
                            fullWidth
                            size="small"
                            value={form.description}
                            onChange={handleChange}
                            slotProps={{
                                htmlInput: {
                                    maxLength: 500,
                                }
                            }}
                        />
                    </Grid>



                    <Grid container spacing={1}>

                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                name="salesRate"
                                label="Sale Rate"
                                fullWidth
                                size="small"
                                value={form.salesRate}
                                error={touched.salesRate && !!errors.salesRate}
                                onChange={(e) => {
                                    let value = e.target.value;
                                    // Allow only digits + optional decimal
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
                                slotProps={{
                                    htmlInput: { maxLength: 15 },
                                    input: {
                                        sx: {
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            MozAppearance: 'textfield',
                                        },
                                        inputMode: 'decimal',
                                        startAdornment: (<InputAdornment position="start">$</InputAdornment>),
                                    }
                                }}
                            />



                            <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                                {touched.salesRate && errors.salesRate}
                            </FormHelperText>

                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                name="discountPct"
                                label="Discount %"
                                fullWidth
                                size="small"
                                value={form?.discountPct}
                                onChange={(e) => {
                                    let value = e.target.value;

                                    // Allow only digits + optional one decimal
                                    if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {

                                        // If field empty → allow empty
                                        if (value === "") {
                                            setForm({ ...form, discountPct: "" });
                                            return;
                                        }

                                        // Convert to number correctly
                                        const num = parseFloat(value);

                                        // Allow 0–100 including 100.0 / 100 / 100.
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
                                    }
                                }}
                            />



                        </Grid>
                    </Grid>

                </DialogContent>
                <DialogActions sx={{ display: "flex", justifyContent: "center" }}>

                    <Button variant='contained' onClick={handleConfirm} color="success" autoFocus>
                        Save
                    </Button>
                    <Button variant='contained' onClick={handleClose}>Cancel</Button>
                </DialogActions>
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

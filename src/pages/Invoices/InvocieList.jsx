import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    TextField,
    InputAdornment,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    ToggleButton,
    ToggleButtonGroup,
    Pagination,
    Select,
    MenuItem,
    FormControl,
    Chip,
    Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from '../../utils/axiosintance';
import { GetMetrics, GetTopItems, GetTrend } from '../../api/invoice.service';
import dayjs from 'dayjs';

const InvoiceList = () => {
    const [dateFilter, setDateFilter] = useState('today');
    const handleDateFilterChange = (event, newAlignment) => {
        if (newAlignment !== null) {
            setDateFilter(newAlignment);
        }
    };


    const [topItems, setTopItems] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedItemID, setSelectedItemID] = useState(null);
    const [editorMode, setEditorMode] = useState("add");
    const [showItemEditor, setShowItemEditor] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const GetTopItemsData = async () => {
        try {
            const res = await GetTopItems(5)
            const processedData = res?.data.map((item, index) => ({
                id: item.itemID,
                value: item.amountSum,
                label: item.itemName,
                color: item.itemName === 'Others' ? '#141212ff' : ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'][index % 6]
            }));
            setTopItems(processedData);
        } catch (error) {
            console.error("Failed to fetch top items:", error);
        }
    }

    useEffect(() => {
        GetMetricsData();
        GetTrendData();
        GetTopItemsData();
        GetInvoiceData();

    }, []);

    const GetInvoiceData = async () => {
        try {
            const res = await api.get("/Invoice/GetList");
            setRows(res.data);
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
        }
    }

    const [Trend12m, setTrend12m] = useState([]);

    const GetTrendData = async () => {
        try {
            const AsofDate = dayjs().format('YYYY-MM-DD');

            const res = await GetTrend(AsofDate);
            setTrend12m(res.data);
        } catch (error) {
            console.error("Failed to fetch trend:", error);
        }
    }
    const [Metrics, setMetrics] = useState([]);

    const GetMetricsData = async () => {
        debugger
        try {
            const fromDate = dayjs().format('YYYY-MM-DD');
            const toDate = dayjs().format('YYYY-MM-DD');

            const res = await GetMetrics(fromDate, toDate)
            debugger
            setMetrics(res.data);
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
        }
    }

    return (
        <Box sx={{ p: 3, bgcolor: '#f8f9fa', }}>
            {/* Header */}
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="700" sx={{ color: '#1a1a1a' }}>
                    Invoices
                </Typography>
                <ToggleButtonGroup
                    value={dateFilter}
                    exclusive
                    onChange={handleDateFilterChange}
                    aria-label="date filter"
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        '& .MuiToggleButtonGroup-grouped': {
                            border: 'none',
                            borderRadius: '50px !important',
                            px: 3,
                            py: 0.75,
                            bgcolor: '#fff',
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                            '&:hover': {
                                bgcolor: '#f5f5f5',
                            },
                            '&.Mui-selected': {
                                bgcolor: '#1a1a1a',
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: '#333',
                                }
                            }
                        }
                    }}
                >
                    <ToggleButton value="today">Today</ToggleButton>
                    <ToggleButton value="week">Week</ToggleButton>
                    <ToggleButton value="month">Month</ToggleButton>
                    <ToggleButton value="year">Year</ToggleButton>
                    <ToggleButton value="custom">Custom</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Count Card */}
                <Grid sx={{ width: '15%' }} item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h4" fontWeight="500" sx={{ color: '#1a1a1a', mb: 1 }}>
                            {Metrics[0]?.invoiceCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            Number of Invoices
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            Today
                        </Typography>
                    </Paper>
                </Grid>

                {/* Amount Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h4" fontWeight="500" sx={{ color: '#1a1a1a', mb: 1 }}>
                            {Metrics[0]?.totalAmount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight="500">
                            Total Invoice Amount
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            Today
                        </Typography>
                    </Paper>
                </Grid>

                {/* Line Chart Placeholder */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ mb: 2, display: 'block' }}>
                            Last 12 Months
                        </Typography>
                        <Box sx={{
                            height: 100,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <LineChart
                                xAxis={[{
                                    data: Trend12m.map(item => dayjs(item.monthStart).format('MMM')),
                                    scaleType: 'point',
                                }]}
                                series={[
                                    {
                                        data: Trend12m.map(item => item.amountSum),
                                        area: true,
                                        color: '#b44d4dff',
                                        showMark: false,
                                        valueFormatter: (value, context) => {
                                            if (context.dataIndex != null) {
                                                const item = Trend12m[context.dataIndex];
                                                return `$${value.toLocaleString()} (Count: ${item?.invoiceCount || item?.count || 0})`;
                                            }
                                            return `$${value}`;
                                        }
                                    },
                                ]}
                                height={100}
                                width={680}
                                margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                sx={{
                                    '.MuiLineElement-root': {
                                        strokeWidth: 2,
                                    },
                                    '.MuiAreaElement-root': {
                                        fillOpacity: 0.05,
                                    },
                                    // Hide axes for cleaner look in mini-card
                                    // '.MuiChartsAxis-bottom .MuiChartsAxis-line': { display: 'none' },
                                    // '.MuiChartsAxis-bottom .MuiChartsAxis-tick': { display: 'none' },
                                    // '.MuiChartsAxis-left .MuiChartsAxis-line': { display: 'none' },
                                    // '.MuiChartsAxis-left .MuiChartsAxis-tick': { display: 'none' },
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Pie Chart Placeholder */}
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 1, borderRadius: 3, height: '100%' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ mb: 2, display: 'block' }}>
                            Top 5 Items
                        </Typography>
                        <Box sx={{
                            height: 100,
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <PieChart
                                series={[
                                    {
                                        data: topItems,
                                        innerRadius: 30,
                                        outerRadius: 45,
                                        paddingAngle: 2,
                                        cornerRadius: 4,
                                        valueFormatter: (item) => {

                                            return `$${item?.value}`;
                                        },
                                    },
                                ]}
                                height={100}
                                width={200}
                                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                                slotProps={{ legend: { hidden: true } }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'end', mb: 3, gap: 2 }}>
                {/* <TextField
                    placeholder="Search Invoice No, Customer..."
                    variant="outlined"
                    size="small"
                    sx={{
                        width: 300,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: '#fff',
                            borderRadius: 2,
                            '& fieldset': { border: '1px solid #e0e0e0' },
                            '&:hover fieldset': { border: '1px solid #bdbdbd' },
                        }
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: 'text.disabled' }} />
                            </InputAdornment>
                        ),
                    }}
                /> */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        disableElevation
                        sx={{
                            bgcolor: '#1a1a1a',
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 2,
                            '&:hover': { bgcolor: '#333' }
                        }}
                    >
                        New Invoice
                    </Button>
                    {/* <Button
                        variant="outlined"
                        startIcon={<FileDownloadOutlinedIcon />}
                        sx={{
                            color: '#1a1a1a',
                            borderColor: '#e0e0e0',
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#fff',
                            '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bdbdbd' }
                        }}
                    >
                        Export
                    </Button> */}
                    {/* <Button
                        variant="outlined"
                        startIcon={<ViewColumnOutlinedIcon />}
                        sx={{
                            color: '#1a1a1a',
                            borderColor: '#e0e0e0',
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#fff',
                            '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bdbdbd' }
                        }}
                    >
                        Columns
                    </Button> */}
                </Box>
            </Box>

            {/* DataGrid */}
            <Paper elevation={0} sx={{ borderRadius: 3, mb: 3, bgcolor: '#fff', overflow: 'hidden' }}>
                <DataGrid
                    showToolbar
                    // rows={invoices}
                    rows={rows}
                    getRowId={(row) => row.invoiceID}
                    columns={[
                        { field: 'invoiceNo', headerName: 'Invoice No', flex: 1, minWidth: 150, headerClassName: 'super-app-theme--header' },
                        {
                            field: 'invoiceDate',
                            headerName: 'Date',
                            flex: 1,
                            minWidth: 120,
                            headerClassName: 'super-app-theme--header',
                            valueFormatter: (params) => dayjs(params).format('DD-MMM-YYYY')
                        },
                        { field: 'customerName', headerName: 'Customer', flex: 1.5, minWidth: 180, headerClassName: 'super-app-theme--header' },
                        { field: 'totalItems', headerName: 'Items', type: 'number', flex: 0.5, minWidth: 80, headerClassName: 'super-app-theme--header' },
                        {
                            field: 'subTotal', headerName: 'Sub Total', type: 'number', flex: 1, minWidth: 120,
                            valueFormatter: (params) => `$${params?.toFixed(2)}`,
                            headerClassName: 'super-app-theme--header'
                        },
                        {
                            field: 'taxPercentage',
                            headerName: 'Tax %',
                            type: 'number',
                            flex: 0.5,
                            minWidth: 80,
                            valueFormatter: (params) => params?.toFixed(2),
                            headerClassName: 'super-app-theme--header'
                        },
                        {
                            field: 'taxAmount',
                            headerName: 'Tax Amt',
                            type: 'number',
                            flex: 1,
                            minWidth: 120,
                            valueFormatter: (params) => `$${params?.toFixed(2)}`,
                            headerClassName: 'super-app-theme--header'
                        },
                        {
                            field: 'invoiceAmount',
                            headerName: 'Total',
                            type: 'number',
                            flex: 1,
                            minWidth: 120,
                            valueFormatter: (params) => `$${params?.toFixed(2)}`,
                            headerClassName: 'super-app-theme--header',

                        },
                        // {
                        //     field: 'actions',
                        //     headerName: 'Actions',
                        //     sortable: false,
                        //     width: 150,
                        //     headerClassName: 'super-app-theme--header',
                        //     renderCell: (params) => (
                        //         <Box>
                        //             <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                        //                 <EditOutlinedIcon fontSize="small" />
                        //             </IconButton>
                        //             <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'info.main' } }}>
                        //                 <PrintOutlinedIcon fontSize="small" />
                        //             </IconButton>
                        //             <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        //                 <DeleteOutlineOutlinedIcon fontSize="small" />
                        //             </IconButton>
                        //         </Box>
                        //     ),
                        // },
                        {
                            field: "actions",
                            headerName: "Actions",
                            width: 120,
                            flex: 0,
                            sortable: false,
                            renderCell: (params) => (
                                <Stack direction="row" spacing={1}>
                                    <IconButton color="primary">
                                        <EditIcon fontSize="small" onClick={() => {
                                            setSelectedItemID(params.row.invoiceID)
                                            setEditorMode("edit");
                                            setShowItemEditor(true);

                                        }} />

                                    </IconButton>
                                    <IconButton color="error">
                                        <DeleteIcon fontSize="small" onClick={() => {
                                            setSelectedItemID(params.row.invoiceID)
                                            setOpenDialog(true)
                                        }
                                        }
                                        />
                                    </IconButton>
                                </Stack>
                            ),
                        },
                    ]}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[5, 10, 20]}

                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        '& .super-app-theme--header': {
                            backgroundColor: '#fff',
                            color: 'text.secondary',
                            fontWeight: 600,
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f0f0f0',
                            color: 'text.secondary',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderBottom: '1px solid #f0f0f0',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#fafafa',
                        }
                    }}
                />
            </Paper>
        </Box>
    );

}
export default InvoiceList;

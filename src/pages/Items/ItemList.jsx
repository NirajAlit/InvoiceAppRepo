import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Button, Stack, TextField, Typography, IconButton, Snackbar, Alert, Grid } from "@mui/material";
import api from "../../utils/axiosintance";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import AlertDialog from "../../components/ConfirmDialog";
import ConfirmDialog from "../../components/ConfirmDialog";
import ItemEditor from "./ItemEditor";
import { PictureThumbnail } from "../../api/item.service";


export default function ItemList() {

  const [errorOpen, setErrorOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [rows, setRows] = useState([]);
  const [editorMode, setEditorMode] = useState("add");
  const [selectedItemID, setSelectedItemID] = useState(null);
  const [openDialog, setOpenDialog] = useState(false)

  //// Show Editor
  const [ShowItemEditor, setShowItemEditor] = useState(false)
  const showEditor = () => {
    setShowItemEditor(!ShowItemEditor)
  }

  const closeEditor = () => (
    setSelectedItemID(null),
    setEditorMode("add"),
    setShowItemEditor(!ShowItemEditor)
  )



  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    id: false,
    updatedByUserName: false,
    createdOn: false,
    updatedOn: false,

    createdByUserName: false// 👈 id column hidden
  });

  useEffect(() => {
    getData();
  }, []);

  const handleItemSaved = () => {
    getData();   // Refresh grid
    setShowItemEditor(false); // Close popup
  }


  const getData = async () => {
    const res = await api.get("/Item/GetList");
    const finalRows = [];

    for (let item of res.data) {
      let thumb = await PictureThumbnail(item.itemID); // <-- use let, not const

      // Extract URL based on API response format
      if (thumb?.url) thumb = thumb.url;
      else if (thumb?.data) thumb = thumb.data;
      else if (Array.isArray(thumb)) thumb = thumb[0];
      else if (typeof thumb !== "string") thumb = null;

      // Sanitize URL
      if (thumb) {
        thumb = thumb.replace(/%5C/g, "/");
      }

      finalRows.push({
        ...item,
        id: item.itemID,
        thumbnailUrl: thumb
      });
    }

    setRows(finalRows);
  };


  const DeleteData = async () => {

    if (openDialog) {

      try {
        await api.delete(`/Item/${selectedItemID}`);
        // Refresh list
        setOpenDialog(false)
        getData();
      } catch (error) {
        console.error("Delete failed:", error);
        const msg = error.response.data;
        if (msg) {
          setApiError(msg)
        }

      }
    }

  };

  const handleErrorClose = () => setErrorOpen(false);





  const columns = [
    {

      field: "picture",
      headerName: "Picture",
      sortable: false,
      field: "picture",
      headerName: "Picture",
      width: 120,
      maxWidth: 120,
      flex: 0,

      renderCell: (params) => {

        return (
          <Box
            sx={{
              p: 2,
              width: 60,
              height: 60,
              borderRadius: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {params.row.thumbnailUrl ? (
              <img
                src={params.row.thumbnailUrl}
                alt="thumb"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <ImageIcon />
            )}
          </Box>
        )
      },
    },
    {
      field: "itemName",
      headerName: "Item Name",
      flex: 1,
      width: 500,
      // maxWidth: 200, // column shrink nahi hoga

      sortable: true,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "salesRate",
      headerName: "Sale Rate",
      width: 150,
      maxWidth: 140, // column shrink nahi hoga
      flex: 0,
      renderCell: (params) => `$${params.value?.toFixed(2)}`,
    },
    {
      field: "discountPct",
      headerName: "Discount %",
      width: 120,
      renderCell: (params) => `${params.value?.toFixed(2)}%`,
    },

    {
      field: "createdByUserName",
      headerName: "Created By",
      width: 150,

    },
    {
      field: "createdOn",
      headerName: "Created On",
      width: 160,

      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleString("en-IN")
          : "-",
    },
    {
      field: "updatedByUserName",
      headerName: "Updated By",
      width: 150,

      renderCell: (params) => params.value || "-",
    },
    {
      field: "updatedOn",
      headerName: "Updated On",
      width: 160,

      renderCell: (params) =>
        params.value
          ? new Date(params.value).toLocaleString("en-IN")
          : "-",
    },
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
              setSelectedItemID(params.row.itemID)
              setEditorMode("edit");
              setShowItemEditor(true);

            }} />

          </IconButton>
          <IconButton color="error">
            <DeleteIcon fontSize="small" onClick={() => {
              setSelectedItemID(params.row.itemID)
              setOpenDialog(true)
            }
            }
            />
          </IconButton>
        </Stack>
      ),
    },
  ];
  return (
    <>
      <Box sx={{ p: 1, maxWidth: "100%", }}>
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Grid container spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              Items
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Manage your product and service catalog.
              </Typography>

            </Typography>
          </Grid>

          <Grid>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
              onClick={showEditor}
            >
              Add New Item
            </Button>

          </Grid>

        </Box>

        <hr />
        {/* ACTIONS & SEARCH BAR */}
        {/* <Stack
          direction="row"
          justifyContent="end"
          alignItems="center"
          sx={{ mb: 2 }}
        >

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 2 }}
              onClick={showEditor}
            >
              Add New Item
            </Button>
          </Stack>
        </Stack> */}

        {/* DATAGRID */}
        <Box sx={{ height: "800px", maxHeight: '60vh', width: "100%", background: "#ffffffff" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            // pageSize={10}
            // rowsPerPageOptions={[10]}
            // pagination={false}

            hideFooter
            showToolbar={true}
            columnVisibilityModel={columnVisibilityModel}
          />
        </Box>

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

        <ConfirmDialog
          openDialog={openDialog}
          closeDialog={setOpenDialog}
          Titile="Invoice"
          Message="Are you sure you want to delete this item?"
          onConfirm={DeleteData}

        ></ConfirmDialog>

        {ShowItemEditor && (
          <ItemEditor
            open={ShowItemEditor}
            close={closeEditor}
            onSaved={handleItemSaved}
            itemId={selectedItemID}
            mode={editorMode}    // "add" or "edit"
          >
          </ItemEditor>
        )}
      </Box>




    </>

  );
}

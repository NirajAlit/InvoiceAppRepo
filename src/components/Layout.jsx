import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Button,
  Container,
  CssBaseline,
  Toolbar,
  Divider,
  ListItemIcon,
  Menu
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { styled, useTheme } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Avatar, MenuItem } from "@mui/material";

import {
  DashboardCustomize,
  ContactPage,
  InvertColorsTwoTone,
  ReceiptLong,
  Inventory,
} from "@mui/icons-material";
import { GetCompanyLogoThumbnailUrl } from "../api/companylogo.service";
import LogoutIcon from '@mui/icons-material/LogoutOutlined'

const drawerWidth = 300;

/* ------------ Drawer Open / Close Style ------------ */
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: "hidden"
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  }
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar
}));

/* ------------ FIXED & CLEAN APPBAR ------------ */
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),

  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

/* ------------ Drawer Component ------------ */
const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open"
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme)
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme)
  })
}));

/* ======================================================= */
/* ====================== MAIN LAYOUT ==================== */
/* ======================================================= */

export default function Layout({ children }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const handleLogout = () => {

    window.location.href = "/login";
    navigate("/login");
    localStorage.removeItem("token");
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const company = JSON.parse(localStorage.getItem("company"));
    if (company.companyID) {

      GetCompanyLogoThumbnailUrl(company.companyID).then((res) => {
        setLogoUrl(res.data); // YOUR API RESPONSE FIELD
      });
    }
  }, []);


  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const userEmail = localStorage.getItem("email");

  const getEmailLetters = () => {
    const company = JSON.parse(localStorage.getItem("company"));
    if (!company) return "";

    const namePart = company.companyName?.trim() || "";
    return namePart.slice(0, 2).toUpperCase();
  };


  return (
    <>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <CssBaseline />

            {/* ---------------------- APPBAR ---------------------- */}
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ position: "relative" }}>

            {/* LEFT MENU BUTTON */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setOpen(true)}
              sx={{ ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>

            {/* CENTER TITLE */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontWeight: 600
              }}
            >
              Invoice App
            </Typography>


            <Box sx={{ marginLeft: "auto" }}>
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  p: 0,
                  borderRadius: "50%",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
                  },
                }}
              >
                <Avatar
                  src={logoUrl || ""}
                  alt="User"
                  sx={{
                    width: 40,
                    height: 40,
                    background: "linear-gradient(135deg, #2196F3, #21CBF3)",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {!logoUrl && getEmailLetters()}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    padding: 1,
                    //mt: 1.5,
                    minWidth: 160,
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "#ffffffff",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  },
                }}
              >

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    borderRadius: "12px",
                    py: 1.5,
                    fontSize: "14px",
                    display: "flex",
                    gap: 1,
                    color: "#d32f2f",
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#ffbebeff",
                    },
                  }}
                >
                  <LogoutIcon fontSize="small" />
                  Logout
                </MenuItem>

              </Menu>
            </Box>


          </Toolbar>

        </AppBar>
        

        {/* ---------------------- DRAWER ---------------------- */}
        <Drawer variant="permanent" open={open}>
         
          <DrawerHeader>
            <IconButton onClick={() => setOpen(false)}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>

          <Divider />
         <List>
          {[
            { text: "Home", icon: <DashboardCustomize />, path: "/Home" },
            { text: "Items", icon: <Inventory />, path: "/Items" },
            { text: "Invoices", icon: <ReceiptLong />, path: "/Invoices" },
          ].map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  ...(location.pathname === item.path && {
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    "&:hover": { backgroundColor: theme.palette.primary.dark },
                  }),
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    justifyContent: "center",
                    mr: open ? 3 : "auto",
                    color: "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        </Drawer>

        {/* ---------------------- MAIN CONTENT ---------------------- */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            backgroundColor: "#e9eef6",
            overflow: "auto"   // <-- Important (children adjust)
          }}
        >
          <DrawerHeader />
          {children}
        </Box>
      </Box>
    </>
  );
}
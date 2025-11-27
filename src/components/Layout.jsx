
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  CssBaseline,
  Toolbar,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  Tooltip
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import MuiDrawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import {
  DashboardCustomize,
  ReceiptLong,
  Inventory,
  Settings,
  Person
} from "@mui/icons-material";
import { GetCompanyLogoThumbnailUrl } from "../api/companylogo.service";

const drawerWidth = 280;

/* ------------ STYLED COMPONENTS ------------ */

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0, // For temporary drawer or closed permanent
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0, // We'll handle layout with flexbox instead of margin for better responsiveness
    }),
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backdropFilter: "blur(6px)",
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  color: theme.palette.text.primary,
  boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.05)",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100 % - ${ drawerWidth }px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 2),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

/* ======================================================= */
/* ====================== MAIN LAYOUT ==================== */
/* ======================================================= */

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");

  // Auto-close drawer on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = () => {
    window.location.href = "/login";
    navigate("/login");
    localStorage.removeItem("token");
  };

  useEffect(() => {
    const company = JSON.parse(localStorage.getItem("company"));
    if (company?.companyID) {
      GetCompanyLogoThumbnailUrl(company.companyID).then((res) => {
        setLogoUrl(res.data);
      });
    }
  }, []);

  const handleAvatarClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const getEmailLetters = () => {
    const company = JSON.parse(localStorage.getItem("company"));
    if (!company) return "U";
    const namePart = company.companyName?.trim() || "";
    return namePart.slice(0, 2).toUpperCase();
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardCustomize />, path: "/Home" },
    { text: "Items", icon: <Inventory />, path: "/Items" },
    { text: "Invoices", icon: <ReceiptLong />, path: "/Invoices" },
  ];

  const drawerContent = (
    <>
      <DrawerHeader sx={{ backgroundColor: "#115293", color: "white" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
                sx={{ 
                    width: 32, 
                    height: 32, 
                    bgcolor: 'white', 
                    borderRadius: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#115293',
                    fontWeight: 'bold'
                }}
            >
                IA
            </Box>
            <Typography variant="h6" fontWeight="bold" noWrap>
            Invoice App
            </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                    navigate(item.path);
                    if (isMobile) setOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  minHeight: 48,
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.15)" : "transparent",
                  color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "#4fc3f7" : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.95rem'
                    }} 
                />
                {isActive && (
                    <Box 
                        sx={{ 
                            width: 4, 
                            height: 4, 
                            borderRadius: '50%', 
                            bgcolor: '#4fc3f7',
                            ml: 1
                        }} 
                    />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Box sx={{ p: 2 }}>
        <Box 
            sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
            }}
        >
            <Avatar 
                src={logoUrl || ""} 
                sx={{ width: 40, height: 40, bgcolor: '#4fc3f7' }}
            >
                {!logoUrl && getEmailLetters()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="subtitle2" color="white" noWrap>
                    {JSON.parse(localStorage.getItem("company"))?.companyName || "User"}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.5)" noWrap>
                    Admin
                </Typography>
            </Box>
        </Box>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      
      {/* ---------------------- APPBAR ---------------------- */}
      <AppBar position="fixed" open={open && !isMobile} elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && !isMobile && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ color: 'text.primary', fontWeight: 600 }}>
             {menuItems.find(item => location.pathname.startsWith(item.path))?.text || "Dashboard"}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
                onClick={handleAvatarClick}
                size="small"
                sx={{
                    ml: 2,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                }}
            >
                <Avatar
                    src={logoUrl || ""}
                    sx={{
                        width: 36,
                        height: 36,
                        bgcolor: theme.palette.primary.main,
                        fontSize: "0.9rem",
                    }}
                >
                    {!logoUrl && getEmailLetters()}
                </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: 3,
                overflow: "hidden",
                "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1.5,
                    gap: 1.5
                }
              },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <Person fontSize="small" color="action" />
                Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
                <Settings fontSize="small" color="action" />
                Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <LogoutIcon fontSize="small" />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* ---------------------- DRAWER ---------------------- */}
      <MuiDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
            keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#0d3c6e", // Dark blue theme
            color: "white",
            borderRight: "none",
            boxShadow: "4px 0 24px rgba(0,0,0,0.1)"
          },
        }}
      >
        {drawerContent}
      </MuiDrawer>

      {/* ---------------------- MAIN CONTENT ---------------------- */}
      <Main open={open && !isMobile}>
        <DrawerHeader />
        <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
            {children}
        </Box>
      </Main>
    </Box>
  );
}
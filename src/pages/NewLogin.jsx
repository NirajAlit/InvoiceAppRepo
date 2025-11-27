import React, { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Typography,
    Link,
    Grid,
    InputAdornment,
    IconButton,
    Snackbar,
    Alert,
    Paper,
    useTheme,
    useMediaQuery,
    Fade
} from "@mui/material";
import { publicApi } from "../utils/axiosintance";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useFormik } from "formik";
import * as Yup from 'yup'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NewLogin = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State for password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Snackbar State
    const [state, setState] = useState({
        open: false,
        vertical: 'top',
        horizontal: 'right',
    });
    const { vertical, horizontal, open } = state;

    // Error State
    const [apiError, setApiError] = useState("");
    const [errorOpen, setErrorOpen] = useState(false);

    const handleErrorClose = () => setErrorOpen(false);
    const handleClose = () => setState({ ...state, open: false });

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();


    const LoginSchemma = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string()
  .required("Password is required")
  .min(8, "Minimum 8 characters required")
  .matches(/[A-Z]/, "At least one uppercase letter required")
  .matches(/[a-z]/, "At least one lowercase letter required")
  .matches(/[0-9]/, "At least one number required")
  .matches(/[@$!%*?#&]/, "At least one special character required"),


    })

    const formik = useFormik({
        initialValues: {
            email: "",
            password: ""
        },        
        validationSchema: LoginSchemma,
        onSubmit: async (values) => {
            debugger
            try {
                const res = await publicApi.post("/Auth/Login", {
                    email: values.email,
                    password: values.password,
                    rememberMe: false,
                });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                localStorage.setItem("company", JSON.stringify(res.data.company));
                localStorage.setItem("companyID", JSON.stringify(res.data.company.companyID));
                setState({ ...state, open: true });

                setTimeout(() => {
                    window.location.href = "/Home";
                }, 800); // Slightly longer delay for user to see success message

            } catch (err) {
                const msg = err.response?.data || "Something went wrong";
                setApiError(msg);
                setErrorOpen(true);
            }
        }
    });

    return (
        <Grid container component="main" sx={{ height: '90vh', overflow: 'hidden', p: 2, display: "flex", justifyContent: "center" }}>
            {/* Left Panel: Visual & Branding */}
            <Grid
                item
                xs={false}
                sm={4}
                md={7}
                sx={{
                    position: 'relative',
                    backgroundImage: 'url(https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(17, 82, 147, 0.9) 0%, rgba(5, 25, 55, 0.8) 100%)',
                        backdropFilter: 'blur(2px)',
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: 4,
                        color: 'white',
                        textAlign: 'center',
                        maxWidth: '600px'
                    }}
                >
                    <Typography
                        variant="h2"
                        component="h1"
                        fontWeight="700"
                        sx={{
                            mb: 2,
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Welcome to InvoiceApp
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, mb: 4 }}>
                        Manage your business finances with clarity and precision.
                        Streamlined invoicing for modern professionals.
                    </Typography>

                    {/* Glassmorphism Card Element */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 4,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            display: 'inline-block',
                            maxWidth: '80%'
                        }}
                    >
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "Simplicity is the ultimate sophistication."
                        </Typography>
                    </Paper>
                </Box>
            </Grid>

            {/* Right Panel: Login Form */}
            <Grid
                item
                xs={12}
                sm={8}
                md={5}
                component={Paper}
                elevation={6}
                square
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff'
                }}
            >
                <Box
                    sx={{
                        my: 8,
                        mx: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: '450px',
                    }}
                >
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography component="h1" variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                            Sign In
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Enter your credentials to access your account
                        </Typography>
                    </Box>

                    <Box component="form" noValidate onSubmit={formik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3 }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#115293',
                                        borderWidth: 2,
                                    },
                                },
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 3 }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#115293',
                                        borderWidth: 2,
                                    },
                                },
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
                            <Link href="#" variant="body2" sx={{ color: '#115293', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                Forgot password?
                            </Link>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 1,
                                mb: 3,
                                py: 1.5,
                                borderRadius: 3,
                                backgroundColor: '#115293',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                boxShadow: '0 4px 14px 0 rgba(17, 82, 147, 0.39)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: '#0d3c6e',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 6px 20px 0 rgba(17, 82, 147, 0.23)',
                                }
                            }}
                        >
                            Sign In
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link href="/signup" sx={{ color: '#115293', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                                    Sign Up Now
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Grid>

            {/* Success Snackbar */}
            <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={handleClose}
                anchorOrigin={{ vertical, horizontal }}
            >
                <Alert onClose={handleClose} severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    Login successful! Redirecting...
                </Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar
                open={errorOpen}
                autoHideDuration={3000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleErrorClose} severity="error" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
                    {apiError}
                </Alert>
            </Snackbar>
        </Grid>
    );
};

export default NewLogin;

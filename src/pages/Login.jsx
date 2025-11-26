import React, { useState } from "react";
import { TextField, Button, Box, Typography, Container, FormControlLabel, Checkbox, Link, Grid, Divider, Switch, Paper, InputAdornment, IconButton, Snackbar, Alert } from "@mui/material";
import api, { postData, publicApi } from "../utils/axiosintance";

import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validatePassword = (value) => {
    if (value.length < 8) {
        return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
        return "Password must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(value)) {
        return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return "Password must contain at least one special character";
    }
    return "";
};


export default function Login() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const [emailError, setEmailError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [state, setState] = React.useState({
        open: false,
        vertical: 'top',
        horizontal: 'right',
    });
    const { vertical, horizontal, open } = state;
    const handleClose = () => {
        setState({ ...state, open: false });
    };
    const handleClick = (newState) => () => {
        setState({ ...newState, open: true });
    };


    /// Error Handle


    const [apiError, setApiError] = useState("");
    const [errorOpen, setErrorOpen] = useState(false);

    const handleErrorClose = () => setErrorOpen(false);
    /// 


    const handleLogin = async () => {
        if (!email && !password) {
            return;
        }
        try {
            const res = await publicApi.post("/Auth/Login", {
                email,
                password,
                rememberMe: false,
            });

            // SUCCESS
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("company", JSON.stringify(res.data.company));
            localStorage.setItem("companyID", JSON.stringify(res.data.company.companyID));

            setState({ ...state, open: true });

            setTimeout(() => {
                window.location.href = "/Home";
            }, 150);

        } catch (err) {
            console.log("API Error:", err);
            const msg = err.response.data;
            if (msg) {
                //setApiError("Invalid Email or Password")
                setApiError(msg)

            }

            setErrorOpen(true);
        }
    };



    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        const errorMsg = validatePassword(value);
        setPasswordError(errorMsg);
    };

    return (

        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                backgroundColor: "#115293",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
            }}
        >
            <Grid
                container
                direction={{ xs: "column", md: "row" }}
                sx={{
                    width: { xs: "100%", sm: "90%", md: "auto" },
                    maxWidth: "1100px",
                    backgroundColor: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: 3,
                }}
            >

                <Snackbar
                    open={errorOpen}
                    autoHideDuration={3000}
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


                <>
                    <Snackbar
                        severity="success"
                        variant="filled"
                        anchorOrigin={{ vertical, horizontal }}
                        open={open}
                        onClose={handleClose}
                        message="Login successful"
                        key={vertical + horizontal}
                        autoHideDuration={2000}


                    >
                        <Alert
                            onClose={handleClose}
                            severity="success"
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            Login successful
                        </Alert>
                    </Snackbar>
                </>
                {/* Left Panel: Image */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: { xs: "white", md: "#ffffffff" },
                        p: 2,
                    }}
                >
                    <img
                        //src="https://play-lh.googleusercontent.com/YrtnyOQ23OacTv4t4G9a9G5LjlZJyhlWM7ZI7A90rxH32d9Qn7Hv5MogQ11_Zn4gvLOIWELqIpv-8jzV0kuuUuc"
                        src="https://img.lovepik.com/photo/50044/1196.jpg_wh860.jpg"
                        alt="User"

                        style={{
                            width: '90%',
                            maxWidth: '250px',
                            height: "auto",
                            borderRadius: 16,
                            marginBottom: 24,
                            objectFit: 'cover',
                            backgroundRepeat: "no-repeat"
                        }}
                    />
                </Grid>

                {/* Right Panel: Login Form */}

                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                    }}
                >
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 2 }, width: "100%", maxWidth: 400, borderRadius: 3 }}>
                        <Box pb={"1em"}>
                            <Typography component="h1" variant="h5" display={"flex"} justifyContent={"center"} >
                                Welcome
                            </Typography>
                        </Box>

                        <TextField
                            required
                            label="Email"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={email}
                            onChange={handleEmailChange}
                            error={emailError !== ""}
                            helperText={emailError}
                            sx={{ mb: 3 }}
                        />
                        {/* <TextField
                            required
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 1 }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        /> */}
                        <TextField
                            required
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={password}
                            onChange={handlePasswordChange}
                            error={passwordError !== ""}
                            helperText={passwordError}
                            sx={{ mb: 1 }}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'end', mb: 2 }}>

                            <Box sx={{ display: 'flex', alignItems: 'end' }}>

                                <Link href="#" underline="hover" variant="body2" color="primary">
                                    Forgot password?
                                </Link>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ py: 1.3, mb: 2, borderRadius: 2 }}
                            onClick={handleLogin}
                        >
                            Log in
                        </Button>

                        <Divider>OR</Divider>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2">
                                Don’t have an account?{' '}
                                <Link href="/signup" color="primary" underline="hover">
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>

    );
}

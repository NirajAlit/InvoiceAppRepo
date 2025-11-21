import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Snackbar,
  Alert,
  Divider,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signupAPI } from "../api/signup.service";
import { publicApi } from "../utils/axiosintance";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedCurrencySymbols = ["₹", "$", "€", "£", "¥", "₩", "₱", "฿", "₽"];
const validatePassword = (value) => {
  let haserror = false;

  if (value.length < 8) {
    haserror = true;
  }
  if (!/[A-Z]/.test(value)) {
    haserror = true;
  }
  if (!/[0-9]/.test(value)) {
    haserror = true;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    haserror = true;
  }
  if (haserror) {
    return `Password must be at least 8 characters long and include at least one uppercase letter one number, and one special character.`
  }
  return "";
};

export default function SignupForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    address: "",
    city: "",
    zipCode: "",
    industry: "",
    currencySymbol: "",
  });

  const [errors, setErrors] = useState({});
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState({});
  const [logo, setLogo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState(false);

  // ---------------- INPUT CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleZipChange = (e) => {
    let value = e.target.value;
    // sirf digits allow
    value = value.replace(/\D/g, "");
    // max 6 digits
    value = value.slice(0, 6);

    setForm((prev) => ({
      ...prev,
      zipCode: value,
    }));
  };


  const handleCurrencyChange = (e) => {
    let value = e.target.value;

    // Sirf currency symbols allow
    value = [...value]               // split characters
      .filter((ch) => allowedCurrencySymbols.includes(ch))
      .join("");

    // maxLength = 5
    value = value.slice(0, 5);

    setForm((prev) => ({ ...prev, currencySymbol: value }));
  };


  const handleEmailChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, email: value });

    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email");
    } else {
      setEmailError("");
    }
  };


  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, password: value })

    const errorMsg = validatePassword(value);
    setErrors({ ...errors, password: errorMsg });
  };




  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  // ---------------- VALIDATION ----------------
  const validateForm = () => {
    let temp = {};
    
    if (!form.firstName) temp.firstName = "Please enter your first name.";
    if (!form.lastName) temp.lastName = "Please enter your last name.";
    if (!form.email) temp.email = "Enter a valid email address.";
    else if (emailError) temp.email = emailError;

    if (!form.password) temp.password = "Password must be at least 8 characters long and include at least one uppercase letter, one number, and one special character.";
    else if (errors.password) temp.password = errors.password;
    if (!form.companyName) temp.companyName = "Please enter your company name.";
    if (!form.address) temp.address = "Please enter company address.";

    if (!form.city) temp.city = "Please enter city.";


    if (!form.zipCode) temp.zipCode = "“Zip must be exactly 6 digits.";
    if (!form.currencySymbol) temp.currencySymbol = "Enter a valid currency symbol.";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // ---------------- SUBMIT ----------------
  const handleSignup = async () => {

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      companyName: true,
      address: true,
      city: true,
      zipCode: true,
      industry: true,
      currencySymbol: true,
    });

    if (!validateForm()) return;

    try {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        fd.append(key, form[key]);
      });

      if (logo) fd.append("logo", logo);

      const res = await signupAPI(fd);
      
      if (res) {
        setSnackbar(true);

        const response = await publicApi.post("/Auth/Login", {
        email: form.email,
        password: form.password,
          rememberMe: true,
        });

        // SUCCESS
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("company", JSON.stringify(response.data.company));
        localStorage.setItem("companyID", JSON.stringify(response.data.company.companyID));       

        setTimeout(() => {
          window.location.href = "/Home";
        }, 80);
      }
    } catch (err) {
      console.log(err);

      

      // Error Message from interceptor
      const msg = err.response.data;
      if (msg) {
        setApiError(msg)
      }
      //setApiError(msg);
      setErrorOpen(true);

      //alert("Something went wrong");
    }
  };

  /// API Error

  const [apiError, setApiError] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  const handleErrorClose = () => setErrorOpen(false);

  ///End API Error
  const handleLogoUpload = (e) => {
    
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024); // Convert to MB
    const validTypes = ["image/png", "image/jpeg"]; // PNG + JPG/JPEG allowed

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

    setLogo(file);
  };


  return (
    
    <Grid
      sx={{
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#115293",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          height: "auto",
          maxHeight: "fit-content",


          mx: "auto",
          p: 3,
          borderRadius: 2,
          border: "1px solid #ddd",
          mt: 3,
          backgroundColor: "#ffffff",
        }}
      >

        {/* Title */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" fontWeight={600}>
            Create Your Account
          </Typography>

          <Typography sx={{ fontSize: "12px" }} variant="subtitle1">
            Set up your Company and Start invoicing in minutes.
          </Typography>
        </Box>

        {/* ---------------------- 2 COLUMN LAYOUT ---------------------- */}
        <Grid container spacing={4} mt={2}>

          {/* ---------------- LEFT COLUMN: USER INFO ---------------- */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" mb={1}>
              User Information
            </Typography>

            {/* 🔹 Your existing user form code pasted inside */}
            {/* -------------------------------------------------------- */}
            <Stack spacing={1}>
              {/* First / Last Name */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {/* first name */}
                  <TextField
                    required
                    name="firstName"
                    label="First Name"
                    fullWidth
                    size="small"
                    value={form.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && !!errors.firstName}
                    slotProps={{
                      htmlInput: {
                        maxLength: 50,
                      },
                    }}

                  />
                  <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                    {touched.firstName && errors.firstName}
                  </FormHelperText>
                </Grid>

                <Grid item xs={12} md={6}>
                  {/* last name */}
                  <TextField
                    required
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    size="small"
                    value={form.lastName}
                    error={touched.lastName && !!errors.lastName}
                    onChange={handleChange}

                    slotProps={{
                      htmlInput: {
                        maxLength: 50,
                      },
                    }}
                  />
                  <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                    {touched.lastName && errors.lastName}
                  </FormHelperText>

                </Grid>
              </Grid>

              {/* Email */}
              <TextField
                required
                name="email"
                label="Email"
                fullWidth
                size="small"
                value={form.email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                error={touched.email && !!errors.email}
                sx={{ mt: 2 }}
                slotProps={{
                  htmlInput: {
                    maxLength: 50,
                  },
                }}
              />
              <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                {touched.email && errors.email}
              </FormHelperText>


              {/* Password */}
              <TextField
                required
                name="password"
                label="Password"
                fullWidth
                size="small"
                value={form.password}
                // onChange={handleChange}
                onChange={handlePasswordChange}
                onBlur={handleBlur}
                type={showPassword ? "text" : "password"}
                error={touched.password && !!errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),

                  },
                  htmlInput: {
                    maxLength: 50,
                  },

                }}


              />
              <FormHelperText
                sx={{
                  minHeight: "1px",
                  color: "red",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >

                {touched.password && errors.password}
              </FormHelperText>
            </Stack>
          </Grid>

          {/* ---------------- RIGHT COLUMN: COMPANY INFO ---------------- */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" mb={1}>
              Company Information
            </Typography>

            {/* 🔹 Your existing company form code pasted inside */}
            {/* -------------------------------------------------------- */}
            <Stack spacing={1}>             

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
                  {logo ? (
                    <img
                      src={URL.createObjectURL(logo)}
                      alt="logo_preview"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <Typography variant="caption">No Logo</Typography>
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

                {logo && (
                  <Button color="error" onClick={handleRemoveLogo}>
                    Remove
                  </Button>
                )}
              </Box>


              {/* Company Name */}
              <TextField
                required
                name="companyName"
                label="Company Name"
                fullWidth
                size="small"
                value={form.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.companyName && !!errors.companyName}
                slotProps={{
                  htmlInput: {
                    maxLength: 50,
                  }
                }

                }
              />
              <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                {touched.companyName && errors.companyName}
              </FormHelperText>

              {/* Address */}
              <TextField
                required
                name="address"
                label="Address"
                fullWidth
                size="small"
                value={form.address}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 200,
                  }
                }}
              />
              <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                {touched.city && errors.city}
              </FormHelperText>



              {/* City */}
              <TextField
                required
                name="city"
                label="City"
                fullWidth
                size="small"
                value={form.city}
                onChange={handleChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 50,
                  }
                }}
              />
              <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                {touched.city && errors.city}
              </FormHelperText>


              {/* Zip + Industry */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    required
                    name="zipCode"
                    label="Zip Code"
                    fullWidth
                    size="small"
                    value={form.zipCode}
                    onChange={handleZipChange}
                    // slotProps={{
                    //   htmlInput: {
                    //     maxLength: 6,
                    //     inputMode: "numeric",       
                    //     pattern: "[0-9]*",           
                    //   }
                    // }}
                    slotProps={{
                      htmlInput: { maxLength: 6, },
                      input: {
                        sx: {
                          '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                          MozAppearance: 'textfield',
                        },
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      },
                    }}

                  />
                  <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                    {touched.zipCode && errors.zipCode}
                  </FormHelperText>

                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    name="industry"
                    label="Industry"
                    fullWidth
                    size="small"
                    value={form.industry}
                    onChange={handleChange}
                    slotProps={{
                      htmlInput: {
                        maxLength: 50,
                      }
                    }}
                  />

                </Grid>
              </Grid>

              {/* Currency Symbol */}
              <TextField
                required
                name="currencySymbol"
                label="Currency Symbol"
                fullWidth
                size="small"
                value={form.currencySymbol}
                //onChange={handleChange}
                onChange={handleCurrencyChange}
                onBlur={handleBlur}
                error={touched.currencySymbol && !!errors.currencySymbol}
                slotProps={{
                  htmlInput: {
                    maxLength: 5,
                  }
                }}

              />
              <FormHelperText sx={{ minHeight: "1px", color: "red" }}>
                {touched.currencySymbol && errors.currencySymbol}
              </FormHelperText>

            </Stack>
          </Grid>

        </Grid>
        <hr />
        {/* SIGNUP BUTTON + LOGIN */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 2, py: 1.2, alignItems: "end", display: "flex", justifyContent: "end" }}
            onClick={handleSignup}
          >
            SIGN UP
          </Button>
        </Box>


        <Typography variant="body2" sx={{ textAlign: "center", mt: 0 }}>
          Already have an account?{" "}
          <Button variant="text" onClick={() => (window.location.href = "/login")}>
            Login
          </Button>
        </Typography>

        {/* Snackbar */}
        <Snackbar
          open={snackbar}
          autoHideDuration={2000}
          onClose={() => setSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="success" variant="filled">
            Signup Successful!
          </Alert>
        </Snackbar>
        <>
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
        </>

      </Box>
    </Grid>

  );
}

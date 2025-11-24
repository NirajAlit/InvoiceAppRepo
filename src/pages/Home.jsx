import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import api from "../utils/axiosintance";

import ShareIcon from "@mui/icons-material/Share";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import { SupervisedUserCircleOutlined } from "@mui/icons-material";
import ComminSoonImage from "../assets/image (16).png";

const fetchItems = async () => {
  const res = await api.get("/items"); // अपनी API endpoint के हिसाब से बदलो
  return res.data;
};

export default function Home() {
  //const { data, isLoading, isError, error } = useQuery(["items"], fetchItems);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        width: '100%',
        textAlign: 'center',
        //bgcolor: '#f8f9fa',
        borderRadius: 2,
        p: 4
      }}
    >
      <img
        src={ComminSoonImage}
        alt="Coming Soon"
        style={{ maxWidth: '400px', width: '100%', marginBottom: '24px', borderRadius: '16px' }}
      />
      <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
        Dashboard Coming Soon!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
        We are working hard to build an amazing dashboard for you. Stay tuned for updates!
      </Typography>
    </Box>
  );
}

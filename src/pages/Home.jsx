import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, CircularProgress, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import api from "../utils/axiosintance";

import ShareIcon from "@mui/icons-material/Share";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import StarIcon from "@mui/icons-material/Star";
import { SupervisedUserCircleOutlined } from "@mui/icons-material";

const fetchItems = async () => {
  const res = await api.get("/items"); // अपनी API endpoint के हिसाब से बदलो
  return res.data;
};

export default function Home() {
  //const { data, isLoading, isError, error } = useQuery(["items"], fetchItems);

  return (
    <Grid container spacing={2}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3,
        }}
      >
        {/* Earning Card */}
        <Card
          sx={{
            width: '350px',
            height: 150,
            bgcolor: "#0C3559",
            color: "#fff",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2">Total</Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>$ 628</Typography>
        </Card>

        {/* Share Card */}
        <Card
          sx={{
            width: '350px',
            height: 150,
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            User <SupervisedUserCircleOutlined sx={{ color: "#ff9800" }} />
          </Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>
            2434
          </Typography>
        </Card>

        {/* Likes Card */}
        <Card
          sx={{
            width: '350px',
            height: 150,
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            Likes <ThumbUpIcon sx={{ color: "#ff9800" }} />
          </Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>
            1259
          </Typography>
        </Card>

        {/* Rating Card */}
        <Card
          sx={{
            width: '350px',
            height: 150,
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            Rating <StarIcon sx={{ color: "#ffb300" }} />
          </Typography>
          <Typography variant="h5" sx={{ mt: 1 }}>
            8.5
          </Typography>
        </Card>
      </Box>
    </Grid>
  );
}

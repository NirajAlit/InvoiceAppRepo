import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { IconButton } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
export default function ConfirmDialog({ openDialog, Titile, Message, onConfirm, closeDialog }) {
  
  const handleClose = () => {
    closeDialog(false);
  };

  const handleConfirm = () => {
    onConfirm();        // parent function ko call karega
    closeDialog(false); // dialog close
  };

  return (
    <Dialog
      open={openDialog}
      onClose={handleClose}
    >
      <DialogTitle bgcolor={"#4380cf"}>{Titile}</DialogTitle>
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

      <DialogContent >
        <DialogContentText textAlign={"center"} sx={{ margin: 2 }}>

          {Message}</DialogContentText>
      </DialogContent>

      <DialogActions>

        <Button variant='outlined' onClick={handleConfirm} color="error" autoFocus>
          Yes
        </Button>
        <Button variant='outlined' onClick={handleClose}>No</Button>
      </DialogActions>
    </Dialog>
  );
}

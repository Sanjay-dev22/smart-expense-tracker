import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  Alert
} from '@mui/material';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', type: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setAlert({ message: 'You are not logged in.', type: 'error' });
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setName(res.data.name);
    } catch (err) {
      setAlert({ message: 'Failed to load profile', type: 'error' });
    }
  };

  const handleNameUpdate = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/profile/name`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data.user);
      setAlert({ message: 'Name updated successfully!', type: 'success' });
    } catch (err) {
      setAlert({ message: err.response?.data?.message || 'Failed to update name', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/profile/password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ message: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setAlert({ message: err.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="outlined" href="/">
          Back to Dashboard
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mt: 2, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          👤 Profile Dashboard
        </Typography>

        {alert.message && (
          <Alert severity={alert.type} sx={{ mb: 2 }}>
            {alert.message}
          </Alert>
        )}

        <TextField
          label="Name"
          fullWidth
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Email"
          fullWidth
          disabled
          sx={{ mb: 2 }}
          value={profile.email}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleNameUpdate}
          disabled={loading}
          fullWidth
        >
          Update Name
        </Button>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          🔐 Change Password
        </Typography>

        <TextField
          label="Current Password"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <TextField
          label="New Password"
          type="password"
          fullWidth
          sx={{ mb: 2 }}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Button
          variant="outlined"
          color="secondary"
          onClick={handlePasswordUpdate}
          disabled={loading}
          fullWidth
        >
          Change Password
        </Button>
      </Paper>
    </Container>
  );
};

export default Profile;



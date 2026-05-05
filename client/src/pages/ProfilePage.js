import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Panel from '../components/ui/Panel';
import LoadingState from '../components/ui/LoadingState';
import { getProfile, updateProfileName, updateProfilePassword } from '../services/profileService';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setName(response.data.name || '');
    } catch {
      setAlert({ type: 'error', text: 'Profile could not be loaded.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleNameUpdate = async () => {
    setSaving(true);
    try {
      const response = await updateProfileName(name);
      setProfile(response.data.user);
      setAlert({ type: 'success', text: 'Name updated.' });
    } catch (error) {
      setAlert({ type: 'error', text: error.response?.data?.message || 'Name update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setSaving(true);
    try {
      await updateProfilePassword({ currentPassword, newPassword });
      setAlert({ type: 'success', text: 'Password changed.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      setAlert({ type: 'error', text: error.response?.data?.message || 'Password change failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile" />;

  return (
    <Stack spacing={3} sx={{ maxWidth: 960 }}>
      <Stack spacing={0.5}>
        <Typography variant="h2">Account settings</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage profile identity and account security.
        </Typography>
      </Stack>

      {alert && <Alert severity={alert.type} onClose={() => setAlert(null)}>{alert.text}</Alert>}

      <Panel title="Profile" eyebrow="Identity">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Name" fullWidth value={name} onChange={(event) => setName(event.target.value)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Email" fullWidth disabled value={profile.email || ''} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={handleNameUpdate} disabled={saving}>
              Update profile
            </Button>
          </Grid>
        </Grid>
      </Panel>

      <Panel title="Security" eyebrow="Password">
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Use a strong password you do not reuse across financial tools.
          </Typography>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Current password" type="password" fullWidth value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="New password" type="password" fullWidth value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" startIcon={<LockResetOutlinedIcon />} onClick={handlePasswordUpdate} disabled={saving}>
                Change password
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Panel>
    </Stack>
  );
}

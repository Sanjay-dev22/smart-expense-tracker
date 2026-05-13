import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import Panel from '../components/ui/Panel';
import LoadingState from '../components/ui/LoadingState';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { getProfile, updateProfileName, updateProfilePassword } from '../services/profileService';

export default function ProfilePage() {
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const { toast, showToast, closeToast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
      setName(response.data.name || '');
    } catch {
      const message = 'Profile could not be loaded.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleNameUpdate = async () => {
    setSaving(true);
    try {
      const response = await updateProfileName(name);
      setProfile(response.data.user);
      setAlert({ type: 'success', text: 'Name updated.' });
      showToast('Name updated.');
    } catch (error) {
      const message = error.response?.data?.message || 'Name update failed.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setSaving(true);
    try {
      await updateProfilePassword({ currentPassword, newPassword });
      setAlert({ type: 'success', text: 'Password changed.' });
      showToast('Password changed.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed.';
      setAlert({ type: 'error', text: message });
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile" />;

  return (
    <>
      <Stack spacing={3} sx={{ maxWidth: 960 }}>
        <Stack spacing={0.5}>
          <Typography variant="h2">Account</Typography>
          <Typography variant="body1" color="text.secondary">
            Update your profile and password.
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
              Choose a password that is hard to guess and not reused elsewhere.
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
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}

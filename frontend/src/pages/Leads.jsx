import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PreviewRoundedIcon from '@mui/icons-material/PreviewRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'

import { apiGet, apiPost, apiPut } from '../api/client'

const STATUSES = ['New', 'Interested', 'Converted', 'Rejected']

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso || '-'
  }
}

function LeadForm({ value, onChange, disabled = false }) {
  const set = (key) => (e) => onChange({ ...value, [key]: e.target.value })

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Box>
          <TextField
            label="Name"
            fullWidth
            value={value.name}
            onChange={set('name')}
            disabled={disabled}
            required
          />
        </Box>
        <Box>
          <TextField
            label="Mobile"
            fullWidth
            value={value.mobile}
            onChange={set('mobile')}
            disabled={disabled}
            required
            helperText="Digits only (optionally start with +)"
          />
        </Box>
        <Box>
          <TextField
            label="Email"
            fullWidth
            value={value.email}
            onChange={set('email')}
            disabled={disabled}
            required
          />
        </Box>
        <Box>
          <TextField
            label="City"
            fullWidth
            value={value.city}
            onChange={set('city')}
            disabled={disabled}
            required
          />
        </Box>
        <Box>
          <TextField
            label="Service"
            fullWidth
            value={value.service}
            onChange={set('service')}
            disabled={disabled}
            required
          />
        </Box>
        <Box>
          <TextField
            label="Budget"
            type="number"
            fullWidth
            value={value.budget}
            onChange={set('budget')}
            disabled={disabled}
            required
            inputProps={{ min: 0, step: 1 }}
          />
        </Box>
        <Box sx={{ gridColumn: '1 / -1' }}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              value={value.status}
              onChange={set('status')}
              disabled={disabled}
              required
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Box>
  )
}

export default function Leads() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [result, setResult] = useState({ leads: [], total: 0, page: 1, limit: 25 })

  const [dialog, setDialog] = useState({ open: false, mode: 'create', id: null })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const emptyLead = useMemo(
    () => ({
      name: '',
      mobile: '',
      email: '',
      city: '',
      service: '',
      budget: '',
      status: 'New',
    }),
    [],
  )

  const [form, setForm] = useState(emptyLead)

  const fetchLeads = async (page = 1, limit = 25) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet('/api/leads', { page, limit })
      setResult(res)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setForm(emptyLead)
    setDialog({ open: true, mode: 'create', id: null })
  }

  const openView = (lead) => {
    setForm({
      name: lead.name || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      city: lead.city || '',
      service: lead.service || '',
      budget: lead.budget ?? '',
      status: lead.status || 'New',
    })
    setDialog({ open: true, mode: 'view', id: lead._id })
  }

  const openEdit = (lead) => {
    setForm({
      name: lead.name || '',
      mobile: lead.mobile || '',
      email: lead.email || '',
      city: lead.city || '',
      service: lead.service || '',
      budget: lead.budget ?? '',
      status: lead.status || 'New',
    })
    setDialog({ open: true, mode: 'edit', id: lead._id })
  }

  const closeDialog = () => setDialog((d) => ({ ...d, open: false }))

  const canSubmit = dialog.mode === 'create' || dialog.mode === 'edit'

  const submit = async () => {
    try {
      const payload = {
        ...form,
        budget: form.budget === '' ? 0 : Number(form.budget),
      }

      if (dialog.mode === 'create') {
        await apiPost('/api/leads', payload)
      } else if (dialog.mode === 'edit') {
        await apiPut(`/api/leads/${dialog.id}`, payload)
      } else {
        return
      }

      closeDialog()
      fetchLeads(result.page, result.limit)
      setSnack({
        open: true,
        message: dialog.mode === 'create' ? 'Lead added successfully' : 'Lead updated successfully',
        severity: 'success',
      })
    } catch (e) {
      setSnack({
        open: true,
        message: e.message || String(e),
        severity: 'error',
      })
    }
  }

  const statusColor = (status) => {
    if (status === 'Converted') return 'success'
    if (status === 'Interested') return 'info'
    if (status === 'Rejected') return 'error'
    return 'default'
  }

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLowerCase()
    return result.leads.filter((lead) => {
      const matchStatus = statusFilter === 'All' || lead.status === statusFilter
      if (!matchStatus) return false
      if (!term) return true
      return [lead.name, lead.email, lead.mobile, lead.city, lead.service]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    })
  }, [result.leads, search, statusFilter])

  return (
    <Box>
      <Card
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a, #312e81)',
          color: 'white',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              Lead Management
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Create, review, and update lead pipeline quickly.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => fetchLeads(result.page, result.limit)}
            >
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>
              Add Lead
            </Button>
          </Stack>
        </Stack>
      </Card>

      <Card sx={{ p: 2, mb: 2, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search by name, email, mobile, city, service"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          />
          <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <FormControl sx={{ minWidth: 170, width: { xs: '100%', md: 'auto' } }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RestartAltRoundedIcon />}
              onClick={() => {
                setSearch('')
                setStatusFilter('All')
              }}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error" variant="h6">
            Failed to load leads
          </Typography>
          <Typography sx={{ mt: 1 }}>{error}</Typography>
        </Paper>
      ) : (
        <Card sx={{ borderRadius: 4 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleLeads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{lead.name}</TableCell>
                    <TableCell>{lead.mobile}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{lead.service}</TableCell>
                    <TableCell>{lead.budget}</TableCell>
                    <TableCell>
                      <Chip size="small" label={lead.status} color={statusColor(lead.status)} />
                    </TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<PreviewRoundedIcon />}
                        onClick={() => openView(lead)}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => openEdit(lead)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {visibleLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ py: 4, textAlign: 'center' }}>
                      No leads found for current filters/search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
            <Button
              disabled={result.page <= 1}
              onClick={() => fetchLeads(result.page - 1, result.limit)}
            >
              Prev
            </Button>
            <Typography variant="body2" sx={{ pt: 1 }}>
              Page {result.page} of {Math.max(1, Math.ceil(result.total / result.limit))}
            </Typography>
            <Button
              disabled={result.page * result.limit >= result.total}
              onClick={() => fetchLeads(result.page + 1, result.limit)}
            >
              Next
            </Button>
          </Box>
        </Card>
      )}

      <Dialog open={dialog.open} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>
          {dialog.mode === 'create'
            ? 'Add Lead'
            : dialog.mode === 'edit'
              ? 'Edit Lead'
              : 'View Lead'}
        </DialogTitle>
        <DialogContent>
          <LeadForm
            value={form}
            onChange={setForm}
            disabled={dialog.mode === 'view'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
          {canSubmit && dialog.mode !== 'view' && (
            <Button variant="contained" onClick={submit} startIcon={<EditRoundedIcon />}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}


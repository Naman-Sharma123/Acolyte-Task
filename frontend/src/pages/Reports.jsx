import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
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
  Typography,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import dayjs from 'dayjs'

import { apiGet, downloadFile } from '../api/client'

const STATUSES = ['New', 'Interested', 'Converted', 'Rejected']

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso || '-'
  }
}

export default function Reports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [options, setOptions] = useState({ cities: [], services: [], statuses: STATUSES })

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    city: '',
    status: '',
    service: '',
  })

  const [result, setResult] = useState({ leads: [], total: 0, page: 1, limit: 25 })

  const limit = 25
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' })

  const effectiveFilters = useMemo(() => {
    // Keep query clean (avoid sending empty strings)
    const f = { ...filters }
    if (!f.startDate) delete f.startDate
    if (!f.endDate) delete f.endDate
    if (!f.city) delete f.city
    if (!f.status) delete f.status
    if (!f.service) delete f.service
    return f
  }, [filters])

  const loadOptions = async () => {
    try {
      const res = await apiGet('/api/meta/options')
      setOptions(res)
    } catch {
      // Meta options are optional for the UI; fall back to empty selects.
    }
  }

  const fetchReport = async (p = 1) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet('/api/reports/leads', {
        ...effectiveFilters,
        page: p,
        limit,
      })
      setResult(res)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOptions()
    fetchReport(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onExport = async (format) => {
    try {
      await downloadFile('/api/reports/leads/export', {
        format,
        ...effectiveFilters,
      })
      setSnack({
        open: true,
        message: `${format.toUpperCase()} export downloaded`,
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

  const activeFilterCount = Object.keys(effectiveFilters).length

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      city: '',
      status: '',
      service: '',
    })
  }

  return (
    <Box>
      <Card
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f766e, #0ea5e9)',
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
              Reporting & Exports
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>
              Filter your leads and export exactly what you need.
            </Typography>
          </Box>
          <Chip
            label={`${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`}
            sx={{ bgcolor: 'rgba(255,255,255,.18)', color: 'white' }}
          />
        </Stack>
      </Card>

      <Card sx={{ p: 2, mb: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
            gap: 2,
            alignItems: 'end',
          }}
        >
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date From"
                value={filters.startDate ? dayjs(filters.startDate) : null}
                onChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    startDate: value ? value.format('YYYY-MM-DD') : '',
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 3' } }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date To"
                value={filters.endDate ? dayjs(filters.endDate) : null}
                onChange={(value) =>
                  setFilters((f) => ({
                    ...f,
                    endDate: value ? value.format('YYYY-MM-DD') : '',
                  }))
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' } }}>
            <FormControl fullWidth>
              <InputLabel id="city-label">City</InputLabel>
              <Select
                labelId="city-label"
                label="City"
                value={filters.city}
                onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {options.cities.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' } }}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {(options.statuses || STATUSES).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 2' } }}>
            <FormControl fullWidth>
              <InputLabel id="service-label">Service</InputLabel>
              <Select
                labelId="service-label"
                label="Service"
                value={filters.service}
                onChange={(e) => setFilters((f) => ({ ...f, service: e.target.value }))}
              >
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {options.services.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 4' } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterAltRoundedIcon />}
                onClick={() => {
                  fetchReport(1)
                }}
              >
                Apply Filters
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RestartAltRoundedIcon />}
                onClick={() => {
                  clearFilters()
                  fetchReport(1)
                }}
              >
                Reset
              </Button>
            </Stack>
          </Box>
          <Box sx={{ gridColumn: { xs: '1 / -1', md: 'span 8' } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent={{ xs: 'stretch', md: 'flex-end' }}
            >
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => onExport('csv')}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => onExport('xlsx')}
              >
                Export Excel
              </Button>
            </Stack>
          </Box>
        </Box>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 2 }}>
          <Typography color="error" variant="h6">
            Failed to load report
          </Typography>
          <Typography sx={{ mt: 1 }}>{error}</Typography>
        </Paper>
      ) : (
        <Card sx={{ p: 0, borderRadius: 4 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total matching leads: <b>{result.total}</b> | Page size: {result.limit}
            </Typography>
            <Chip size="small" color="secondary" label={`Page ${result.page}`} />
          </Box>

          <Box sx={{ px: 2, pb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              {Object.entries(effectiveFilters).length === 0 ? (
                <Chip label="No filters applied" size="small" variant="outlined" />
              ) : (
                Object.entries(effectiveFilters).map(([k, v]) => (
                  <Chip key={k} label={`${k}: ${v}`} size="small" />
                ))
              )}
            </Stack>
          </Box>

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
                </TableRow>
              </TableHead>
              <TableBody>
                {result.leads.map((lead) => (
                  <TableRow key={lead._id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{lead.name}</TableCell>
                    <TableCell>{lead.mobile}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.city}</TableCell>
                    <TableCell>{lead.service}</TableCell>
                    <TableCell>{lead.budget}</TableCell>
                    <TableCell>{lead.status}</TableCell>
                    <TableCell>{formatDate(lead.createdAt)}</TableCell>
                  </TableRow>
                ))}

                {result.leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ py: 4, textAlign: 'center' }}>
                      No leads match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
            <Button disabled={result.page <= 1} onClick={() => fetchReport(result.page - 1)}>
              Prev
            </Button>
            <Typography variant="body2" sx={{ pt: 1 }}>
              Page {result.page} of {Math.max(1, Math.ceil(result.total / result.limit))}
            </Typography>
            <Button
              disabled={result.page * result.limit >= result.total}
              onClick={() => fetchReport(result.page + 1)}
            >
              Next
            </Button>
          </Box>
        </Card>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={2400}
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


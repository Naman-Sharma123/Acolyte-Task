import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '../api/client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const statusColors = {
  New: '#64748b',
  Interested: '#3b82f6',
  Converted: '#10b981',
  Rejected: '#ef4444',
}

function formatNumber(n) {
  return new Intl.NumberFormat().format(n ?? 0)
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [activeStatus, setActiveStatus] = useState('All')
  const [cityChartType, setCityChartType] = useState('bar')

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const [m, ai] = await Promise.all([
        apiGet('/api/metrics'),
        apiGet('/api/ai/insights').catch(() => null),
      ])
      setMetrics(m)
      setAiInsights(ai)
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const insights = useMemo(() => {
    if (!metrics) return null
    const total = metrics.totalLeads || 0
    const converted = metrics.statusCounts?.find((s) => s.name === 'Converted')?.count || 0
    const conversionRate = total ? (converted / total) * 100 : 0
    const topCity = metrics.cityCounts?.[0]?.name
    const topService = metrics.serviceCounts?.[0]?.name

    return {
      total,
      conversionRate,
      topCity,
      topService,
    }
  }, [metrics])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="error" variant="h6">
          Failed to load dashboard
        </Typography>
        <Typography sx={{ mt: 1 }}>{error}</Typography>
      </Paper>
    )
  }

  const statusData = metrics.statusCounts || []
  const cityData = metrics.cityCounts || []
  const serviceData = metrics.serviceCounts || []
  const selectedStatusCount =
    activeStatus === 'All'
      ? metrics.totalLeads || 0
      : statusData.find((s) => s.name === activeStatus)?.count || 0

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Performance Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live snapshot of lead distribution and conversion signals.
          </Typography>
        </Box>
        <Button
          onClick={fetchMetrics}
          variant="contained"
          color="secondary"
          startIcon={<RefreshRoundedIcon />}
          sx={{ textTransform: 'none', borderRadius: 3 }}
        >
          Refresh
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          gap: 2,
          mb: 2,
        }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Total Leads
              </Typography>
              <GroupsRoundedIcon />
            </Stack>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 900 }}>
              {formatNumber(metrics.totalLeads)}
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Conversion Rate
              </Typography>
              <InsightsRoundedIcon />
            </Stack>
            <Typography variant="h3" sx={{ mt: 1, fontWeight: 900 }}>
              {(insights?.conversionRate ?? 0).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>

        <Card
          sx={{
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
            color: 'white',
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="overline" sx={{ opacity: 0.9 }}>
                Top Focus
              </Typography>
              <TravelExploreRoundedIcon />
            </Stack>
            <Typography variant="h6" sx={{ mt: 1.2, fontWeight: 800 }}>
              {insights?.topService || '-'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {insights?.topCity ? `City: ${insights.topCity}` : 'No data yet'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            transition: 'transform .2s ease, box-shadow .2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Status-wise Breakdown
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
              <Chip
                label={`All (${metrics.totalLeads || 0})`}
                color={activeStatus === 'All' ? 'secondary' : 'default'}
                onClick={() => setActiveStatus('All')}
              />
              {statusData.map((s) => (
                <Chip
                  key={s.name}
                  label={`${s.name} (${s.count})`}
                  onClick={() => setActiveStatus(s.name)}
                  color={activeStatus === s.name ? 'secondary' : 'default'}
                  variant={activeStatus === s.name ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Selected: <b>{activeStatus}</b> - {formatNumber(selectedStatusCount)} leads
            </Typography>
            <Box sx={{ height: 280, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={64}
                    outerRadius={105}
                    paddingAngle={3}
                    onClick={(entry) => setActiveStatus(entry.name)}
                  >
                    {statusData.map((entry) => {
                      const selected = activeStatus === entry.name
                      return (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={statusColors[entry.name] || '#94a3b8'}
                          stroke={selected ? '#111827' : 'transparent'}
                          strokeWidth={selected ? 2 : 0}
                        />
                      )
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        <Card
          sx={{
            borderRadius: 4,
            transition: 'transform .2s ease, box-shadow .2s ease',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Typography variant="h6">City-wise Distribution</Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={cityChartType}
                onChange={(_, value) => value && setCityChartType(value)}
              >
                <ToggleButton value="bar">Bar</ToggleButton>
                <ToggleButton value="pie">Pie</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Box sx={{ height: 280, minHeight: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                {cityChartType === 'bar' ? (
                  <BarChart data={cityData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Tooltip />
                    <Pie
                      data={cityData.slice(0, 10)}
                      dataKey="count"
                      nameKey="name"
                      outerRadius={105}
                    >
                      {cityData.slice(0, 10).map((entry, idx) => (
                        <Cell
                          key={`city-${entry.name}`}
                          fill={['#8b5cf6', '#3b82f6', '#0ea5e9', '#14b8a6', '#22c55e'][idx % 5]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                )}
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Card
        sx={{
          borderRadius: 4,
          transition: 'transform .2s ease, box-shadow .2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 6 },
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Service-wise Distribution
          </Typography>
          <Box sx={{ height: 300, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData.slice(0, 12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mt: 2,
          borderRadius: 4,
          border: '1px solid',
          borderColor: '#dbeafe',
          background: 'linear-gradient(135deg, #ffffff, #eff6ff)',
          color: '#0f172a',
        }}
      >
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <AutoAwesomeRoundedIcon color="secondary" />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              AI Insights
            </Typography>
            <Chip
              size="small"
              label={aiInsights?.model || 'heuristic-v1'}
              sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 700 }}
            />
          </Stack>
          {aiInsights?.insights?.length ? (
            <Stack spacing={1.1}>
              {aiInsights.insights.map((insight, idx) => (
                <Typography key={idx} variant="body2" sx={{ color: '#1e293b', lineHeight: 1.6 }}>
                  - {insight}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: '#334155' }}>
              AI insights are temporarily unavailable. Click refresh to retry.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}


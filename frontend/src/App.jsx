import { useMemo } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'

import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Reports from './pages/Reports'

function NavButton({ to, children }) {
  const location = useLocation()
  const isActive = useMemo(() => location.pathname === to, [location.pathname, to])

  return (
    <Button
      component={Link}
      to={to}
      color={isActive ? 'secondary' : 'inherit'}
      variant={isActive ? 'contained' : 'text'}
      sx={{ textTransform: 'none' }}
    >
      {children}
    </Button>
  )
}

function AppLayout() {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        pt: 2,
        background:
          'radial-gradient(circle at 15% 10%, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at 85% 20%, rgba(168,85,247,0.15), transparent 30%)',
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{
          mx: { xs: 1, sm: 2, md: 3 },
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(90deg, #1e3a8a 0%, #3730a3 100%)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Lead Dashboard & Reporting
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <NavButton to="/">Dashboard</NavButton>
            <NavButton to="/leads">Leads</NavButton>
            <NavButton to="/reports">Reports</NavButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<Typography>Page not found.</Typography>} />
        </Routes>
      </Container>
    </Box>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

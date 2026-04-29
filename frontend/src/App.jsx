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
    <Box sx={{ minHeight: '100svh', background: 'background.default', pt: 2 }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          mx: { xs: 1, sm: 2, md: 3 },
          borderRadius: 3,
          overflow: 'hidden',
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

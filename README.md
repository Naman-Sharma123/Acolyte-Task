# Acolyte Technologies — Lead Dashboard & Reporting

## Overview
This project is a Lead Dashboard & Reporting system built for the **ACOLYTE IT Interview Task**.

It includes:
- **Lead Management**: Add, View, Update leads (Name, Mobile, Email, City, Service, Budget, Status)
- **Dashboard**: Total leads + charts for Status, City, and Service distribution
- **Reporting System**: Filter leads by **Date Range, City, Status, Service** and display results
- **Exports (Bonus)**: Export filtered reports as **CSV** or **Excel (XLSX)**

## Tech Stack
- Backend: **Node.js (Express)** + **MongoDB (Mongoose)**
- Frontend: **React (Vite)** + **MUI** (UI) + **Recharts** (charts)

## Folder Structure
- `backend/` — REST APIs + MongoDB schema
- `frontend/` — React UI (Dashboard / Leads / Reports)

## Backend API
Base path: `/api`

### Leads
- `POST /api/leads`
  - Create a lead
- `GET /api/leads?page=&limit=`
  - List leads
- `GET /api/leads/:id`
  - View a lead
- `PUT /api/leads/:id`
  - Update a lead

### Dashboard Metrics
- `GET /api/metrics`
  - Returns:
    - `totalLeads`
    - `statusCounts[]`
    - `cityCounts[]`
    - `serviceCounts[]`

### Reporting
- `GET /api/reports/leads?startDate=&endDate=&city=&status=&service=&page=&limit=`
  - Returns filtered leads + `total`
- `GET /api/reports/leads/export?format=csv|xlsx&startDate=&endDate=&city=&status=&service=`
  - Returns a downloadable file

### Meta Options
- `GET /api/meta/options`
  - Returns distinct `cities`, `services`, and supported `statuses`

## Setup (Local)

### 1) Start MongoDB
Make sure MongoDB is running locally (default used by this repo is `mongodb://localhost:27017/acolyte_leads`).

### 2) Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

### 3) Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
Frontend runs on: `http://localhost:5173`

## Run the App
- Dashboard: `/`
- Leads: `/leads`
- Reports: `/reports`

## Deployment Guidance (for Interview)
Because the task requires a **live URL + GitHub repo**, typical deployment options are:
- Frontend: Vercel / Netlify
- Backend: Render / Railway / Fly.io / Heroku
- MongoDB: MongoDB Atlas (recommended)

If you deploy to production:
- Update `backend/.env` (use your Atlas connection string)
- Set `CORS_ORIGIN` to your frontend domain

## Optional Bonus: Python Insights
See `python/lead_insights.py` for a simple script that computes lead insights (totals, conversion rate, top city/service).

To run:
```bash
pip install pymongo
python python/lead_insights.py
```


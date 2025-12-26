# Rose-Nail-Website

A beautiful and functional booking website for Rose Nails salon.

## Features

- Elegant frontend with service listings
- Backend API for booking management
- SQLite database for storing appointments
- Duplicate booking prevention
- Race condition handling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
npm start
```

The server will run on `http://localhost:3000`

3. Open `index.html` in your browser or serve it through the backend

### Backend API Endpoints

- `POST /api/bookings` - Create a new booking
- `GET /api/check-availability?date=YYYY-MM-DD&time=HH:MM` - Check if a slot is available
- `GET /api/bookings` - Get all bookings (admin)

### How It Works

1. The frontend form collects customer information (name, phone, service, date, time)
2. When submitted, the data is sent to the backend API
3. The backend checks if the slot is already booked using a database UNIQUE constraint
4. If available, the booking is confirmed and stored
5. If already booked, the user receives an "Already booked" message
6. The UNIQUE constraint on (date, time) prevents race conditions at the database level

# Rose-Nail-Website

A beautiful and functional booking website for Rose Nails salon.

## Features

- Elegant frontend with service listings
- Backend API for booking management
- SQLite database for storing appointments
- Duplicate booking prevention with "Already booked" messaging
- Race condition handling using database constraints
- Rate limiting for API security
- Secure file serving

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

3. Open your browser and navigate to `http://localhost:3000`

### Backend API Endpoints

- `POST /api/bookings` - Create a new booking
  - Rate limited: 10 requests per 15 minutes per IP
  - Returns 409 (Conflict) if slot is already booked
- `GET /api/check-availability?date=YYYY-MM-DD&time=HH:MM` - Check if a slot is available
- `GET /api/bookings` - Get all bookings (admin)
- All API endpoints are rate limited: 100 requests per 15 minutes per IP

### How It Works

1. The frontend form collects customer information (name, phone, service, date, time)
2. When submitted, the data is sent to the backend API via POST request
3. The backend checks if the slot is already booked using a database UNIQUE constraint on (date, time)
4. If available, the booking is confirmed and stored
5. If already booked, the user receives an "Already booked" message
6. The UNIQUE constraint on (date, time) prevents race conditions at the database level

### Security Features

- **Rate Limiting**: Protects against abuse and DoS attacks
  - API endpoints: 100 requests per 15 minutes
  - Booking endpoint: 10 attempts per 15 minutes
- **Database Constraints**: UNIQUE constraint prevents duplicate bookings atomically
- **Secure Static Serving**: Only specific files are served, preventing directory traversal
- **Input Validation**: All booking fields are validated
- **Error Handling**: Proper error messages without exposing sensitive information

### Testing

Run the provided test script to verify the booking system:
```bash
./test_api.sh
```

This will test:
- Creating a new booking
- Attempting to book an already booked slot (should fail with "Already booked")
- Checking availability for booked and free slots

### Race Condition Handling

The system handles race conditions (multiple users booking the same slot simultaneously) through:
1. SQLite database UNIQUE constraint on (date, time) columns
2. Database-level atomic operations
3. Proper error handling for constraint violations

When multiple concurrent requests attempt to book the same slot, only the first one succeeds, and the rest receive a 409 Conflict response with "Already booked" message.

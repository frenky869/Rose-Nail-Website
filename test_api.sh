#!/bin/bash

# Test script for the booking backend API

echo "=========================================="
echo "Testing Rose Nail Booking Backend API"
echo "=========================================="
echo ""

# Test 1: Create a booking
echo "Test 1: Create a new booking"
echo "----------------------------"
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "+254700000000",
    "service": "Manicure",
    "date": "2025-12-30",
    "time": "09:00 AM"
  }'
echo -e "\n"

# Test 2: Try to book the same slot (should fail)
echo "Test 2: Try to book already booked slot"
echo "---------------------------------------"
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "phone": "+254711111111",
    "service": "Pedicure",
    "date": "2025-12-30",
    "time": "09:00 AM"
  }'
echo -e "\n"

# Test 3: Check availability (should be unavailable)
echo "Test 3: Check availability for booked slot"
echo "------------------------------------------"
curl "http://localhost:3000/api/check-availability?date=2025-12-30&time=09:00%20AM"
echo -e "\n"

# Test 4: Check availability (should be available)
echo "Test 4: Check availability for free slot"
echo "----------------------------------------"
curl "http://localhost:3000/api/check-availability?date=2025-12-30&time=10:00%20AM"
echo -e "\n"

echo ""
echo "=========================================="
echo "All tests completed!"
echo "=========================================="

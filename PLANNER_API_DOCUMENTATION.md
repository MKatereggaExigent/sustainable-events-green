# Planner Tier API Documentation

All endpoints require:
- Authentication: `Authorization: Bearer <access_token>`
- Subscription: Planner tier or higher

Base URL: `https://ecobserve.com/api/planner`

---

## 1. AI Recommendations

### Generate AI-Powered Recommendations
**POST** `/ai-recommendations`

Uses GPT-4 to analyze event data and suggest eco-friendly alternatives.

**Request Body:**
```json
{
  "eventId": 123,
  "inputs": {
    "venue": "Standard Conference Center",
    "catering": "Mixed menu with meat",
    "transport": "Individual cars",
    "waste": "Standard disposal"
  },
  "carbonFootprint": 5420
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "category": "venue",
        "current": "Standard Conference Center",
        "alternative": "The Green Venue - Solar-powered facility",
        "impact": "Reduce carbon by 35%",
        "costSavings": 1200,
        "reasoning": "Solar power eliminates grid electricity emissions..."
      }
    ]
  }
}
```

---

## 2. Green Score Card Certificates

### Generate Certificate
**POST** `/certificate`

Generates a PDF certificate for the event's sustainability achievements.

**Request Body:**
```json
{
  "eventId": 123,
  "eventName": "Tech Conference 2026",
  "sustainabilityScore": 85,
  "carbonSaved": 2500,
  "achievements": [
    "100% renewable energy",
    "Zero waste to landfill",
    "Carbon neutral event"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "certificateNumber": "GS-2026-001234"
  }
}
```

### Get Certificate
**GET** `/certificate/:eventId`

Retrieves certificate details and download URL.

---

## 3. Tax Incentive Calculator (South Africa)

### Calculate Tax Benefits
**POST** `/tax-incentives`

Calculates SA tax incentives based on carbon reduction and investments.

**Request Body:**
```json
{
  "eventId": 123,
  "carbonReductionKg": 2500,
  "investmentAmountZar": 50000,
  "taxYear": "2026/2027"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "section12lDeduction": 2500.00,
    "section12bAllowance": 7500.00,
    "totalTaxBenefit": 14397.50,
    "breakdown": {
      "energyEfficiencyAllowance": 2500.00,
      "renewableEnergyDeduction": 7500.00,
      "carbonTaxSavings": 4397.50
    },
    "recommendations": [
      "Qualify for Section 12L - submit to SANEDI",
      "Consider renewable energy for Section 12B"
    ]
  }
}
```

### Get Tax Incentive
**GET** `/tax-incentives/:eventId`

---

## 4. Carbon Offset Marketplace

### Browse Available Offsets
**GET** `/carbon-offsets?projectType=reforestation&maxPrice=200&certification=Gold Standard`

**Query Parameters:**
- `projectType`: reforestation, renewable_energy, blue_carbon
- `maxPrice`: Maximum price per ton (ZAR)
- `certification`: Gold Standard, VCS, etc.

**Response:**
```json
{
  "success": true,
  "data": {
    "offsets": [
      {
        "id": 1,
        "projectName": "Kruger National Park Reforestation",
        "projectType": "reforestation",
        "location": "Mpumalanga, South Africa",
        "certification": "Gold Standard",
        "pricePerTonZar": 180,
        "availableTons": 10000,
        "description": "Indigenous tree planting..."
      }
    ]
  }
}
```

### Purchase Carbon Offset
**POST** `/carbon-offsets/purchase`

**Request Body:**
```json
{
  "eventId": 123,
  "offsetId": 1,
  "tonsPurchased": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "purchaseId": 456
  }
}
```

### Get Event Purchases
**GET** `/carbon-offsets/event/:eventId`

### Get Organization Purchases
**GET** `/carbon-offsets/organization`

---

## 5. Supplier Carbon Tracking

### Search Suppliers
**GET** `/suppliers/search?q=catering&category=catering`

**Response:**
```json
{
  "success": true,
  "data": {
    "suppliers": [
      {
        "id": 1,
        "name": "Plant-Based Catering Co",
        "category": "catering",
        "location": "Durban, KwaZulu-Natal",
        "carbonScore": 95,
        "sustainabilityRating": "A+",
        "certifications": ["Organic SA", "Fair Trade"],
        "isVerified": true
      }
    ]
  }
}
```

### Get Suppliers by Category
**GET** `/suppliers/:category?minCarbonScore=80`

Categories: `venue`, `catering`, `transport`, `equipment`, `decor`

### Add Supplier to Event
**POST** `/suppliers/event`

**Request Body:**
```json
{
  "eventId": 123,
  "supplierId": 1,
  "category": "catering",
  "costZar": 15000,
  "carbonImpactKg": 450
}
```

### Get Event Suppliers
**GET** `/suppliers/event/:eventId`

---

## 6. Benchmark Comparison

### Compare with Industry
**POST** `/benchmarks/compare`

**Request Body:**
```json
{
  "eventType": "conference",
  "attendees": 150,
  "carbonPerAttendee": 38,
  "waterPerAttendee": 120,
  "wastePerAttendee": 1.8,
  "sustainabilityScore": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "yourEvent": {
      "carbonPerAttendee": 38,
      "waterPerAttendee": 120,
      "wastePerAttendee": 1.8,
      "sustainabilityScore": 75
    },
    "industryAverage": {
      "carbonPerAttendee": 42,
      "waterPerAttendee": 130,
      "wastePerAttendee": 2.2,
      "sustainabilityScore": 58
    },
    "comparison": {
      "carbonPerformance": "better",
      "carbonDifference": 9.5,
      "waterPerformance": "better",
      "waterDifference": 7.7,
      "wastePerformance": "better",
      "wasteDifference": 18.2,
      "overallRanking": "Top 25%"
    },
    "recommendations": [
      "Excellent! Your carbon footprint is below industry average."
    ]
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Status Codes:**
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (requires Planner subscription)
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

---

## Rate Limiting

- 100 requests per minute per user
- AI recommendations: 10 requests per hour (GPT API limits)

---

## Testing

Use the provided Postman collection or test with curl:

```bash
curl -X POST https://ecobserve.com/api/planner/ai-recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId": 123, "inputs": {...}, "carbonFootprint": 5420}'
```


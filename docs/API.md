# GrammarHero API Documentation

This document describes the API endpoints available in GrammarHero.

## Authentication

All authenticated endpoints require a valid Supabase session. Include the session token in cookies or the Authorization header.

## Endpoints

### Grammar Check

**POST** `/api/ai/check-grammar`

Analyzes text for grammar errors using Claude AI.

**Access**: Pro/Premium subscribers only

**Rate Limit**: 10 requests per minute

**Request Body:**
```json
{
  "text": "String (1-10000 characters)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "issues": [
      {
        "original": "He go to school",
        "correction": "He goes to school",
        "explanation": "Subject-verb agreement: third person singular requires 's'",
        "type": "Subject-Verb Agreement"
      }
    ]
  }
}
```

**Error Responses:**
- `401` - Authentication required
- `403` - Pro subscription required
- `429` - Rate limit exceeded
- `400` - Invalid input

---

### Create Checkout Session

**POST** `/api/stripe/create-checkout`

Creates a Stripe checkout session for subscription purchase.

**Access**: Authenticated users

**Rate Limit**: 3 requests per minute

**Request Body:**
```json
{
  "priceId": "price_pro_monthly" | "price_pro_yearly" | "price_premium_monthly" | "price_premium_yearly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/..."
  }
}
```

**Error Responses:**
- `401` - Authentication required
- `400` - Invalid price ID
- `429` - Rate limit exceeded
- `500` - Failed to create checkout session

---

### Stripe Webhook

**POST** `/api/stripe/webhook`

Handles Stripe webhook events for subscription management.

**Access**: Stripe only (validated via webhook signature)

**Events Handled:**
- `checkout.session.completed` - Activates subscription
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription
- `invoice.payment_succeeded` - Records successful payment
- `invoice.payment_failed` - Handles failed payment

---

## Rate Limiting

Rate limits are applied per user based on the endpoint:

| Endpoint | Limit |
|----------|-------|
| `/api/ai/*` | 10/min |
| `/api/stripe/create-checkout` | 3/min |
| `/api/auth/*` | 5/min |
| Other API routes | 100/min |

When rate limited, the response includes headers:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining
- `X-RateLimit-Reset` - Unix timestamp when limit resets

---

## Error Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

**Error Codes:**
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `VALIDATION_ERROR` - Invalid input
- `RATE_LIMITED` - Too many requests
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

---

## Security

### Headers

All API responses include security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Cache-Control: no-store, max-age=0` (for API routes)

### Input Validation

All inputs are validated using Zod schemas:
- Maximum text length: 10,000 characters
- Price IDs are whitelisted
- UUIDs are validated for format

### Rate Limiting

In-memory rate limiting prevents abuse. For production, consider using Redis for distributed rate limiting.

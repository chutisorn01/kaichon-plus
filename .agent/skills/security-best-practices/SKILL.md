---
name: security-best-practices
description: Security rules for React, Express and MongoDB applications.
---

# Security Best Practices

## Authentication

- Use JWT
- Hash passwords using bcrypt
- Never store plaintext passwords

## API Security

- Validate all inputs
- Sanitize request data
- Enable CORS correctly
- Use rate limiting

## Secrets

- Store secrets in .env
- Never commit secrets to Git

## Database

- Validate schemas
- Prevent injection attacks

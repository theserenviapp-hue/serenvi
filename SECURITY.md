# SERENVI Security Guidelines

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [Infrastructure Security](#infrastructure-security)
5. [Incident Response](#incident-response)

## Authentication & Authorization

### Password Requirements
All user passwords MUST meet these requirements:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one number (0-9)
- At least one special character (@$!%*?&)
- NOT contain username or email

**Backend Validation**: Enforced in `AuthService.register()`
**Frontend Validation**: Enforced in `RegisterDto`

### JWT Token Security
- Tokens expire after 24 hours
- Tokens are signed with HS256 algorithm only
- JWT_SECRET must be 32+ characters
- Never store tokens in localStorage - use httpOnly cookies in production
- Tokens contain: userId, distributorId, email, issued time, expiry

### API Access Control
All protected endpoints require JWT in Authorization header:
```
Authorization: Bearer <token>
```

## Data Protection

### Sensitive Data NOT Exposed in API Responses
- Phone numbers (stored but not returned in auth endpoints)
- Password hashes
- Internal database IDs (use business IDs)
- API secrets
- Database credentials

### SQL Injection Prevention
- Using Prisma ORM (parameterized queries)
- Input validation on all DTOs
- No raw SQL queries allowed

### XSS Prevention
- Input sanitization on all text fields
- Output encoding on frontend
- Content Security Policy headers enabled

### NoSQL Injection Prevention
- express-mongo-sanitize middleware enabled
- Input validation rejecting suspicious characters
- Parameterized queries via Prisma

## API Security

### Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Auth Endpoints**: 5 attempts per 15 minutes per IP
- Login failures don't reveal if user exists

### CORS Policy
- Only specified FRONTEND_URL allowed
- Credentials required
- Methods limited to GET, POST, PUT, DELETE, PATCH

### Security Headers (Helmet)
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy: strict-origin-when-cross-origin

### Input Validation
- Email: RFC 5322 compliant, normalized to lowercase
- Phone: 10-15 digits only
- Names: Only letters, spaces, hyphens, apostrophes
- UUIDs: Valid UUID v4 format only
- All inputs trimmed and validated

## Infrastructure Security

### Environment Variables
NEVER commit these to git:
- JWT_SECRET
- DATABASE_URL
- REDIS_URL
- MAIL_PASS
- Any API keys or secrets

Use `.env.example` as template, actual `.env` is in `.gitignore`

### Database Security
- Use PostgreSQL 15+
- Enable SSL connections in production
- Create separate DB user with limited permissions
- Regular backups
- Encryption at rest for sensitive tables

### Audit Logging
All sensitive operations logged:
- User registration/login
- Wallet transactions
- Commission distributions
- Data access by users
- Failed authentication attempts

Logs stored in: `logs/audit.log`

## Incident Response

### If JWT_SECRET is Compromised
1. Rotate JWT_SECRET immediately
2. Force all users to re-login
3. Review audit logs for suspicious activity
4. Check for unauthorized transactions

### If Database is Breached
1. Enable emergency maintenance mode
2. Rotate all passwords
3. Force password reset for all users
4. Review audit logs
5. Notify all users

### Rate Limiting Triggered
- IP is temporarily blocked
- Log the incident
- If legitimate user: whitelist IP
- If attack: implement additional security measures

## Security Checklist for Production Deployment

- [ ] JWT_SECRET set to strong 32+ character value
- [ ] DATABASE_URL uses SSL connection
- [ ] NODE_ENV set to "production"
- [ ] LOG_LEVEL set to "warn" (not debug)
- [ ] HTTPS enabled on all endpoints
- [ ] FRONTEND_URL correctly configured
- [ ] Firewall rules restrict database access
- [ ] Regular backups automated
- [ ] Monitoring/alerting configured
- [ ] WAF (Web Application Firewall) enabled
- [ ] Dependencies updated with: `npm audit fix`
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Encryption keys rotated
- [ ] Admin access restricted

## Regular Security Tasks

### Weekly
- Review recent audit logs
- Check npm security advisories: `npm audit`

### Monthly
- Run security scan
- Review access logs for anomalies
- Test backup restoration

### Quarterly
- Rotate JWT_SECRET
- Update all dependencies
- Penetration test (or review security)
- Security training for team

## Contact & Reporting

For security vulnerabilities:
- DO NOT post publicly
- Email: security@serenvi.com (when available)
- Include: description, impact, proof-of-concept

## Additional Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)

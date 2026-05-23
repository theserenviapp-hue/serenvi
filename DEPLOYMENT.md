# SERENVI MLM Platform - Production Deployment Guide

## Pre-Deployment Verification

### Code Quality
```bash
# Check for security vulnerabilities
npm audit

# Check for syntax errors
npm run build

# Run tests (if available)
npm test
```

### Environment Configuration
```bash
# Copy template and fill in production values
cp .env.example .env

# Verify all required variables are set
cat .env | grep -E "JWT_SECRET|DATABASE_URL|REDIS_URL|FRONTEND_URL"
```

### Database Preparation
```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data (if seed script exists)
npm run seed
```

## Deployment Steps

### 1. Backend Deployment

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build application
npm run build

# Start in production mode
npm run start

# Or with PM2 for process management
pm2 start dist/main.js --name serenvi-backend
```

### 2. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Build for production
npm run build

# Serve static files (using nginx or your hosting)
# The build folder contains static files ready to serve
```

### 3. Database Setup

```bash
# PostgreSQL 15+
createdb serenvi

# Run migrations
cd backend
npx prisma migrate deploy
```

### 4. Redis Setup (Optional but Recommended)

```bash
# Install Redis
# On Ubuntu: sudo apt-get install redis-server
# On macOS: brew install redis

# Start Redis
redis-server
# Or with systemd: systemctl start redis-server
```

## Security Hardening Checklist

- [ ] Change JWT_SECRET to production value (32+ chars)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable database SSL
- [ ] Configure backups (daily minimum)
- [ ] Set up monitoring/alerting
- [ ] Configure rate limiting thresholds
- [ ] Enable audit logging
- [ ] Test rate limiting
- [ ] Verify CORS configuration
- [ ] Test authentication flow
- [ ] Verify no console.log in production code
- [ ] Run npm audit fix
- [ ] Update all dependencies

## Monitoring & Maintenance

### Health Checks
```bash
# Backend health
curl http://localhost:3000/health

# Database connection
curl http://localhost:3000/db-health

# API test
curl -X GET http://localhost:3000/api/products
```

### Log Monitoring
```bash
# View backend logs
tail -f logs/app.log

# View audit trail
tail -f logs/audit.log

# Check for errors
grep ERROR logs/app.log
```

### Performance Monitoring
- Monitor response times
- Track API request rates
- Monitor database query times
- Track error rates
- Monitor server CPU/memory usage

## Rollback Plan

If deployment fails:
1. Stop current version: `npm stop`
2. Restore previous version from backup
3. Review error logs
4. Fix issues
5. Test in staging environment
6. Redeploy

## Post-Deployment

- [ ] Verify all endpoints working
- [ ] Test user registration/login
- [ ] Test wallet operations  
- [ ] Test commission calculations
- [ ] Verify rate limiting working
- [ ] Check security headers present
- [ ] Verify CORS working correctly
- [ ] Test database backups
- [ ] Configure monitoring alerts
- [ ] Document any custom configurations
- [ ] Train support team on system

## Maintenance Schedule

### Daily
- Monitor error logs
- Check system health
- Verify backups completed

### Weekly
- Review security logs
- Run npm audit
- Check performance metrics

### Monthly
- Rotate backups to offsite storage
- Update dependencies
- Review access logs
- Test incident response procedures

### Quarterly
- Rotate JWT_SECRET
- Security penetration test
- Update documentation
- Update dependencies
- Team security training

## Support & Emergency Contacts

- DevOps Lead: [Contact info]
- Security Lead: [Contact info]
- Database Admin: [Contact info]
- Emergency Line: [Contact info]

## Useful Commands

```bash
# View all running processes
pm2 list

# View logs
pm2 logs serenvi-backend

# Restart service
pm2 restart serenvi-backend

# Stop service
pm2 stop serenvi-backend

# Start service
pm2 start serenvi-backend

# View system status
systemctl status serenvi-backend
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed
- Verify DATABASE_URL is correct
- Check database is running
- Verify firewall allows connection
- Check credentials

### Memory Issues
- Increase Node.js heap: `node --max-old-space-size=4096 app.js`
- Monitor memory with `top` or systemd
- Implement caching with Redis

### Rate Limiting Issues
- Verify rate limiting configuration
- Check if behind proxy (may affect IP detection)
- Whitelist internal IPs if needed

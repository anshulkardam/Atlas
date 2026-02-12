# Atlas VPS Deployment Checklist

### 1. Security Requirements

- [ ] **Generate strong JWT secrets**: `openssl rand -base64 32`
- [ ] **Update database password** in all .env files
- [ ] **Update Google OAuth** to production credentials
- [ ] **Set up SSL certificates** for your domain
- [ ] **Configure firewall** to allow only necessary ports (80, 443, maybe 22)

### 2. Environment Setup

```bash
# On your VPS
sudo apt update && sudo apt upgrade -y
```

### 3. Deployment Commands

```bash
# Clone repository
git clone <your-repo>
cd atlas

# Update environment files
cp .env.template .env
# Edit .env with production values

# Deploy
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f
```

## 📋 Service Ports After Deployment

- **API Gateway**: 3000
- **Campaign Service**: 3001
- **Research Service**: 3002
- **WebSocket Service**: 3003
- **PostgreSQL**: 5432
- **Valkey (Redis)**: 6379

## 🔧 Additional Production Recommendations

### 1. Reverse Proxy 

Set up nginx for:

- SSL termination
- Load balancing
- Rate limiting
- Static file serving

### 2. Monitoring

- [ ] Add container monitoring (Prometheus/Grafana)
- [ ] Set up log aggregation
- [ ] Configure backup strategy for database

### 3. Security Hardening

- [ ] Use Docker secrets for sensitive data
- [ ] Set up proper CORS for production domain
- [ ] Configure fail2ban
- [ ] Regular security updates

## 🐛 Troubleshooting Commands

```bash
# Check all services
docker compose ps

# View logs
docker compose logs api-gateway
docker compose logs postgres

# Restart services
docker compose restart api-gateway

# Check health
curl http://localhost:3000/api/health
```

## 🚨 Critical Notes

1. **Never commit .env files** with production secrets
2. **Database password is currently weak** - change it!
3. **JWT secrets need to be strong** in production
4. **Google OAuth credentials** need production values
5. **SSL is required** for production OAuth to work

Your setup is now **deployment-ready** after addressing the security requirements above!

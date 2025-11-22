# Docker Setup Guide

## Services

### Core Services (Always Running)
- **PostgreSQL** - Port 5432
- **Redis** - Port 6379

### Optional Tools (Use `--profile tools`)
- **pgAdmin** - Port 5050 (PostgreSQL GUI)
- **Redis Commander** - Port 8081 (Redis GUI)

---

## Quick Start

### Start core services only:
```bash
docker-compose up -d
```

### Start with GUI tools:
```bash
docker-compose --profile tools up -d
```

### Stop all services:
```bash
docker-compose down
```

### Stop and remove all data (fresh start):
```bash
docker-compose down -v
```

---

## Service Access

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Database:** alchemy_platform
- **User:** postgres
- **Password:** postgres
- **Connection String:** `postgresql://postgres:postgres@localhost:5432/alchemy_platform`

### Redis
- **Host:** localhost
- **Port:** 6379
- **Password:** alchemyredis
- **Connection String:** `redis://:alchemyredis@localhost:6379`

### pgAdmin (if running with --profile tools)
- **URL:** http://localhost:5050
- **Email:** admin@alchemy.local
- **Password:** admin

### Redis Commander (if running with --profile tools)
- **URL:** http://localhost:8081

---

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Check service status
```bash
docker-compose ps
```

### Execute commands in containers
```bash
# PostgreSQL
docker exec -it alchemy_postgres psql -U postgres -d alchemy_platform

# Redis CLI
docker exec -it alchemy_redis redis-cli -a alchemyredis
```

### Backup database
```bash
docker exec alchemy_postgres pg_dump -U postgres alchemy_platform > backup.sql
```

### Restore database
```bash
cat backup.sql | docker exec -i alchemy_postgres psql -U postgres alchemy_platform
```

---

## Troubleshooting

### Port already in use
If you get "port already in use" errors:

**PostgreSQL (5432):**
```bash
# Find process using port
lsof -i :5432
# Kill it or change the port in docker-compose.yml
```

**Redis (6379):**
```bash
# Find process using port
lsof -i :6379
# Kill it or change the port in docker-compose.yml
```

### Reset everything
```bash
# Stop containers
docker-compose down -v

# Remove all volumes
docker volume prune

# Start fresh
docker-compose up -d
```

### Container won't start
```bash
# Check logs
docker-compose logs postgres
docker-compose logs redis

# Restart specific service
docker-compose restart postgres
```

---

## Production Notes

⚠️ **This setup is for local development only!**

For production:
1. Use Supabase for PostgreSQL (already configured in .env.example)
2. Use Upstash for Redis (serverless Redis)
3. Never commit passwords in docker-compose.yml
4. Use environment variables for all credentials

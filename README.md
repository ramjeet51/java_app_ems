# Ledger — Employee Management System

A full-stack HR management system built with **Next.js 14**, **Spring Boot 3**, **MySQL 8**, and **Docker / Kubernetes**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        nginx                            │
│   :80 → redirect HTTPS   :443 → SSL termination         │
│   /api/* → backend:8080  /  → frontend:3000            │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
  ┌────────▼────────┐       ┌─────────▼─────────┐
  │  Spring Boot    │       │   Next.js 14       │
  │  REST API       │       │   (App Router)     │
  │  :8080/api      │       │   :3000            │
  │                 │       │   /backend/* →     │
  │  JWT Auth       │       │   Spring Boot      │
  │  Role-based     │       │   (server rewrite) │
  └────────┬────────┘       └───────────────────-┘
           │
  ┌────────▼────────┐
  │  MySQL 8.0      │
  │  :3306          │
  └─────────────────┘
```

### Roles
| Role | Access |
|------|--------|
| `ROLE_ADMIN` | Full access to all features + user management |
| `ROLE_HR` | All employee/attendance/leave/payroll/performance + logs + reports |
| `ROLE_MANAGER` | Read employees, approve/reject leaves, create performance reviews, view reports |
| `ROLE_EMPLOYEE` | View own records; apply for leave |

---

## Project Structure

```
ems-project/
├── backend/          Spring Boot 3.3 Maven project
│   ├── src/
│   ├── Dockerfile    Multi-stage Maven → JRE Alpine
│   └── .env.example  All required env vars listed here
├── frontend/         Next.js 14 (App Router, TypeScript, Tailwind)
│   ├── app/          Pages and layouts
│   ├── components/   UI, layout, form, and chart components
│   ├── context/      AuthContext (JWT + cookie storage)
│   ├── lib/          axios client, type definitions, Unsplash helper
│   └── Dockerfile    Multi-stage node → standalone output
├── nginx/
│   ├── nginx.conf    Reverse proxy + TLS config
│   └── ssl/          Certificate files (gitignored); generation script included
├── k8s/              Kubernetes manifests (apply in order below)
└── docker-compose.yml
```

---

## Quick Start — Docker Compose

### Prerequisites
- Docker 24+ and Docker Compose v2
- `openssl` (for generating dev certs)

### 1. Generate SSL certificates (dev only)

```bash
cd nginx/ssl
./generate-self-signed.sh
cd ../..
```

### 2. Configure backend secrets

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum set:
#   DB_PASSWORD, DB_ROOT_PASSWORD, JWT_SECRET, DEFAULT_ADMIN_PASSWORD
```

### 3. (Optional) Unsplash hero images

Set `UNSPLASH_ACCESS_KEY=your_key` in a root `.env` file or export it in your
shell. Without it the dashboard shows a gradient placeholder — everything else
works fine.

### 4. Build and start

```bash
docker compose up --build
```

The stack takes 30–60 s to fully initialize (MySQL + Spring Boot startup).
Once healthy:

| Service | URL |
|---------|-----|
| App (via nginx) | https://localhost (accept the self-signed cert warning) |
| Frontend direct | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |

### 5. First login

The backend seeds a default admin on first run using credentials from `backend/.env`:

```
Email:    DEFAULT_ADMIN_EMAIL   (default: admin@ems.local)
Password: DEFAULT_ADMIN_PASSWORD
```

Change both in `backend/.env` before deploying anywhere public.

---

## Kubernetes Deployment

### Prerequisites
- A Kubernetes cluster (1.27+)
- `kubectl` configured
- An nginx ingress controller (`kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml`)
- (Optional) [cert-manager](https://cert-manager.io) for automatic TLS

### 1. Fill in secrets

Edit `k8s/secrets.yaml` — replace every `REPLACE_ME` placeholder — **or** use
`kubectl create secret` directly (see the comment at the top of that file).
Do **not** commit real secrets.

### 2. Update domain and image references

- `k8s/configmap.yaml` → set `CORS_ALLOWED_ORIGINS` to your domain
- `k8s/backend-deployment.yaml` → set `image: your-registry/ems-backend:tag`
- `k8s/frontend-deployment.yaml` → set `image: your-registry/ems-frontend:tag`
- `k8s/ingress.yaml` → replace `your-domain.example.com`

### 3. Build and push images

```bash
# Backend
docker build -t your-registry/ems-backend:latest ./backend
docker push your-registry/ems-backend:latest

# Frontend (NEXT_PUBLIC_* baked in at build time)
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=/backend \
  --build-arg NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_key \
  -t your-registry/ems-frontend:latest ./frontend
docker push your-registry/ems-frontend:latest
```

### 4. Apply manifests (order matters)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mysql-statefulset.yaml
# Wait for MySQL to become ready
kubectl rollout status statefulset/mysql -n ems
kubectl apply -f k8s/backend-deployment.yaml
# Wait for backend
kubectl rollout status deployment/backend -n ems
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## Environment Variables Reference

All backend variables are documented in `backend/.env.example`. Key ones:

| Variable | Description |
|----------|-------------|
| `DB_HOST` | MySQL hostname (`mysql` in docker-compose / k8s) |
| `DB_NAME` | Database name (default `ems_db`) |
| `DB_USERNAME` / `DB_PASSWORD` | MySQL credentials |
| `JWT_SECRET` | HS512 signing key — generate with `openssl rand -base64 64` |
| `DEFAULT_ADMIN_EMAIL` | Seeded admin email on first boot |
| `DEFAULT_ADMIN_PASSWORD` | Seeded admin password on first boot |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origin(s) |

Frontend variables (`frontend/.env.local.example`):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Prefix for API calls from the browser (default `/backend`) |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Optional — enables Unsplash hero images |
| `BACKEND_INTERNAL_URL` | Server-side rewrite target (e.g. `http://backend:8080`) |

---

## Known Limitations & Design Decisions

1. **Employee code generation** (`EMP-{year}-{seq}`) uses a database sequence
   counter that is not guaranteed to be gap-free or safe across concurrent
   requests at very high volume. For production, use a dedicated sequence table
   or UUID-based codes.

2. **Unsplash key is client-visible** — `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` is
   inlined into the browser bundle by Next.js. For production, proxy Unsplash
   requests through a Next.js Route Handler so the key stays server-side.

3. **Leave review — reviewer is selected manually** in the UI because the JWT
   payload carries `userId` (the `users` table PK) but not `employeeId`. A
   production system would either join the two IDs server-side or extend the
   JWT claims.

4. **No in-sandbox build was performed** — Maven Central is outside the allowed
   network domains in this environment. The code is written to spec and should
   compile cleanly, but run `mvn verify` and `npm run build` in your local
   environment after cloning.

5. **Kubernetes manifests use `imagePullPolicy: Always` by default** for
   `:latest` tags. Pin to a concrete semver tag in production to avoid
   unexpected rollouts.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Backend | Spring Boot 3.3, Spring Security, Spring Data JPA, JWT (JJWT 0.12) |
| Database | MySQL 8.0 |
| Proxy | Nginx 1.27 |
| Containerization | Docker (multi-stage builds), Docker Compose |
| Orchestration | Kubernetes 1.27+ |
| API Docs | SpringDoc OpenAPI 2.6 (Swagger UI at `/api/swagger-ui.html`) |

---

## License

MIT

backend
│
├── src
│   ├── main
│   │   ├── java

│   │   │    ├── controller   → API Handle

│   │   │    ├── service      → Business Logic

│   │   │    ├── repository   → Database Access

│   │   │    ├── entity       → Database Tables

│   │   │    ├── dto          → Request/Response Objects

│   │   │    └── config       → Security & Configuration

│   │   │
│   │   └── resources
│   │        ├── application.yml → Project Configuration

│   │        └── db/
│   │             └── schema_reference.sql → Database Schema

│   │

│   └── test
│        └── EmployeeManagementApplicationTests.java → Unit/Integration Tests

│
├── pom.xml          → Maven Dependencies & Build

├── Dockerfile       → Docker Image Instructions

├── .dockerignore    → Docker Ignore Rules

├── .env             → Secret Environment Variables

└── .env.example     → Sample Environment Variables






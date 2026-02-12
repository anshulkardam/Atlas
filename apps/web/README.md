# Atlas Platform - Frontend

## Overview

This is the frontend for the Atlas Platform - a contact enrichment system with real-time progress tracking and circuit breaker monitoring.

## Features

### 🎯 Core Functionality

- **People Management**: View and manage contacts with enrichment status tracking
- **Real-time Enrichment**: Watch enrichment progress live via WebSocket updates
- **System Health**: Monitor circuit breaker status and system performance
- **Context Display**: View enriched data with source attribution

### 📊 Dashboard Features

- **Overview Stats**: Track total, completed, in-progress, pending, and failed enrichments
- **People Table**: Interactive table with status badges and enrichment actions
- **System Health Tab**: Real-time circuit breaker monitoring
- **Enrichment Modal**: Live progress tracking with iteration details

### 🔧 Technical Implementation

- **React Query**: Server state management with optimistic updates
- **WebSocket Integration**: Real-time progress updates via Socket.IO
- **TypeScript**: Full type safety with comprehensive entity models
- **Tailwind CSS**: Responsive design with shadcn/ui components
- **Zustand**: Global state management for WebSocket connections

## Architecture

### Data Flow

1. **Authentication**: JWT-based auth with refresh token support
2. **API Gateway**: Routes all requests through port 3000
3. **Real-time Updates**: WebSocket connection to port 3003
4. **State Management**: React Query + Zustand for optimal performance

### Key Components

- `PeopleDataTable`: Main contacts table with status badges
- `EnrichmentModal`: Real-time enrichment progress modal
- `CircuitBreakerDashboard`: System health monitoring
- `ContextSnippetsDisplay`: Enriched data visualization

## Environment Variables

Create a `.env` file from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3003
```

## Getting Started

1. **Install Dependencies**:

   ```bash
   pnpm install
   ```

2. **Start Development Server**:

   ```bash
   pnpm dev
   ```

3. **Build for Production**:

   ```bash
   pnpm build
   ```

4. **Preview Production Build**:
   ```bash
   pnpm preview
   ```

## API Integration

### Authentication

- Login/Register with email/password or Google OAuth
- JWT tokens stored securely with refresh mechanism
- Protected routes enforce authentication

### Endpoints Used

- `GET /api/people` - List all contacts
- `GET /api/people/:id` - Get contact details
- `POST /api/people/:id/enrich` - Start enrichment
- `GET /api/jobs/:jobId/status` - Job status polling
- `GET /api/snippets/person/:id` - Enrichment results
- `GET /api/circuit-breaker/status` - System health

### WebSocket Events

- `connect`/`disconnect` - Connection management
- `subscribe`/`unsubscribe` - Job progress subscriptions
- `progress` - Real-time enrichment updates

## UI Components

### Status Badges

- **Pending** (Gray): Enrichment not started
- **Processing** (Blue): Enrichment in progress
- **Completed** (Green): Enrichment successful
- **Failed** (Red): Enrichment failed

### Progress Indicators

- Progress bar with iteration count
- Circuit breaker state display
- Cache hit/miss indicators
- Real-time iteration logs

## Error Handling

- **API Errors**: User-friendly toast notifications
- **WebSocket Reconnection**: Automatic reconnection with backoff
- **Type Safety**: Comprehensive TypeScript error checking
- **Circuit Breaker**: Graceful degradation during failures

## Performance

- **Code Splitting**: Dynamic imports for optimal loading
- **React Query**: Intelligent caching and background refetching
- **WebSocket**: Efficient real-time updates
- **Bundle Optimization**: gzipped assets under 300KB

## Deployment

The frontend is optimized for deployment on any static hosting service:

- Vercel, Netlify, or similar platforms
- Docker containerization support
- Environment-based configuration
- Production-ready build optimization

## Contributing

When adding new features:

1. Follow existing component patterns
2. Maintain TypeScript strict mode
3. Add appropriate error handling
4. Update this README
5. Test with the backend services

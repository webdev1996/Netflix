# Netflix Clone

A full-featured Netflix clone built with modern web technologies, offering a seamless streaming experience with features matching the original Netflix platform.

## Features

- 🎬 Adaptive video streaming (HLS/DASH)
- 🔐 Secure authentication (Firebase Auth)
- 📱 Responsive design
- 🎯 Google Ads integration
- 👨‍💼 Admin panel for content management
- 🔍 Advanced search and filtering
- 🎯 Personalized recommendations
- 🌐 Multi-language support
- 📊 Analytics dashboard

## Tech Stack

### Frontend
- Next.js 14 (React)
- Tailwind CSS
- Redux Toolkit
- React Query
- Video.js

### Backend
- Node.js
- Express.js
- PostgreSQL
- Redis (for caching)
- FFmpeg (video processing)
- Nginx-RTMP (streaming)

### Authentication
- Firebase Authentication
- JWT
- OAuth (Google, Facebook, Apple)

### Infrastructure
- Oracle Cloud (Free Tier)
- Docker
- GitHub Actions (CI/CD)

## Project Structure

```
netflix-clone/
├── frontend/           # Next.js frontend application
├── backend/           # Express.js backend server
├── admin/            # Admin dashboard
├── nginx/            # Nginx configuration for streaming
└── docker/           # Docker configuration files
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- FFmpeg
- Docker & Docker Compose
- Oracle Cloud account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/netflix-clone.git
cd netflix-clone
```

2. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

# Admin
cd ../admin
npm install
```

3. Set up environment variables:
```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/.env.example backend/.env

# Admin
cp admin/.env.example admin/.env
```

4. Start the development servers:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev

# Admin
cd admin
npm run dev
```

## Deployment

Detailed deployment instructions for Oracle Cloud will be provided in the deployment guide.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 
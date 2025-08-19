# Durood Tracker - Multi-User Platform

A comprehensive platform for tracking daily Durood readings with user authentication, daily rankings, and progress monitoring.

## Features

### 🔐 User Authentication
- User registration and login system
- Secure password hashing with bcrypt
- Session management with NextAuth.js

### 📊 Durood Tracking
- Daily Durood count entry and updates
- Calendar view for historical data
- Statistics: daily, monthly, yearly, and all-time totals
- Personal progress monitoring

### 🏆 Daily Rankings
- Real-time rankings of top 20 Durood reciters
- Daily leaderboards updated automatically
- Historical ranking data
- Visual ranking display with badges

### 📱 Modern UI
- Responsive design with Tailwind CSS
- Interactive calendar interface
- Beautiful gradient backgrounds
- Mobile-friendly layout

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd durood-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the database with test data (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For New Users

1. **Create Account**: Visit `/auth/signup` to create a new account
2. **Sign In**: Use your credentials to sign in at `/auth/signin`
3. **Start Tracking**: Add your daily Durood readings on the main dashboard
4. **View Progress**: Monitor your statistics and calendar entries
5. **Check Rankings**: Visit `/rankings` to see daily leaderboards

### For Existing Users

1. **Sign In**: Use your existing credentials
2. **Add Readings**: Update your daily Durood count
3. **Track Progress**: View your personal statistics
4. **Compete**: Check your ranking on the daily leaderboard

### Test Accounts

After running the seed script, you can use these test accounts:

- **Email**: ahmed@example.com, **Password**: password123
- **Email**: fatima@example.com, **Password**: password123
- **Email**: omar@example.com, **Password**: password123
- **Email**: aisha@example.com, **Password**: password123
- **Email**: yusuf@example.com, **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### Durood Entries
- `GET /api/durood` - Fetch user's durood entries
- `POST /api/durood` - Create/update durood entry
- `DELETE /api/durood` - Delete durood entry

### Rankings
- `GET /api/rankings` - Fetch daily rankings

## Database Schema

### Users
- Basic user information (email, username, password)
- Profile details (display name, avatar)
- Timestamps for creation and updates

### Durood Entries
- Daily durood counts per user
- Unique constraint per user per day
- Automatic ranking updates

### Daily Rankings
- Daily leaderboard positions
- User information for display
- Ranking calculations

## Daily Rankings System

The platform automatically:

1. **Tracks** all durood entries throughout the day
2. **Calculates** rankings based on count totals
3. **Updates** leaderboards in real-time
4. **Maintains** historical ranking data
5. **Displays** top 20 performers daily

## Development

### Project Structure

```
durood-tracker/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   └── rankings/       # Rankings page
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   └── providers/     # Context providers
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema
├── scripts/               # Database seeding
└── public/                # Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with test data

### Database Management

- `npx prisma studio` - Open Prisma Studio for database management
- `npx prisma db push` - Push schema changes to database
- `npx prisma generate` - Generate Prisma client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.

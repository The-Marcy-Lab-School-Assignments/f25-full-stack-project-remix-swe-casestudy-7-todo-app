# Fantasy Football Team Builder

A full-stack Fantasy Football Team Builder app built with React, Express, and Postgres. Demonstrates session-based authentication, session rehydration, auth-dependent data fetching, and conditional rendering.

## User Stories

**Authentication**

- A user can create register for an account with a username and password
- A user can log in to an existing account
- A user can log out
- A returning user who has an active session is automatically logged in when they revisit the app

**Players**
- A user can view all the players
- A user can

**Fantasy Teams**

- A logged-in user can see all their created fantasy teams
- A logged-in user can create a fantasy soccer team
- A logged-in user can give their team a custom team
- A logged-in user can add players to their team
- A logged-in user can view their saved fantasy teams
- A logged-in user can delete a fantasy team

**Features**

- User account creation
- Login authentication
- Create a fantasy team
- Add favorite soccer players
- View all fantasy teams
- Update team name
- Delete fantasy team

## Database Schema

```
Users
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
| user_id     | SERIAL      | PRIMARY KEY |
| username    | TEXT UNIQUE | NOT NULL    |
| password    | TEXT        | NOT NULL    |

Players
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
| player_id   | SERIAL   | PRIMARY KEY |
| player_name | TEXT     | NOT NULL    |
| position    | TEXT     | NOT NULL    |
| rating      | INTEGER  | NOT NULL    | 
| club_name   | TEXT     | NOT NULL    |

fantasy_teams
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
| team_id       | SERIAL           | PRIMARY KEY                   |
| user_id       | INTEGER          | REFERENCES users(user_id)     |
| team_name     | TEXT UNIQUE      | NOT NULL                      |
| formation     | TEXT             | NOT NULL                      |
| players       | TEXT             | REFERENCES players(player_id) |
```

## Table Relationship

```text
users
  |
  | one-to-many
  |
fantasy_teams
  |
  | many-to-many
  |
players 
```

One user can create many fantasy teams.

## Setup

**1. Database**

Create a local Postgres database:

```text
createdb fantasy_team_builder
```
**2. Server**
```
cd server
npm install
cp .env.template .env
```
Open .env and fill in your Postgres credentials and a session secret. Then seed the database:
```
npm run db:seed
```
Start the server:
```
npm run dev
```
The server runs on http://localhost:8080.

**3. Frontend**

In a second terminal:
```
cd frontend
npm install
npm run dev
```
The frontend runs on http://localhost:5173. The Vite dev proxy forwards all /api requests to the Express server so session cookies work correctly.

## Seed Data

```sql
INSERT INTO users (username, email, password)
VALUES
('messiFan', 'messi@gmail.com', 'fcbarcelona123'),
('ronaldoFan', 'ronaldo@gmail.com', 'SUIII07');

INSERT INTO fantasy_teams (user_id, team_name, formation, players)
VALUES
(
  1,
  'GOAT FC',
  '4-3-3',
  ARRAY[
    'Lionel Messi',
    'Neymar Jr',
    'Kevin De Bruyne'
  ]
),
(
  2,
  'SIUU FC',
  '4-4-2',
  ARRAY[
    'Cristiano Ronaldo',
    'Bruno Fernandes',
    'Vinicius Jr'
  ]
);
```


## API Contract

### Auth Routes

**Register User**

| Method | Endpoint             | Request Body             | Response                          |
| ------ | -------------------- | ------------------------ | --------------------------------- |
| POST   | `/api/auth/register` | `{ username, password }` | `{ user_id, username }`           |
| POST   | `/api/auth/login`    | `{ username, password }` | `{ user_id, username }`           |
| DELETE | `/api/auth/logout`   | —                        | `{ message }`                     |
| GET    | `/api/auth/me`       | —                        | `{ user_id, username }` or `null` |

**Fantasy Team Routes**

| Method | Endpoint              | Request Body                        | Response                                       |
| ------ | --------------------- | ------------------------------------| -----------------------------------------------|
| GET    | `/api/teams`          | —                                   | `[{ team_name, formation, players, user_id }]` |
| POST   | `/api/teams`          | `{ team_name, formation, players }` | `{ team_id, team_name, formation, players }`   |
| PATCH  | `/api/teams/:team_id` | `{ team_name }`                     | `{ team_id, team_name, formation, players }`    |
| DELETE | `/api/teams/:team_id` | —                                   | `{ team_id, team_name, formation, user_id }`   |

---

## Application Structure

```bash
Fantasy-Football-Team-builder/
├── frontend/               # React app (Vite)
│   ├── src/
│   │   ├── App.jsx         # Root component: currentUser state, session rehydration, auth handlers
│   │   ├── adapters/
│   │   │   ├── auth-adapters.js  # Fetch adapters for /api/auth/* endpoints
│   │   │   └── team-adapters.js  # Fetch adapters for /api/teams/* endpoints
│   │   └── components/
│   │       ├── AuthPage.jsx        # Login + Register forms (shown when logged out)
│   │       ├── TeamBuilderPage.jsx # Main app container (shown when logged in)
│   │       ├── AddTeamForm.jsx     # Form to create a new team
│   │       ├── TeamsList.jsx       # Renders a list of Teams created/saved
│   │       └── TeamItem.jsx        # Single team: checkbox, title, delete button
│   └── vite.config.js      # Proxies /api requests to Express in development
└── server/                 # Express + Postgres API
    ├── index.js            # App entry point, route definitions
    ├── controllers/
    │   ├── authControllers.js         # register, login, logout, getMe
    │   ├── teamControllers.js  # list, create, update, delete teams
    │   └── playersControllers.js      # list, create, update, delete players
    ├── models/
    │   ├── userModel.js         # SQL queries for the users table
    │   ├── playersModel.js      # SQL queries for the players table
    │   └── teamModels.js        # SQL queries for the teams table
    ├── middleware/
    │   ├── checkAuthentication.js  # Blocks unauthenticated requests
    │   └── logRoutes.js            # Logs each incoming request
    └── db/
        ├── pool.js         # Postgres connection pool
        └── seed.js         # Creates tables and inserts sample data
```

## Future Improvements

- Add real soccer player API integration
- Add salary cap system
- Add player ratings
- Add team points leaderboard
- Add player positions
- Add public/private fantasy teams
- Add team favorites
# Prep IQ - AI-Powered Interview Simulator

An adaptive mock interview system leveraging the MERN stack and Anthropic's Claude 3.5 Sonnet to provide personalized technical and HR interview simulations based on extracted resume skills.

## Architecture

* **Client:** React frontend (glassmorphic dark theme, real-time AI feedback)
* **Server:** Node/Express backend (JWT authentication, MongoDB data persistence)

## Setup instructions

1. Clone the repository.
2. In the `server/` directory, create a `.env` file with `MONGO_URI`, `JWT_SECRET`, and `ANTHROPIC_API_KEY`.
3. Run `npm install` in both `client/` and `server/` directories.
4. Run `npm start` in the `server/` directory to start the backend.
5. Run `npm run dev` in the `client/` directory to start the frontend.

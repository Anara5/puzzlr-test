# 🎮 Project Setup & Instructions

This guide will help you set up and run the project locally.

## 📌 1. Setup & Installation  
You need to run both the **client (frontend)** and **server (backend)** separately.

### **Open Two Terminal Windows:**  
- One for the **client** (`/client`)
- One for the **server** (`/server`)

---

## 🚀 2. Client Setup (`/client`)
Navigate to the **client** directory:  

### `cd client`
### `npm install`
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## 🛠 3. Server Setup (/server)
Navigate to the server directory:

### `cd server`
### `npm install`
### `npm start`

The server runs on port 5001.
It connects to MongoDB for storing user data and scores.

## 🗄 4. Database (MongoDB) Setup
The project uses MongoDB Atlas (cloud database).
Steps to connect the Server to MongoDB:

1. Go to [cloud.mongodb.com](cloud.mongodb.com)
2. Create an account and log in
3. Create a project and set up a cluster
4. Get the MongoDB connection string (MONGO_URI)

- Go to Clusters → Connect → Drivers
- Copy the connection string (e.g., mongodb+srv://your_username:your_password@cluster.mongodb.net/myDatabase)

### Add the Connection String to .env
Inside the /server directory, create a .env file:
`touch .env`
Add the following environment variables:
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
PORT=5001

🔹 Generate a JWT Secret Key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Copy the output and paste it as JWT_SECRET in .env.

## 🎲 5. Running the Game
Once everything is set up:
- Open http://localhost:3000
- Sign up / log in
- Play the game 🎮 (click the card to change your score!)

## 🛠 6. Troubleshooting
🔄 MongoDB Connection Issues?
- Check if your IP is whitelisted:
Go to MongoDB Atlas → Network Access → Add IP Address
Select Allow Access from Anywhere (0.0.0.0/0)
- Restart the server after adding .env:
`Ctrl + C (Stop server)`
`node server.js (Start server)`

❌ Client Not Loading?
- Make sure the server is running (node server.js)
- Restart the client (npm start)

## 🎉 Project is Ready!

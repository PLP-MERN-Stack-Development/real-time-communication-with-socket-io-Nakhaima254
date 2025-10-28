# Real-Time Communication with Socket.io

A real-time communication application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.io, enabling instant bidirectional messaging and real-time updates.

## 🚀 Features<img width="1920" height="1080" alt="Screenshot (302)" src="https://github.com/user-attachments/assets/4a0657a4-81a4-4ca3-9b13-c0efc89b6ee0" />
<img width="1920" height="1080" alt="Screenshot (303)" src="https://github.com/user-attachments/assets/f0eee009-8a7c-4246-9c11-7bedcc14b4fb" />


- **Real-Time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Secure login and registration system
- **Online Status**: See who's currently online
- **Private Conversations**: One-on-one chat functionality
- **Message History**: Persistent message storage with MongoDB
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Typing Indicators**: See when other users are typing
- **Read Receipts**: Track message delivery and read status

## 🛠️ Technologies Used

### Frontend
- **React.js** - UI library for building interactive interfaces
- **Socket.io-client** - Client-side library for real-time communication
- **CSS3** - Styling and animations
- **Axios** - HTTP client for API requests

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional event-based communication
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (locally or MongoDB Atlas account)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone https://github.com/PLP-MERN-Stack-Development/real-time-communication-with-socket-io-Nakhaima254.git
cd real-time-communication-with-socket-io-Nakhaima254
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/realtime-chat
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/realtime-chat

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the frontend directory (if needed):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 5. Setup MongoDB

**Option 1: Local MongoDB**
- Ensure MongoDB is running on your machine
- The application will connect to `mongodb://localhost:27017/realtime-chat`

**Option 2: MongoDB Atlas**
- Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Get your connection string and update `MONGODB_URI` in `.env`

## 🚀 Running the Application

### Start the Backend Server

```bash
cd backend
npm start
# Or for development with nodemon:
npm run dev
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will open automatically at `http://localhost:3000`

## 📁 Project Structure

```
real-time-communication-with-socket-io/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── models/
│   │   ├── User.js               # User model
│   │   └── Message.js            # Message model
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   └── messages.js           # Message routes
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── messageController.js  # Message logic
│   ├── socket/
│   │   └── socketHandler.js      # Socket.io event handlers
│   ├── server.js                 # Express server setup
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx          # Chat component
│   │   │   ├── Login.jsx         # Login component
│   │   │   ├── Register.jsx      # Registration component
│   │   │   ├── MessageList.jsx   # Message display
│   │   │   └── UserList.jsx      # Online users list
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── services/
│   │   │   ├── api.js            # API service
│   │   │   └── socket.js         # Socket.io client setup
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
└── README.md
```

## 🔌 Socket.io Events

### Client → Server Events

- `connection` - Establish socket connection
- `join_room` - Join a specific chat room
- `send_message` - Send a new message
- `typing` - User is typing indicator
- `stop_typing` - User stopped typing
- `disconnect` - User disconnected

### Server → Client Events

- `receive_message` - Receive new message
- `user_online` - User came online
- `user_offline` - User went offline
- `typing` - Someone is typing
- `stop_typing` - Someone stopped typing
- `message_delivered` - Message delivery confirmation
- `message_read` - Message read receipt

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Messages
- `GET /api/messages/:userId` - Get conversation with specific user
- `POST /api/messages` - Send a message
- `GET /api/messages/unread` - Get unread messages count

### Users
- `GET /api/users` - Get all users
- `GET /api/users/online` - Get online users

## 🎯 Usage

1. **Register an Account**
   - Navigate to the registration page
   - Fill in your details (username, email, password)
   - Click "Register"

2. **Login**
   - Use your credentials to log in
   - You'll be redirected to the chat interface

3. **Start Chatting**
   - Select a user from the user list
   - Type your message in the input field
   - Press Enter or click Send
   - See real-time updates when others message you

4. **Real-Time Features**
   - Green dot indicates online users
   - Typing indicators show when someone is typing
   - Messages appear instantly without refresh

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📦 Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

### Deployment

**Backend Deployment (Heroku example)**
```bash
cd backend
heroku create your-app-name
git push heroku main
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
```

**Frontend Deployment (Vercel/Netlify)**
- Build the frontend: `npm run build`
- Deploy the build folder to your hosting service
- Update environment variables with production backend URL

## 🐛 Troubleshooting

**Socket.io Connection Issues**
- Ensure CORS is properly configured on the backend
- Check that the socket URL matches your backend server
- Verify firewall settings allow WebSocket connections

**MongoDB Connection Errors**
- Check MongoDB is running (local) or connection string is correct (Atlas)
- Ensure IP address is whitelisted in MongoDB Atlas

**Authentication Issues**
- Verify JWT_SECRET is set in environment variables
- Check token expiration settings
- Clear browser localStorage and try again

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Nakhaima254**
- GitHub: [@Nakhaima254](https://github.com/Nakhaima254)

## 🙏 Acknowledgments

- Socket.io documentation and community
- MERN stack tutorials and resources
- PLP MERN Stack Development Program

## 📧 Contact

For questions or support, please open an issue in the GitHub repository or contact the author.

---

**Happy Coding! 🚀**

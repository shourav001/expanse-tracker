# 💰 Expense Tracker - MERN Stack Application

A full-stack expense tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to track their income and expenses with ease.

## ✨ Features

### 1. **Add Income/Expense**
- Input title, amount, category, and date
- Support for both income and expense transactions
- Multiple categories for better organization
- Date picker for accurate transaction tracking

### 2. **Delete Transaction**
- Remove entries anytime with confirmation dialog
- Instant UI updates after deletion
- Secure deletion with proper error handling

### 3. **Filter by Type & Category**
- Filter transactions by type (income/expense)
- Filter by specific categories (food, bills, transportation, etc.)
- Dynamic category options based on transaction type
- Clear filters functionality

### 4. **Edit Transaction**
- Update entries anytime with a modal form
- Pre-populated form with existing data
- Real-time validation and error handling

### Additional Features
- **Real-time Summary**: Total balance, income, and expenses
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Currency Formatting**: Proper USD currency display
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Data Persistence**: MongoDB database for reliable data storage

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-tracker-mern
   ```

2. **Install server dependencies**
   ```bash
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the development servers**
   ```bash
   # Start both server and client concurrently
   npm run dev
   
   # Or start them separately:
   # Terminal 1 - Start server
   npm run server
   
   # Terminal 2 - Start client
   npm run client
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
expense-tracker-mern/
├── server.js              # Express server setup
├── package.json           # Server dependencies
├── env.example           # Environment variables template
├── client/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Component styles
│   │   ├── index.js      # React entry point
│   │   └── index.css     # Global styles
│   └── package.json      # Client dependencies
└── README.md
```

## 🛠️ API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions (with optional filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/:id` - Get single transaction

### Summary
- `GET /api/summary` - Get financial summary (balance, income, expenses)

## 🎨 Categories

### Income Categories
- Salary
- Freelance
- Investment
- Other

### Expense Categories
- Food
- Bills
- Transportation
- Entertainment
- Shopping
- Health
- Education
- Other

## 🔧 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - JavaScript library for UI
- **Axios** - HTTP client
- **React Icons** - Icon library
- **Date-fns** - Date utility library

### Development
- **Nodemon** - Server auto-restart
- **Concurrently** - Run multiple commands

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Set environment variables in Heroku dashboard
5. Deploy using Git

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.

---

**Happy Expense Tracking! 💰** 
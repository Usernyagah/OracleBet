# OracleBet

**Ultra-Low Fee Predictions on Mantle**

OracleBet is a decentralized prediction market platform built on Mantle Network, enabling users to bet on crypto prices, RWA yields, and ecosystem events with ultra-low fees and lightning-fast transactions.

## 🎯 Overview

OracleBet leverages the power of decentralized oracles and Mantle's efficient L2 infrastructure to provide a seamless prediction market experience. Users can create markets, place bets, and redeem winnings with minimal fees and maximum transparency.

## ✨ Features

- **Ultra-Low Fees**: Only 0.1% trading fees
- **Decentralized Oracles**: Powered by Chainlink, UMA, and custom oracle integrations
- **Multiple Market Types**: 
  - Crypto price predictions
  - Real-World Asset (RWA) yield predictions
  - Mantle ecosystem events
- **Wallet Integration**: Seamless connection with MetaMask and WalletConnect compatible wallets
- **Portfolio Management**: Track your positions and winnings
- **Dark Mode**: Beautiful UI with light/dark theme support
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher) - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- npm or yarn package manager
- A Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Usernyagah/OracleBet.git
cd OracleBet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Web3**: Wagmi + RainbowKit
- **Blockchain**: Mantle Network (Sepolia Testnet)
- **Animations**: Framer Motion
- **Routing**: React Router

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── config/         # Configuration files (wagmi, etc.)
├── data/           # Mock data and constants
├── lib/            # Utility functions
└── hooks/          # Custom React hooks
```

## 🔗 Links

- **Network**: Mantle Sepolia Testnet
- **Explorer**: [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz)
- **Repository**: [GitHub](https://github.com/Usernyagah/OracleBet)

## 📝 How It Works

1. **Connect Wallet**: Link your Web3 wallet to get started
2. **Browse Markets**: Explore available prediction markets
3. **Place Bets**: Buy Yes or No shares on market outcomes
4. **Redeem Winnings**: If your prediction is correct, redeem your shares for rewards

## 🎨 Features in Detail

### Market Creation
Create custom prediction markets with your own questions and oracle sources.

### Market Trading
Trade shares in prediction markets with a simple, intuitive interface showing odds and potential returns.

### Portfolio Tracking
Monitor all your active positions, past trades, and total portfolio value in one place.

## 🚢 Deployment

You can deploy this project using any static hosting service:

- **Vercel**: Connect your GitHub repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions to build and deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Usernyagah**

Built for the Mantle Global Hackathon 2025.

---

Made with ❤️ on Mantle Network

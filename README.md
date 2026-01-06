# OracleBet

**Ultra-Low Fee Predictions on Mantle**

OracleBet is a decentralized prediction market platform built on Mantle Network, enabling users to bet on crypto prices, RWA yields, and ecosystem events with ultra-low fees and lightning-fast transactions.

## 🎯 Overview

OracleBet leverages the power of decentralized oracles and Mantle's efficient L2 infrastructure to provide a seamless prediction market experience. Users can create markets, place bets, and redeem winnings with minimal fees and maximum transparency.

## 📊 Pitch Deck

For detailed information about OracleBet Hub's problem statement, solution, business model, roadmap, team, and compliance declarations, please refer to our pitch deck:

- **HTML Version**: [`pitch-deck.html`](./pitch-deck.html) - Interactive web version
- **PDF Version**: [`OracleBet Hub - Pitch Deck.pdf`](./OracleBet%20Hub%20-%20Pitch%20Deck.pdf) - Downloadable PDF

The pitch deck includes:
- One-pager pitch (Problem, Solution, Business Model, Roadmap)
- Team bios and contact information
- Compliance declaration and regulatory disclosures

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
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Usernyagah/OracleBet.git
cd OracleBet
```

2. Install dependencies:

**For Contracts:**
```bash
cd contracts
npm install
```

**For Client:**
```bash
cd ../client
npm install
```

3. Start the development server (from `client/` directory):
```bash
cd client
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Building for Production

**Client:**
```bash
cd client
npm run build
```

The production build will be in the `client/dist` directory.

**Contracts:**
```bash
cd contracts
npm run compile
```

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
oraclebet-hub/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   └── ui/      # shadcn-ui components
│   │   ├── pages/       # Page components
│   │   ├── config/      # Configuration files (wagmi, contracts, etc.)
│   │   ├── data/        # Mock data and constants
│   │   ├── lib/         # Utility functions
│   │   ├── hooks/       # Custom React hooks
│   │   └── abis/        # Contract ABIs
│   ├── public/          # Static assets
│   ├── e2e/             # End-to-end tests (Playwright)
│   ├── dist/            # Production build output
│   ├── Dockerfile       # Docker configuration for client
│   └── package.json     # Client dependencies
│
├── contracts/           # Smart contracts (Hardhat)
│   ├── contracts/       # Solidity contracts
│   │   ├── Factory.sol
│   │   ├── Market.sol
│   │   ├── PredictionFactory.sol
│   │   └── PredictionMarket.sol
│   ├── scripts/         # Deployment and utility scripts
│   │   ├── deploy_all.ts
│   │   └── export_abis.ts
│   ├── test/            # Contract tests
│   ├── artifacts/       # Compiled contracts
│   ├── typechain-types/ # TypeScript types for contracts
│   ├── hardhat.config.cjs
│   ├── hardhat.config.ts
│   └── package.json     # Contract dependencies
│
├── pitch-deck.html      # Interactive HTML pitch deck
├── OracleBet Hub - Pitch Deck.pdf  # PDF version of pitch deck
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile           # Root Dockerfile
├── Makefile             # Build and deployment commands
├── package.json         # Root package.json
└── README.md            # This file
```

## 🔗 Links

- **Live Demo**: [OracleBet](https://oraclebet-1.onrender.com/)
- **Pitch Deck**: [HTML](./pitch-deck.html) | [PDF](./OracleBet%20Hub%20-%20Pitch%20Deck.pdf)
- **Network**: Mantle Sepolia Testnet
- **Explorer**: [Mantle Sepolia Explorer](https://explorer.sepolia.mantle.xyz)
- **Repository**: [GitHub](https://github.com/Usernyagah/OracleBet)

## 📋 Deployed Contracts (Mantle Sepolia Testnet)

### Main Contracts

- **PredictionFactory**: [`0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703`](https://explorer.sepolia.mantle.xyz/address/0xBF559Fc75fa3c2070D65Cd9ccE9e81Ce926db703)
  - Factory contract for creating and managing prediction markets

### Active Markets

1. **MNT > $2 by Q1 2026?**: [`0x0667C18576CeDa4f0a54d3614684b1271D357C9b`](https://explorer.sepolia.mantle.xyz/address/0x0667C18576CeDa4f0a54d3614684b1271D357C9b)
   - Will Mantle Network token (MNT) reach $2 USD by Q1 2026?

2. **Bitcoin hits $150k in 2026?**: [`0xA24F78E64af7fb8b580862C23Cb44728F4a6468A`](https://explorer.sepolia.mantle.xyz/address/0xA24F78E64af7fb8b580862C23Cb44728F4a6468A)
   - Will Bitcoin (BTC) reach $150,000 USD in 2026?

3. **Mantle TVL > $1B?**: [`0x819d4A350A6eD4098fD57C51a3281967F57f10d0`](https://explorer.sepolia.mantle.xyz/address/0x819d4A350A6eD4098fD57C51a3281967F57f10d0)
   - Will Mantle Network Total Value Locked (TVL) exceed $1 billion by Q2 2026?

### Network Configuration

- **Chain ID**: 5003
- **RPC URL**: `https://rpc.sepolia.mantle.xyz`
- **Explorer**: `https://explorer.sepolia.mantle.xyz`

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

### Smart Contracts (Hardhat)

1. **Get Testnet MNT from Faucet**:
   - Visit [Mantle Sepolia Faucet](https://faucet.sepolia.mantle.xyz/) to get test MNT
   - Or use alternative faucets: [Alchemy](https://www.alchemy.com/faucets/mantle-sepolia) or [QuickNode](https://faucet.quicknode.com/mantle/sepolia)

2. **Set up Environment Variables**:
   ```bash
   export PRIVATE_KEY=your_private_key_here
   ```

3. **Deploy Contracts** (from `contracts/` directory):
   ```bash
   cd contracts
   npm run deploy
   ```

   The script will:
   - Deploy the Factory contract
   - Create 3 sample markets
   - Output contract addresses and explorer links
   - Export frontend configuration to `frontend.env`

4. **Connect Frontend to Contracts**:
   The frontend is already configured with the deployed contract addresses. The configuration files are:
   - `client/src/config/contracts.ts` - Contract addresses and ABIs
   - `client/.env` - Environment variables (already set with deployed addresses)
   - `client/src/hooks/useContracts.ts` - React hooks for contract interactions
   
   To use the contracts in your components:
   ```typescript
   import { useFactory, useMarket, useAllMarkets } from '@/hooks/useContracts';
   import { FACTORY_ADDRESS, MARKET_ADDRESSES } from '@/config/contracts';
   ```

4. **Verify Contracts** (optional):
   ```bash
   npx hardhat verify --network mantle_testnet <CONTRACT_ADDRESS>
   ```

### Frontend Deployment

You can deploy this project using any static hosting service:

- **Vercel**: Connect your GitHub repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Docker**: See Docker Deployment section below

Remember to set environment variables in your hosting platform with the contract addresses from deployment.

### Docker Deployment

#### Build and Run Client

**Build the Docker image:**
```bash
cd client
docker build -t oraclebet-client .
```

**Run the container:**
```bash
docker run -d -p 3000:80 --name oraclebet-client oraclebet-client
```

**Or use Docker Compose (from root):**
```bash
# Build and run client
docker-compose up -d client

# Build and run with Hardhat node (development)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f client

# Stop services
docker-compose down
```

#### Docker Compose Services

- **client**: Frontend React application (port 3000)
- **hardhat-node**: Local Hardhat node for testing (port 8545, dev profile only)

#### Using Makefile (Optional)

For convenience, you can use the provided Makefile:

```bash
# Build client image
make build-client

# Build all images
make build

# Start all services
make up

# Start with Hardhat node (dev)
make up-dev

# View logs
make logs

# Stop services
make down

# Clean up
make clean
```

#### Environment Variables

For production, you can pass environment variables to the client container:
```bash
docker run -d -p 3000:80 \
  -e VITE_FACTORY_ADDRESS=0x... \
  -e VITE_CHAIN_ID=5003 \
  --name oraclebet-client \
  oraclebet-client
```

Or use a `.env` file with docker-compose:
```yaml
# docker-compose.override.yml
services:
  client:
    environment:
      - VITE_FACTORY_ADDRESS=0x...
      - VITE_CHAIN_ID=5003
```

### Docker Deployment

#### Build and Run Client

**Build the Docker image:**
```bash
cd client
docker build -t oraclebet-client .
```

**Run the container:**
```bash
docker run -d -p 3000:80 --name oraclebet-client oraclebet-client
```

**Or use Docker Compose (from root):**
```bash
# Build and run client
docker-compose up -d client

# Build and run with Hardhat node (development)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f client

# Stop services
docker-compose down
```

#### Docker Compose Services

- **client**: Frontend React application (port 3000)
- **hardhat-node**: Local Hardhat node for testing (port 8545, dev profile only)

#### Environment Variables

For production, you can pass environment variables to the client container:
```bash
docker run -d -p 3000:80 \
  -e VITE_FACTORY_ADDRESS=0x... \
  -e VITE_CHAIN_ID=5003 \
  --name oraclebet-client \
  oraclebet-client
```

Or use a `.env` file with docker-compose:
```yaml
# docker-compose.override.yml
services:
  client:
    environment:
      - VITE_FACTORY_ADDRESS=0x...
      - VITE_CHAIN_ID=5003
```

## 🏆 Hackathon Notes

**OracleBet leverages Mantle's ultra-low fees for high-volume micro-bets on crypto/RWA events**

- **Low Fees**: Mantle's efficient L2 infrastructure enables micro-transactions with minimal gas costs
- **High Throughput**: Perfect for high-frequency trading and small bets
- **Real-World Assets**: Ideal for RWA yield predictions with cost-effective oracle queries
- **Scalability**: Handle thousands of concurrent bets without breaking the bank

Key advantages:
- **0.3% trading fees** - One of the lowest in the industry
- **Instant finality** - Fast resolution for time-sensitive markets
- **Oracle Integration Ready** - Chainlink price feeds and UMA optimistic oracle placeholders
- **Gas Optimized** - Contract code optimized for Mantle's cost-effective environment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Dennis Nyagah**

Built for the Mantle Global Hackathon 2025.

---

Made with ❤️ on Mantle Network

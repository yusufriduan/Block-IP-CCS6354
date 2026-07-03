# Block-IP
## What is Block-IP?
Block-IP is a Blockchain-based Intellectual Property System that utilizes Smart Contracts and decentralised architecture as a decentralised alternative to Intellectual Property Repositories.

## Core Architecture 
Our app is split to three core layers namely, Presentation, Application and Data Layers. 

### Presentation Layer
Our app uses NextJS for the frontend UI/UX as well as serverless routing for backend api connection. We also use ethersjs, which is a web3 framework, for the connection with our Ethereum-deployed blockchain.

### Application Layer
Our website as mentioned uses NextJS serverless API routing to connect between different core application services. The services include:
- Input validation
- Metamask connection 
- Pinata integration 
- Blockchain interface

### Data Layer
The data layer for our website mainly leverages Ethereum (Sepolia testnet)'s immutability to score secure and permanent records thus validating and verifying IP ownership.

## How to run?
### Method 1: Running local environment
1. Open terminal
2. Git clone the repository
``` git clone http://github.com/yusufriduan/Block-IP-CCS6354.git```
3. Install the npm environment 
```npm install```
4. Run the npm environment
```npm run dev```
5. Click the url listed on terminal. The url should be:
```http://localhost:3000/```

### Method 2: Opening the deployed website itself
```https://blockip.vercel.app```


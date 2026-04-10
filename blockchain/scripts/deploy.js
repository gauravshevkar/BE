const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment of CertificateVerification contract...");

  // Get the contract factory
  const CertificateVerification = await hre.ethers.getContractFactory("CertificateVerification");
  
  // Deploy the contract
  console.log("Deploying contract...");
  const certificate = await CertificateVerification.deploy();
  
  await certificate.waitForDeployment();
  
  const contractAddress = await certificate.getAddress();
  
  console.log("CertificateVerification deployed to:", contractAddress);
  console.log("Deployment transaction hash:", certificate.deploymentTransaction().hash);

  // Save contract address and ABI to a file for frontend use
  const contractData = {
    address: contractAddress,
    abi: JSON.parse(certificate.interface.formatJson()),
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // Create artifacts directory if it doesn't exist
  const artifactsDir = path.join(__dirname, "..", "artifacts", "deployed");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Save to file
  const outputPath = path.join(artifactsDir, "CertificateVerification.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(contractData, null, 2)
  );

  console.log("Contract data saved to:", outputPath);
  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  console.log("========================\n");

  // Wait for block confirmations on public networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await certificate.deploymentTransaction().wait(6);
    console.log("Block confirmations completed!");
  }

  console.log("\nNext steps:");
  console.log("1. Copy the contract address to your backend .env file");
  console.log("2. Copy the contract address to your frontend .env file");
  console.log("3. Start your backend server");
  console.log("4. Start your frontend application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
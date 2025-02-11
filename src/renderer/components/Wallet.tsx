import { Box, Button, Heading, Layer, Text } from 'grommet';
import { useContext, useEffect, useState } from 'react';
import { WalletContext } from 'renderer/context/walletContext';
import truncateEthAddress from 'truncate-eth-address';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { web3AuthInstance } from '../Web3AuthInstance';
import { getPublicCompressed } from "@toruslabs/eccrypto";

function Wallet() {
  const { address } = useAccount();
  const [showWalletSettings, setShowWalletSettings] = useState(false);
  const { connectAsync, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { nativeTokenBalance, flockTokenBalance } = useContext(WalletContext);

  const handleConnect = async () => {
    await connectAsync({
      connector: connectors[0],
    });
  };

  const handleDisconnect = async () => {
    wagmiDisconnect();
  };

  interface UserInfo {
    email: string;
    address: string;
    name?: string;
    profileImage?: string;
    aggregateVerifier?: string;
    verifier?: string;
    verifierId?: string;
    typeOfLogin?: string;
    dappShare?: string;
    idToken?: string; //jwt
    oAuthIdToken?: string;
    oAuthAccessToken?: string;
  }

  const loadUserInfo = async () => {
      try {
        const privateKey = await web3AuthInstance.provider?.request({
          method: "eth_private_key", 
        }) as string;

        const publicKey = getPublicCompressed(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
        const user = await web3AuthInstance.getUserInfo();

        const res = await fetch("https://us-central1-flock-demo-design.cloudfunctions.net/postEmailToDB", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.idToken, 
          },
          body: JSON.stringify({ pubKey: publicKey, email: user.email, wallet: address }),
        });

        return res.json();
      
      } catch (error) {
        console.error('Error loading user info:', error);
      }
  };

  useEffect(() => {
    if (address) {
      loadUserInfo(); 
    }
  }, [address]);

  if (showWalletSettings) {
    return (
      <Layer onEsc={() => setShowWalletSettings(false)} full>
        <Box
          align="center"
          justify="center"
          height="100vh"
          pad="large"
          gap="medium"
        >
          <Heading level="3">Wallet Settings</Heading>
          <Box align="start" gap="xsmall">
            <Text>
              <b>Wallet Address:</b> {address}
            </Text>
            <Text>
              <b>FLock(FLC) Balance: </b>
              {flockTokenBalance ? flockTokenBalance.formatted : 0} $F
            </Text>
            <Text>
              <b>MATIC Balance: </b>
              {nativeTokenBalance ? nativeTokenBalance.formatted : 0} $MATIC
            </Text>
          </Box>
          <Box direction="row" alignSelf="end" gap="small">
            <Button
              secondary
              label="Go Back"
              onClick={() => setShowWalletSettings(false)}
            />
            <Button
              primary
              label="Disconnect"
              onClick={() => {
                handleDisconnect();
                setShowWalletSettings(false);
              }}
            />
          </Box>
        </Box>
      </Layer>
    );
  }

  return (
    <Button
      primary
      label={
        !address
          ? 'Connect Wallet'
          : `(${
              flockTokenBalance ? flockTokenBalance.formatted : 0
            } $F) ${truncateEthAddress(address)}`
      }
      pad="xsmall"
      onClick={
        address
          ? () => {
              setShowWalletSettings(true);
            }
          : () => {
              handleConnect();
            }
      }
    />
  );
}

export default Wallet;

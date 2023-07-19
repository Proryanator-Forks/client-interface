import {
  Box,
  Button,
  Form,
  FormField,
  Heading,
  Paragraph,
  TextInput,
} from 'grommet';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import Layout from 'renderer/components/Layout';
import { WalletContext } from 'renderer/context/walletContext';
import { FLOCK_ABI, FLOCK_ADDRESS } from '../contracts/flock';

export default function Faucet() {
  const { address } = useContext(WalletContext);
  const [amount, setAmount] = useState(0);
  const [errors, setErrors] = useState<any>({});

  const { data, write } = useContractWrite({
    address: FLOCK_ADDRESS as `0x${string}`,
    abi: FLOCK_ABI,
    functionName: 'mint',
  });

  const { isSuccess, isLoading } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handleMint = async () => {
    write?.({ args: [address, amount * 10 ** 18] });
  };

  useEffect(() => {
    setAmount(0);
  }, [isSuccess]);

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Layout>
      <Box width="100%" gap="small" pad={{ vertical: 'small' }}>
        <Box
          background="white"
          round="small"
          direction="row"
          align="center"
          justify="center"
          width="100%"
          pad={{ vertical: 'large' }}
        >
          <Box>
            <Box direction="row" gap="xsmall">
              <Heading level="2">FLock (FLC) tokens faucet </Heading>
            </Box>
            <Paragraph>
              Mint your FLC tokens for participating in the FLock network.
            </Paragraph>
            <Paragraph>
              Contract Address: <code>{FLOCK_ADDRESS}</code>
            </Paragraph>
          </Box>
        </Box>
        <Box
          width="100%"
          align="center"
          pad="large"
          background="white"
          justify="center"
          round="small"
        >
          <Form
            onValidate={(validationResults) => {
              setErrors(validationResults.errors);
            }}
          >
            <FormField
              name="amount"
              htmlFor="amount"
              label="Amount"
              required
              validateOn="blur"
            >
              <TextInput
                type="number"
                id="amount"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </FormField>
            <Box direction="row" align="end" justify="end">
              <Button
                primary
                onClick={handleMint}
                disabled={!address || amount === 0 || hasErrors || isLoading}
                label={isLoading ? 'Minting...' : 'Mint'}
              />
            </Box>
          </Form>
        </Box>
      </Box>
    </Layout>
  );
}
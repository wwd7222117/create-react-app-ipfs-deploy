import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import { utils } from 'ethers/lib/';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import DutchAuctionArtifact from '../artifacts/contracts/DutchAuction.sol/DutchAuction.json';
import { Provider } from '../utils/provider';
import { SectionDivider } from './SectionDivider';



const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

const StyledDutchAuctionDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-template-columns: 155px 2.7fr 1fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
`;

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
`;

const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

const StyledButton2 = styled.button`
  width: 120px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
`;

export function DutchAuction(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [dutchAuctionContract, setDutchAuctionContract] = useState<Contract>();
  const [dutchAuctionContractAddr, setDutchAuctionContractAddr] = useState<string>('');
  const [dutchAuctionReservePrice, setDutchAuctionReservePrice] = useState<string>('');
  const [dutchAuctionJudgeAddress, setDutchAuctionJudgeAddress] = useState<string>('');
  const [dutchAuctionNumBlocksAuctionOpen, setDutchAuctionNumBlocksAuctionOpen] = useState<string>('');
  const [dutchAuctionOfferPriceDecrement, setDutchAuctionOfferPriceDecrement] = useState<string>('');
  const [bidValueInput, setBidValueInput] = useState<string>('');



  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (dutchAuctionContract || !signer) {
      return;
    }

    async function deployDutchAuctionContract(signer: Signer): Promise<void> {
      const DutchAuction = new ethers.ContractFactory(
        DutchAuctionArtifact.abi,
        DutchAuctionArtifact.bytecode,
        signer
      );

      try {

        var ReservePrice = dutchAuctionReservePrice;
        var offerPriceDecrement = dutchAuctionOfferPriceDecrement;
        var nReservePrice = utils.parseEther(ReservePrice);
        var nofferPriceDecrement = utils.parseEther(offerPriceDecrement);
        var judgeAddress = dutchAuctionJudgeAddress;
        var numBlocksAuctionOpen = dutchAuctionNumBlocksAuctionOpen;
        const dutchAuctionContract = await DutchAuction.deploy(nReservePrice,judgeAddress,numBlocksAuctionOpen,nofferPriceDecrement);
        await dutchAuctionContract.deployed();

        setDutchAuctionContract(dutchAuctionContract);

        window.alert(`DutchAuction deployed to: ${dutchAuctionContract.address}`);

        setDutchAuctionContractAddr(dutchAuctionContract.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    deployDutchAuctionContract(signer);
  }



  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  
  useEffect((): void => {
    if (!dutchAuctionContract) {
      return;
    }

  }, [dutchAuctionContract]);


  function handleDutchAuctionBid(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    if (!bidValueInput) {
      window.alert('bidValueInput cannot be empty');
      return;
    }

    async function Bid(dutchAuctionContract: Contract): Promise<void> {
      try {

        let overrides = {      
          // The amount to send with the transaction (i.e. msg.value)
          value: utils.parseEther(bidValueInput),   
      };
        const setBidTxn = await dutchAuctionContract.bid(overrides);

        await setBidTxn.wait();
        window.alert(`Congratulation, Bid success!`);

      } catch (error: any) {
        window.alert(
          'Error bidvalue or bid is finished!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    Bid(dutchAuctionContract);
  }


  function handleDutchAuctionFinalize(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!dutchAuctionContract) {
      window.alert('Undefined dutchAuctionContract');
      return;
    }

    async function Finaliz(dutchAuctionContract: Contract): Promise<void> {
      try {

       
        const setBidTxn = await dutchAuctionContract.finalize();

        await setBidTxn.wait();
        window.alert(`Congratulation, Finalize success!`);

      } catch (error: any) {
        window.alert(
          'Error or bid is not finish!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    Finaliz(dutchAuctionContract);
  }


  
  function handleOfferPriceDecrementChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionOfferPriceDecrement(event.target.value);
  }

  
  function handleJudgeAddressChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionJudgeAddress(event.target.value);
  }
  
  function handleNumBlocksAuctionOpenChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionNumBlocksAuctionOpen(event.target.value);
  }


  function handleBidValueInputChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setBidValueInput(event.target.value);
  }
  
  function handleReservePriceChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setDutchAuctionReservePrice(event.target.value);
  }

  return (
    <>
    
    <StyledLabel htmlFor="reservePrice">reservePrice</StyledLabel>
    <StyledInput
      id="reservePrice"
      type="text"
    //  placeholder={greeting ? '' : '<Contract not yet deployed>'}
      onChange={handleReservePriceChange}
      style={{ fontStyle: 'normal'}}
    ></StyledInput>


    <StyledLabel htmlFor="judgeAddress">judgeAddress</StyledLabel>
    <StyledInput
      id="judgeAddress"
      type="text"
      onChange={handleJudgeAddressChange}
      style={{ fontStyle: 'normal'}}
    ></StyledInput>

    <StyledLabel htmlFor="numBlocksAuctionOpen">numBlocksAuctionOpen</StyledLabel>
    <StyledInput
      id="numBlocksAuctionOpen"
      type="text"
      onChange={handleNumBlocksAuctionOpenChange}
      style={{ fontStyle: 'normal'}}
    ></StyledInput>


    <StyledLabel htmlFor="offerPriceDecrement">offerPriceDecrement</StyledLabel>
    <StyledInput
      id="offerPriceDecrement"
      type="text"
      onChange={handleOfferPriceDecrementChange}
      style={{ fontStyle: 'normal'}}
    ></StyledInput>



      <StyledDeployContractButton
        disabled={!active || dutchAuctionContract ? true : false}
        style={{
          cursor: !active || dutchAuctionContract ? 'not-allowed' : 'pointer',
          borderColor: !active || dutchAuctionContract ? 'unset' : 'blue'
        }}
        onClick={handleDeployContract}
      >
        Deploy DutchAuction
      </StyledDeployContractButton>
      <SectionDivider />
      <StyledDutchAuctionDiv>
        <StyledLabel>Contract addr</StyledLabel>
        <div>
          {dutchAuctionContractAddr ? (
            dutchAuctionContractAddr
          ) : (
            <em>{`<Contract not yet deployed>`}</em>
          )}
        </div>
        
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
     
        <div></div>
        <div></div>


        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
     
        <StyledLabel htmlFor="bidValueInput">Input Bidvalue</StyledLabel>

        <StyledInput
          id="bidValueInput"
          type="text"
          onChange={handleBidValueInputChange}
          style={{ fontStyle: 'normal'}}
        ></StyledInput>

        <StyledButton2
          disabled={!active || !dutchAuctionContract ? true : false}
          style={{
            cursor: !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
            borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue'
          }}
          onClick={handleDutchAuctionBid}
        >
          Bid
        </StyledButton2>

        <StyledButton2
          disabled={!active || !dutchAuctionContract ? true : false}
          style={{
            cursor: !active || !dutchAuctionContract ? 'not-allowed' : 'pointer',
            borderColor: !active || !dutchAuctionContract ? 'unset' : 'blue',
            
          }}
          onClick={handleDutchAuctionFinalize}
        >
          Finalize
        </StyledButton2>

       

      </StyledDutchAuctionDiv>
    </>
  );
  
}


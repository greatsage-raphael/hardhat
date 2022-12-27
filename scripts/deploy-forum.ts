import { Contract, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import { makeBig } from '../../front-end/lib/number-utils';

async function main() {
  // let's get a another SignerWithAddress to upvote a question
  const [owner, user1] = await ethers.getSigners();
  // these addresses should match Account #0 & #1 from our local node
  console.log('With each deployment to the localhost...');
  console.log('...these addresses will stay the same');
  console.log('owner address: ', owner.address);
  console.log('user1 address: ', user1.address, '\n');

  // deploy the contracts
  const auto: ContractFactory = await ethers.getContractFactory('Auto');
  const Auto: Contract = await auto.deploy();
  console.log('...these addresses may change');
  console.log('Auto deployed to: ', Auto.address);
  const Forum: ContractFactory = await ethers.getContractFactory('Forum');
  // pass the GOFLOW token address to the Forum contract's constructor!
  const forum: Contract = await Forum.deploy(Auto.address);
  await forum.deployed();
  console.log('forum deployed to: ', forum.address);

  // Let's populate our app with some questions and answers.
  // We are posting as `owner` by default
  const qTx = await forum.postQuestion('what is the function of history? ');
  await qTx.wait();

  // Let's post an answer to the question
  // Our first question has the id 0 which we pass as the first argument
  const answerTx = await forum.postAnswer(0, '1st answer');
  await answerTx.wait();

  const answerTx2 = await forum.postAnswer(0, '2nd answer');
  await answerTx2.wait();

  // What a nice answer 🤝 🤗
  const answerTx3 = await forum.postAnswer(0, 'To avoid further stupidity 👊');
  await answerTx3.wait();

  // Connect to `user1` in order to mint, approve, and upvote an answer
  // We need to parse the token amount into a BigNumber of the correct unit
  const mintTx = await Auto.connect(user1).mint(makeBig('1000')); 
  await mintTx.wait();

  // "approve before someone else can move" our tokens with the transferFrom method
  const approve = await Auto.connect(user1).approve(forum.address, makeBig('1000'));
  await approve.wait();

  // upvote answer with id 2, 'Yes, I am ur fren! 👊'
  const upvote1 = await forum.connect(user1).upvoteAnswer(2);
  await upvote1.wait();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
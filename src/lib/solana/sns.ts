import { Connection } from '@solana/web3.js';
import { getDomainKeySync, NameRegistryState } from '@bonfida/spl-name-service';

const RPC = import.meta.env.VITE_SOLANA_RPC;

function isValidDomainNamee(domainName: string): boolean {
  const regex = /^[a-zA-Z0-9_-]+\.sol$/;
  return regex.test(domainName);
}
export async function getPublicKeyFromSolDomain(
  domain: string
): Promise<string> {
  if (!RPC) {
    console.log('RPC is not defined');
    return '';
  }
  if (!isValidDomainNamee(domain)) {
    console.log('Invalid domain name');
    return '';
  }
  const connection = new Connection(RPC);
  const { pubkey } = await getDomainKeySync(domain);
  const owner = (
    await NameRegistryState.retrieve(connection, pubkey)
  ).registry.owner.toBase58();
  console.log(`The owner of SNS Domain: ${domain} is: `, owner);
  return owner;
}

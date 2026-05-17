const seoRoutes = [
  { href: "/", label: "Titan DeFi Super App" },
  { href: "/swap", label: "Sepolia Token Swap" },
  { href: "/liquidity", label: "TITAN WETH Liquidity" },
  { href: "/earn", label: "Earn TITAN Staking Rewards" },
  { href: "/stitan", label: "sTITAN Liquid Staking" },
  { href: "/borrow", label: "Borrow tUSD with TITAN Collateral" },
  { href: "/governance", label: "sTITAN Governance" },
  { href: "/faucet", label: "Sepolia TITAN Faucet" },
  { href: "/privacy", label: "Titan Privacy Notice" },
  { href: "/terms", label: "Titan Terms of Use" },
];

interface SeoPageScaffoldProps {
  title: string;
  description: string;
}

export function SeoPageScaffold({ title, description }: SeoPageScaffoldProps) {
  return (
    <section className="sr-only" aria-label={`${title} overview`}>
      <h1>{title}</h1>
      <p>{description}</p>
      <nav aria-label="Titan internal routes">
        {seoRoutes.map((route) => (
          <a key={route.href} href={route.href}>
            {route.label}
          </a>
        ))}
      </nav>
    </section>
  );
}

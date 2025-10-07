const NGN = new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0});
export default function PricingTable({plans}:{plans:{title:string;priceNGN:number;unit?:string;features:string[];popular?:boolean}[]}){
  if(!plans?.length) return null;
  return <div className="grid md:grid-cols-2 gap-4">
    {plans.map(p=> (
      <div key={p.title} className={`card relative ${p.popular?'ring-2 ring-[color:var(--gold,#D4AF37)]':''}`}>
        {p.popular && (<span className="absolute -top-3 right-4 bg-[color:var(--gold,#D4AF37)] text-[#222] text-xs font-bold px-2 py-0.5 rounded-full">Popular</span>)}
        <h4 className="font-semibold">{p.title}</h4>
        <div className="mt-2 text-xl font-bold">{NGN.format(p.priceNGN)} {p.unit && <span className="text-white/60 text-sm">/ {p.unit}</span>}</div>
        <ul className="mt-3 text-sm text-white/80 space-y-1 list-disc pl-5">{p.features.map(f=> <li key={f}>{f}</li>)}</ul>
      </div>
    ))}
  </div>;
}

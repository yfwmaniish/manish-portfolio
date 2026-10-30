import { AppBody, AppHeader } from '../shared'

// Notes: Manish's pinned notes. DRAFT copy.
export function Notes() {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#F2E6D4] text-ink">
      <AppHeader title="Notes" light />
      <AppBody className="flex flex-col gap-4 p-3.5">
        <div className="flex flex-col gap-1.5 border-b-2 border-dashed border-lilac pb-3.5">
          <span className="font-ui text-[9px] text-plum">pinned · under review</span>
          <span className="font-display text-[20px] font-bold">AdverSim-IDS paper</span>
          <span className="text-[13px]">On what really decides whether an AI intrusion detector can be fooled, with Y. Kumar and R. Sharma. Fingers crossed.</span>
        </div>
        <div className="flex flex-col gap-1.5 border-b-2 border-dashed border-lilac pb-3.5">
          <span className="font-ui text-[9px] text-plum">draft · do not read</span>
          <span className="font-display text-[20px] font-bold">Paper two</span>
          <span className="text-[13px]">Iterated Feature Ablation as a defence. The other half of the same question.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-ui text-[9px] text-plum">to-do</span>
          <span className="text-[13px]">
            ☐ finish final year
            <br />☐ clear Security+ and CEH
            <br />☐ walk the dog
            <br />☑ RHCSA
          </span>
        </div>
      </AppBody>
    </div>
  )
}

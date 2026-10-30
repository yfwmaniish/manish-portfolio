// Scene 4's notebook: Manish's papers and patent, and the AdverSim-IDS illustration.

export const ENTRIES: { label: string; title: string; body: string; link?: { href: string; label: string } }[] = [
  {
    label: 'Entry 01 · under review',
    title: 'Fooling AI intrusion detectors',
    body: '“Adversarial Vulnerability in Machine-Learning-Based Network Intrusion Detection: The Role of Feature Controllability and Identity.” M. Tiwari, Y. Kumar, R. Sharma. Under review, 2026. Built on AdverSim-IDS.',
    link: { href: 'https://github.com/yfwmaniish/adversim-ids', label: 'AdverSim-IDS on GitHub ›' },
  },
  {
    label: 'Entry 02 · in preparation',
    title: 'Iterated Feature Ablation',
    body: '“Iterated Feature Ablation as a Defence for ML-Based Network Intrusion Detection” (working title). The defence side of the same research.',
  },
  {
    label: 'Entry 03 · patent published',
    title: 'Indian Patent App. 202611060571',
    body: '“An Extraction Apparatus and a Process for Production of Aromatic Compounds Thereof.” Manish is one of the inventors. Published 17 July 2026. Yes, a security researcher with a chemistry patent.',
  },
]

/** The AdverSim-IDS illustration: one attack flow, two ways to try to sneak it past. */
export const IDS_DEMO = {
  tag: 'Try it · a simple illustration, not real results',
  subject: 'Flow #4471 · SSH · 212 login tries in 40 s',
  meter: 'How sure the IDS is that it’s an attack',
  verdict: 'The IDS says',
  clues: ['Attack 1 may change anything: protocol, port, packet sizes.', 'Attack 2 may change only what an attacker controls: timing and padding.'],
  steps: [
    { read: 'Attack. Brute force.', unc: 97, note: 'The attacker wants this flow to look normal. Try to fool the detector.', button: 'Attack: change anything ›', bar: '#FF6A6A' },
    {
      read: 'Normal…?',
      unc: 9,
      note: "Fooled! But it changed the protocol and the port, so this flow can't log in to anything any more. Plenty of benchmarks still count that as a win.",
      button: 'Attack: only what an attacker controls ›',
      bar: '#7FD1C7',
    },
    {
      read: 'Attack. Still.',
      unc: 74,
      note: 'With honest limits, the attack is much weaker in this example. AdverSim-IDS measures attacks this way, so defenders see the real risk, not an inflated one.',
      button: 'Start over ↺',
      bar: '#FFC56B',
    },
  ],
}

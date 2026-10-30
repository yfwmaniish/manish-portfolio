// Flyers that blow down the promenade. Catch one to read it.
// DRAFT copy, written for this build: Mumbai street-flyer jokes, nothing about Ali.
// Ali to approve or rewrite.

export interface Flyer {
  id: string
  head: string
  body: string[]
  foot: string
  paper: string
  ink: string
  band: string
}

export const FLYERS: Flyer[] = [
  {
    id: 'classes',
    head: 'SUCCESS CLASSES',
    body: ['IIT-JEE · NEET · CET', '100% RESULTS*', '*results may vary'],
    foot: 'Opp. the bus stop, 2nd floor. Ask for Sir.',
    paper: '#F2E6D4',
    ink: '#1E1630',
    band: '#E04848',
  },
  {
    id: 'lost-ball',
    head: 'LOST',
    body: ['One tennis ball, taped.', 'Last seen going over the sea wall.', 'Reward: eternal gratitude.'],
    foot: '— the under-11s',
    paper: '#FFF3D0',
    ink: '#1E1630',
    band: '#4A6FA5',
  },
  {
    id: 'baba',
    head: 'BABA BENGALI',
    body: ['Love problem? Exam problem?', 'Hostel Wi-Fi problem?', 'Solution in 24 hrs. 100% guarantee.'],
    foot: 'Call now. No calls after 10 PM.',
    paper: '#FFE3A8',
    ink: '#3A1530',
    band: '#6B345F',
  },
  {
    id: 'rent',
    head: '1 BHK FOR RENT',
    body: ['Sea view*', '*if you lean out of the', 'bathroom window'],
    foot: 'Brokers please excuse. Brokers please call.',
    paper: '#E8F1EC',
    ink: '#14122B',
    band: '#3E8E85',
  },
  {
    id: 'vada-pav',
    head: 'GRAND OPENING',
    body: ['Vada pav ₹20 · Cutting chai ₹15', 'First 10 customers', 'get extra chutney'],
    foot: 'Near the gymkhana gate',
    paper: '#F7EAD7',
    ink: '#1E1630',
    band: '#FF8A4C',
  },
]

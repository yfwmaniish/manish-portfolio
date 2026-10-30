// The eight moments, from the prototype's momentDefs() (two hints made clearer).
export const MOMENTS = [
  { id: 'phone', title: "Picked up Manish's phone", hint: 'it buzzes in the corner' },
  { id: 'ali', title: 'Actually talked to Manish', hint: 'the promenade, 6:30 PM' },
  { id: 'chai', title: 'Bothered the chai wala', hint: 'he knows things' },
  { id: 'cat', title: 'Made friends with the indie', hint: 'on the wall at 6:30 PM' },
  { id: 'rain', title: 'Got caught in the rain', hint: 'around 9:40 PM' },
  { id: 'sarcasm', title: 'Tried to fool an IDS', hint: 'the notebook, 11:50 PM' },
  { id: 'photo', title: 'Took a photo of the city', hint: 'camera app' },
  { id: 'dawn', title: 'Stayed till sunrise', hint: 'walk to the very end' },
] as const

export type MomentId = (typeof MOMENTS)[number]['id']

// Manish's scripted replies in the Messages app. DRAFT copy, in his texting voice:
// Manish to approve or rewrite.

export interface ChatQuestion {
  q: string
  a: string[]
  card?: boolean
}

export const CHAT_INTRO = ['oh no.', 'you found my phone.']
export const CHAT_INVITE = "ok fine. since you're here, ask me something. (pick a question. I'm not a real chatbot.)"

export const CHAT: Record<string, ChatQuestion> = {
  what: {
    q: 'so what do you actually do?',
    a: ['security research, mostly.', 'I take malware apart, read the logs nobody wants to read, and test whether AI defences can be fooled.', "so far at DRDO, the Haryana Police STF and IBM."],
  },
  hire: {
    q: 'are you open to work?',
    a: ['YES.', "final year, B.Tech CSE in cybersecurity. security internships, analyst or pentester roles, and startup collabs.", 'RHCSA done. Security+ and CEH on the way.'],
  },
  best: {
    q: "what's your best project?",
    a: ['depends on the day.', 'biggest: Aegis Sandbox. it takes malware apart, then runs it in a box with no internet to see what it does.', 'most real: SDRMS. the Haryana Police actually used it. both are in my Gallery app.'],
  },
  ids: {
    q: 'can you hack an AI?',
    a: ['legally? yes. that is literally my research.', 'AdverSim-IDS throws seven kinds of attack at AI intrusion detectors.', "the twist: most papers let the attacker change things no real attacker can. I only allow what they really control. try it at 11:50 PM."],
  },
  oss: {
    q: 'do you do open source?',
    a: ['yep. 21 PRs merged so far: PostHog, Strapi, htmx, joi, zsh-syntax-highlighting.', 'the ones I like most are still in review: a SQL injection fix for knex and a ReDoS fix for jsonwebtoken.', 'reading other people’s code is the best way to learn how it breaks.'],
  },
  ctf: {
    q: 'do you play CTFs?',
    a: ['since 2022. I co-founded nCreeps, our CTF team.', 'top 5 globally at Hackapptoi, finalists at Vishwa CTF.', 'and when it’s not a CTF it’s Valorant. 3× ROG Showdown champion.'],
  },
  why: {
    q: 'why is your portfolio a whole night in Mumbai??',
    a: ['because every security portfolio is a black screen with green text.', 'my friend Ali made his like this. I asked for one too. the dog is mine though.'],
  },
  card: { q: 'send me your details', a: ['here, take my card.'], card: true },
}

// Contact details, from Manish's résumé (2026-10-30). His phone number is left off on purpose.
export const CONTACT = {
  name: 'Manish Tiwari',
  tagline: 'Final-year B.Tech CSE (Cybersecurity) · GD Goenka University · Gurugram',
  open: 'Open to security research, analyst and pentester roles',
  github: { href: 'https://github.com/yfwmaniish', label: 'yfwmaniish' },
  email: { href: 'mailto:tiwarimanish2810@gmail.com', label: 'tiwarimanish2810@gmail.com' },
  linkedin: { href: 'https://www.linkedin.com/in/manish-tiwarisec/', label: 'in/manish-tiwarisec' },
  resume: { href: '/manish-tiwari-resume.pdf', label: 'Résumé (PDF)' },
}

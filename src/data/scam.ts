// Scene 2's Sentinel-05 demo: a friend's server log lands on Manish's phone and you
// triage it. A simple, labelled illustration of the idea, not the real pipeline.
// The IP is from a range reserved for examples (TEST-NET-3). DRAFT copy.

export const LOG = {
  from: "a friend's server · security log · 8:04 PM",
  lines: [
    '20:01:12  4625  logon failed  admin  from 203.0.113.47  (×212)',
    '20:02:40  4624  logon ok      admin  from 203.0.113.47',
    '20:03:05  powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3…',
    '20:03:31  vssadmin.exe delete shadows /all /quiet',
    '20:03:58  net user support$ ******** /add',
  ],
}

/** What the demo points out, one at a time, and which log lines each one is about. */
export const LOG_CLUES = [
  { lines: [0, 1], text: '212 failed logins from one IP, then one works. Brute force.', tag: 'T1110' },
  { lines: [2], text: 'Encoded, hidden PowerShell: it doesn’t want you to read what it runs.', tag: 'T1059.001' },
  { lines: [3], text: 'Deleting shadow copies kills the backups. That’s ransomware getting ready.', tag: 'T1490' },
  { lines: [4], text: 'A new admin account with a $ to hide it, to get back in later.', tag: 'T1136' },
]

export const LOG_VERDICT = {
  title: 'Incident. Isolate that server now.',
  ioc: '203.0.113.47',
  note: 'Sentinel-05 pulls indicators like these out of a raw log, checks them against threat intel, maps every step to MITRE ATT&CK, and writes the rule to catch it next time.',
}

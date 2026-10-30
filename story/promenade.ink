// The promenade, 6:30 PM. Manish Tiwari ("Decimal") on Marine Drive.
// Rewritten for Manish from the template, approved 2026-10-30.
// "Name: text" lines are spoken by Name; the game reads the prefix.
// A tag after a line (# smile) sets the speaker's expression in their portrait.
// Knot and variable names (ali, cat, talked_ali…) are the template's internal ids.

EXTERNAL look(target)
EXTERNAL show(what)
EXTERNAL cue(name)
EXTERNAL moment(id)
EXTERNAL phone()
EXTERNAL ending()

VAR talked_ali = false
VAR talked_vendor = false
VAR chai_bought = false
VAR chai_debt_paid = false
VAR ali_knows_debt = false
VAR cat_follows = false
VAR met_ali2 = false
VAR took_portrait = false
VAR checked_scam = false
VAR met_ali3 = false
VAR met_ali4 = false
VAR met_ali5 = false
VAR met_ali6 = false
// Set by the game before each conversation.
VAR pages_found = 0
VAR gave_pages = false

-> DONE

=== ali ===
~ look("ali")
{ talked_ali: -> again }
~ talked_ali = true
Manish: Oh, hi! You stopped. Most people just walk past. # surprised
Manish: The wind out here keeps trying to steal my notes. If you see any of my pages on your walk, could you pick them up? # neutral
-> openers

= again
{ not talked_ali: -> ali }
~ look("ali")
{
- chai_debt_paid and not ali_knows_debt:
    ~ ali_knows_debt = true
    Manish: Wait. He says I don't owe him anything now. Did you pay for my chai? Thank you. That's a little embarrassing. # surprised
- else:
    Manish: Anything else? Also, the chai wala keeps looking at you. # smug
}
-> openers

= openers
+ [What are you working on?] -> work
+ [Why are you working by the sea?] -> beach
+ [Just show me the cool stuff] -> cool

=== work ===
~ moment("ali")
Manish: Research. I attack AI that's meant to catch hackers, to find out how easily it can really be fooled. # smile
+ [Can I see?] -> screen("scan")
+ [What else?] -> work2
+ [Ask something else] -> ali.again

=== work2 ===
~ moment("ali")
Manish: A tool that reads a server's logs and tells you who broke in, how, and what to block. Logs are boring. That's why I made a machine read them. # smug
+ [Show me] -> screen("nicetry")
+ [Ask something else] -> ali.again

=== beach ===
~ moment("ali")
Manish: Final year. I'm a long way from Gurugram, the sea is quiet, and nobody here asks me to fix their Wi-Fi. # neutral
+ [Fair. So who are you?] -> who
+ [Ask something else] -> ali.again

=== who ===
~ moment("ali")
Manish: I'm Manish. Most people call me Decimal. Final year of B.Tech CSE, in cybersecurity. # smile
Manish: I've worked with DRDO, the Haryana Police and IBM. I take malware apart, read logs, test whether AI defences actually hold, and send fixes to open source projects. # smile
+ [Open your file] -> screen("about")
+ [Ask something else] -> ali.again

=== cool ===
~ moment("ali")
Manish: Straight to it. Okay, here's my phone. All my work is in there. Please don't read my drafts. # smug
+ [Take the phone]
    ~ phone()
    -> DONE
+ [Ask something else] -> ali.again

// He turns the laptop toward you. The card beside it does the talking.
=== screen(what) ===
~ moment("ali")
~ look("laptop")
~ show(what)
+ [Ask something else]
    ~ show("")
    -> ali.again

=== vendor ===
~ look("vendor")
~ talked_vendor = true
~ moment("chai")
{ chai_debt_paid: -> after_tab }
Chai wala: Manish? Every evening. Opens his laptop, orders one small chai, never finishes it. He told me he's "hunting threats". I gave him a mosquito coil. # grin
-> options

= options
+ {not chai_bought} [One chai, please] -> pour
+ {chai_bought and not chai_debt_paid} [I'll pay for Manish's three chais too] -> pay
+ [Talk to Manish] -> ali.again

= pour
~ chai_bought = true
~ cue("pour")
Chai wala: Fifteen rupees. Manish still owes me for three chais. Tell that to his future boss. # grin
-> options

= pay
~ chai_debt_paid = true
~ cue("cash")
Chai wala: Sixty rupees for everything? Okay. I won't tell him. He can find out when he tries to pay. # surprised
-> options

= after_tab
Chai wala: You again! For the first time this year, Manish owes me nothing. It feels strange. # neutral
-> options

// A black indie dog on the sea wall. (The knot is still called "cat".)
=== cat ===
~ look("cat")
Indie: Boof. # curious
+ [Scratch behind the ears] -> pet
+ [Talk to Manish] -> ali.again

= pet
~ cue("pet")
~ cat_follows = true
Indie: The dog does not care about portfolios. Its tail does, though. Now it wants to come with you. # happy
+ [Talk to Manish] -> ali.again

// ------------------------------------------------------------ Scene 2, 8:05 PM
// "Who's there?" The streetlights are on; you get a better look at him.

=== ali2 ===
~ look("ali2")
{ met_ali2: -> again }
~ met_ali2 = true
{
- talked_ali:
    Manish: Oh, it's you again! You kept walking. # surprised
- else:
    Manish: Hi. Are you looking for someone? # surprised
}
Manish: Final year, cybersecurity. I founded Veltro, I play CTFs with my team, nCreeps, and right now I'm a research intern at DRDO. I can't tell you about that part. Really. # smug
Manish: Everything else I can show you. I like turning messy evidence into a clear answer: what happened, who did it, what to block. # neutral
Manish: Hold on. A friend just sent me his server's log. "Is this normal??" Three question marks. That's never good. # neutral
-> options

= again
~ look("ali2")
Manish: Still here? All the streetlights are on now. # smug
-> options

= options
+ {not checked_scam} [Can I look at that log?] -> scam
+ [Can I see your profile?] -> file
+ {not took_portrait} [Can I take your picture?] -> picture

= file
~ show("about")
+ [Close the profile]
    ~ show("")
    -> again

= scam
~ checked_scam = true
~ show("scam")
+ [Give the phone back]
    ~ show("")
    -> again

= picture
~ took_portrait = true
~ cue("snap")
Manish: …Fine. One. Don't post it. I'll know. # smug
-> options

// ------------------------------------------------------------ Scene 3, 9:40 PM
// "Rain on the camera roll." Under the bus-stop awning, out of the monsoon.

=== ali3 ===
~ look("ali3")
{ met_ali3: -> again }
~ met_ali3 = true
The monsoon rain starts. Everyone runs under the bus stop roof. Manish is looking at old photos on his phone.
{ took_portrait:
    Manish: You're dripping on my phone! Oh, is that the photo you took earlier? Fine, I'll keep it. # smug
- else:
    Manish: Come in, you're soaked! Here, I was just looking at these. # smile
}
-> options

= again
~ look("ali3")
Manish: It's still raining. Want to see the photos again? # neutral
-> options

= options
+ [Look at the photos] -> roll

= roll
~ show("roll")
+ [Hand the phone back]
    ~ show("")
    -> again

// ------------------------------------------------------------ Scene 4, 11:50 PM
// "The notebook." The rain has stopped; a table outside the Irani café.

=== ali4 ===
~ look("ali4")
{ met_ali4: -> again }
~ met_ali4 = true
The rain has stopped. Manish opens a notebook. It's full of attack diagrams and little drawings.
{ chai_debt_paid:
    Manish: The chai wala sent me a chai. He said it was "already paid". I know that was you. # smug
}
{ cat_follows:
    Manish: Is that the indie from the promenade? That dog never follows anyone! I've got a black indie just like that at home. # surprised
}
{ pages_found > 0:
    Manish: Wait. Are those… my pages? # surprised
}
Manish: This is the work I care about most. Want to see? # smile
-> options

= again
~ look("ali4")
Manish: The notebook is still open. # neutral
-> options

= options
+ {not gave_pages and pages_found > 0} [Give Manish his pages] -> give
+ [Read the notebook] -> book
+ [Show me Aegis] -> ev

= ev
Manish: Aegis is my malware lab. Hand it a file and it takes it apart without ever running it. Here, pick a file. Would you open any of these? # smile
~ show("ev")
+ [Close it]
    ~ show("")
    -> again

= give
~ gave_pages = true
{
- pages_found >= 15:
    Manish: All of them? Every single page? You walked the whole promenade for my notebook. # surprised
- pages_found >= 8:
    Manish: That's most of my notebook! You actually went looking. Thank you. # smile
- pages_found >= 3:
    Manish: You found {pages_found} of my pages! I thought they were in the sea by now. # surprised
- else:
    Manish: You found one! That's one more than I had. Thank you. # smile
}
Manish: Here, sit. Let me put them back in. # smile
-> book

= book
~ show("notebook")
+ [Close the notebook]
    ~ show("")
    -> again

// ------------------------------------------------------------ Scene 5, 2:10 AM
// "Constellations." Lying back on the sea wall.

=== ali5 ===
~ look("ali5")
{ met_ali5: -> again }
~ met_ali5 = true
The city is finally quiet, and you can see the stars. You both lie back on the wall and give them names.
Manish: Lie down, the wall is still warm. See that bright one? I'm calling it Wazuh. It watches everything. Don't laugh. # smile
-> options

= again
~ look("ali5")
Manish: Still looking at the stars? # neutral
-> options

= options
+ [Look up] -> sky

= sky
~ look("sky")
~ show("stars")
+ [Sit up]
    ~ show("")
    -> again

// ------------------------------------------------------------ Scene 6, 5:48 AM
// "First light." Bag on his shoulder, watching the sun come up by the sea link.

=== ali6 ===
~ look("ali6")
{ met_ali6: -> again }
~ met_ali6 = true
{
- talked_ali:
    Manish: You stayed the whole night! Nobody does that. # surprised
- else:
    Manish: Good morning. Have you been walking all night? # smile
}
{ cat_follows:
    Manish: And the indie is still with you. It's your dog now. Those are the rules. # smug
}
{
- pages_found >= 15:
    Manish: And you found every page of my notebook. Keep it. You know it better than I do now. # smile
- pages_found >= 8:
    Manish: And thanks for finding my pages. Most of my year was on them. # smile
}
Manish: Thanks for staying the whole night. Whatever I end up defending next, I hope it's with a team like you. # smile
-> options

= again
~ look("ali6")
Manish: The sun is up. I should sleep. One more match first. # smug
-> options

= options
+ [Watch the sun come up] -> watch

= watch
~ ending()
-> DONE

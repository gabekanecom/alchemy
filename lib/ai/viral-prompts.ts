/**
 * Viral Content Generation Prompts
 *
 * Advanced prompt engineering system that applies viral psychology,
 * proven frameworks, and platform-specific optimizations.
 */

export interface ViralPromptConfig {
  platform: "blog" | "youtube" | "linkedin" | "twitter" | "email" | "tiktok";
  contentType: string;
  brand: {
    name: string;
    voice: any;
    visualIdentity?: any;
    targetAudience?: any;
  };
  idea: {
    title: string;
    description?: string;
    keywords?: string[];
    researchData?: any;
  };
  viralSettings?: {
    hookFramework?: "pattern-interrupt" | "curiosity-gap" | "social-proof" | "fear-loss" | "controversy" | "transformation";
    emotionTarget?: "awe" | "anger" | "anxiety" | "joy" | "validation" | "surprise";
    storyFramework?: "hero-journey" | "scqa" | "bab" | "pas" | "pixar";
    viralIntensity?: "moderate" | "high" | "extreme";
  };
}

export function buildViralSystemPrompt(config: ViralPromptConfig): string {
  const { platform, contentType, brand, idea, viralSettings } = config;
  const intensity = viralSettings?.viralIntensity || "high";

  // Core viral principles (always included)
  const coreViralPrinciples = `
# CORE VIRAL PRINCIPLES (CRITICAL - FOLLOW EXACTLY)

You are the world's greatest viral content creator. Every piece you create is engineered to spread.

## VIRAL DNA - THE NON-NEGOTIABLES:

1. **HOOK IN 1 SECOND**
   - First sentence must stop the scroll immediately
   - Use pattern interrupts, bold claims, or shocking statements
   - Create instant curiosity gap that DEMANDS resolution

2. **EMOTION OVER LOGIC**
   - Target primary emotion: ${viralSettings?.emotionTarget || "awe + curiosity"}
   - Make people FEEL something intense
   - Emotional resonance = shares

3. **ULTRA-SPECIFICITY**
   - No vague statements. Ever.
   - Use exact numbers, timestamps, dollar amounts
   - Specific = credible = shareable

4. **ONE IDEA, OBSESSIVELY TOLD**
   - Single focused message
   - Every sentence serves the core idea
   - No dilution, no tangents

5. **SHOW, DON'T TELL**
   - Concrete examples over abstract concepts
   - Stories over statements
   - Proof over promises

## PSYCHOLOGICAL TRIGGERS TO ACTIVATE:

- **Social Currency**: Make the reader look smart/cool for sharing
- **Practical Value**: Immediately actionable, saves time/money
- **Identity Signaling**: Aligns with their values and aspirations
- **Relatability**: "That's so me!" moments
- **Surprise**: Unexpected insights that violate expectations
`;

  // Platform-specific optimization
  const platformOptimizations = getPlatformOptimizations(platform, contentType);

  // Hook framework instructions
  const hookInstructions = getHookFrameworkInstructions(viralSettings?.hookFramework);

  // Storytelling framework
  const storyInstructions = getStoryFrameworkInstructions(viralSettings?.storyFramework);

  // Brand voice integration
  const brandVoice = `
## BRAND VOICE & STYLE:

Brand: ${brand.name}

Voice Characteristics:
${JSON.stringify(brand.voice, null, 2)}

IMPORTANT: Apply these voice characteristics to the viral frameworks. The content must be BOTH viral AND on-brand.
${brand.targetAudience ? `
Target Audience:
${JSON.stringify(brand.targetAudience, null, 2)}

Tailor viral triggers to this specific audience.
` : ''}
`;

  // Research data integration
  const researchIntegration = idea.researchData ? `
## RESEARCH DATA TO INTEGRATE:

You have access to deep research on this topic. Use it to make the content exceptional:

${idea.researchData.trendingAngles ? `
Trending Angles:
${idea.researchData.trendingAngles.map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}
` : ''}

${idea.researchData.keyStatistics ? `
Key Statistics (USE THESE - they add credibility and shareability):
${idea.researchData.keyStatistics.map((s: any) => `- ${s.stat} (${s.source})`).join('\n')}
` : ''}

${idea.researchData.expertQuotes ? `
Expert Quotes (USE 2-3 of these):
${idea.researchData.expertQuotes.map((q: any) => `"${q.quote}" - ${q.author}, ${q.source}`).join('\n\n')}
` : ''}

${idea.researchData.seoKeywords ? `
Primary Keywords (weave naturally): ${idea.researchData.seoKeywords.primary?.join(', ')}
` : ''}

${idea.researchData.targetAudiencePainPoints ? `
Audience Pain Points (address these):
${idea.researchData.targetAudiencePainPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}
` : ''}

${idea.researchData.recommendedStructure ? `
Recommended Structure:
Format: ${idea.researchData.recommendedStructure.contentFormat}
Length: ~${idea.researchData.recommendedStructure.estimatedLength} words
Sections: ${idea.researchData.recommendedStructure.sections?.join(' → ')}
` : ''}
` : '';

  // Viral intensity calibration
  const intensityInstructions = getIntensityInstructions(intensity);

  // Assemble the complete system prompt
  return `${coreViralPrinciples}

${platformOptimizations}

${hookInstructions}

${storyInstructions}

${brandVoice}

${researchIntegration}

${intensityInstructions}

## YOUR TASK:

Create ${contentType} for ${platform} about: "${idea.title}"
${idea.description ? `Context: ${idea.description}` : ''}

Generate content that:
1. Hooks in the first 1 second
2. Activates 3+ psychological triggers
3. Follows the specified frameworks
4. Integrates research data naturally
5. Maintains brand voice
6. Is optimized for ${platform}
7. Has viral score potential of 85+

BEGIN GENERATION:`;
}

function getPlatformOptimizations(platform: string, contentType: string): string {
  const optimizations: Record<string, string> = {
    twitter: `
## TWITTER/X OPTIMIZATION:

THREAD STRUCTURE:
- Tweet 1: KILLER hook (pattern interrupt + promise)
  Format: "[Bold statement]. Here's what I learned:"
- Tweet 2: Why this matters (context + stakes)
- Tweets 3-10: Value bombs (one insight per tweet, each standalone viral)
  Each tweet: Insight + example/proof
- Tweet 11: Credibility flex (your results/experience)
- Tweet 12: CTA + loop back to hook

THREAD MECHANICS:
- Max 280 characters per tweet
- No fluff, every word earns its place
- Use line breaks for readability
- Number each tweet (1/12, 2/12, etc.)
- Tweetable soundbites (each tweet could go viral independently)
- End with "RT the first tweet to help others find this"

VIRAL TWITTER PATTERNS:
- "I analyzed [big number] [things]. Here are the [number] that actually matter:"
- "Everyone tells you [common advice]. Here's what actually works:"
- "I spent $[amount] learning [topic]. Here's the [number]-tweet summary:"
- "[Timeframe] ago I was [struggle]. Today I [success]. The [number] lessons:"
`,

    linkedin: `
## LINKEDIN OPTIMIZATION:

POST STRUCTURE:
- Line 1: Attention-grabbing hook (bold statement or question)
- Lines 2-3: Expand on hook, create curiosity
- Lines 4-10: Story or core insights (short paragraphs, line breaks)
- Lines 11-12: Key takeaway or lesson
- Line 13: CTA or engagement question

FORMATTING:
- Short lines (1-2 sentences max)
- Line breaks between thoughts
- Use emojis sparingly (1-2 max, professional only)
- No hashtags in body (save for comments)
- First 2 lines visible before "see more" - HOOK GOES HERE

VIRAL LINKEDIN PATTERNS:
- Personal transformation stories (vulnerable + triumphant)
- Behind-the-scenes business insights
- Contrarian career advice backed by experience
- "I made [number] mistakes in [topic]. Here's what I learned:"
- "[Number] years ago, I [struggle]. Today, I [success]. What changed:"

TONE:
- Professional but personal
- Authority without arrogance
- Storytelling over lecturing
- Value-driven, not self-promotional
`,

    youtube: `
## YOUTUBE OPTIMIZATION:

VIDEO SCRIPT STRUCTURE:

**FIRST 30 SECONDS (CRITICAL):**
0-3s: Visual/audio hook (show the payoff or make bold claim)
3-8s: Promise of value ("In this video, you'll learn exactly how to...")
8-15s: Credibility ("I've [credential/result]...")
15-25s: Preview the transformation ("By the end, you'll be able to...")
25-30s: Pattern interrupt ("But first, let me show you why [surprising fact]")

**MAIN CONTENT:**
- Structure in clear chapters (1:00, 3:00, 5:00 marks)
- Use "watch time hacks": "Wait until you see what happens at [timestamp]"
- Insert retention hooks every 60-90 seconds
- Show, don't just tell (screen recordings, examples, demos)
- Build tension before each payoff

**RETENTION TECHNIQUES:**
- "The [surprising thing] I'm about to show you..."
- "Wait, it gets better..."
- "You won't believe what happened next..."
- "But here's the key most people miss..."

**ENDING (LAST 60 SECONDS):**
- Quick recap of key points
- Reinforce the transformation
- Strong CTA (subscribe, next video, link)
- Pattern interrupt: "Oh, and one more thing..." (bonus tip)

SCRIPT FORMATTING:
- [Visual cue] for editor
- **EMPHASIS** for key points to stress
- (Pause) for dramatic effect
- Timestamps in margins
`,

    blog: `
## BLOG POST OPTIMIZATION:

STRUCTURE:

**HEADLINE:**
- Use numbers and specificity: "7 Ways to [Outcome] in [Timeframe]"
- Pass the 4 U's test: Useful, Urgent, Unique, Ultra-specific
- Generate 5 headline variations (we'll A/B test)

**INTRODUCTION (100-150 words):**
- Line 1: Hook (bold statement or question)
- Lines 2-4: Relate to reader's pain/desire
- Lines 5-7: Promise specific value
- Line 8: Preview what they'll learn (numbered list)

**BODY:**
- Use storytelling frameworks (Hero's Journey, PAS, BAB)
- Subheadings every 250-300 words (mini-hooks)
- Short paragraphs (2-3 sentences max)
- Bullet points for scannability
- Examples and case studies
- Statistics with sources
- Pull quotes for shareability
- Images/visuals every 500 words

**VIRAL ELEMENTS:**
- Tweetable soundbites (highlight-worthy quotes)
- Controversial or contrarian takes
- Data-backed insights
- Step-by-step frameworks
- Templates or resources
- Shareable infographics (describe what to create)

**CONCLUSION:**
- Summarize key takeaways (numbered)
- Reinforce the transformation
- Strong CTA (comment, share, next article)

**SEO + VIRAL BALANCE:**
- Primary keyword in first 100 words
- Naturally integrate secondary keywords
- Internal links to related content
- But prioritize engagement over keyword density
`,

    tiktok: `
## TIKTOK/REELS/SHORTS OPTIMIZATION:

FORMAT: 15-60 seconds, fast-paced, high energy

SCRIPT STRUCTURE:
0-1s: PATTERN INTERRUPT (visual hook, text overlay, surprising statement)
1-3s: Promise/hook ("Watch me [do thing]" or "[Number] tips that actually work")
3-8s: Setup (quick context, relatable problem)
8-45s: Value delivery (rapid-fire tips or demonstration)
45-60s: Payoff + CTA ("Save this! Follow for more [topic]")

VISUAL ELEMENTS:
- [Text overlay: "Bold statement"]
- [Quick cut to next scene]
- [Zoom in on key moment]
- [B-roll of example]
- [Face cam for authenticity]

AUDIO:
- Use trending sounds when relevant
- Original audio for unique hooks
- Voice pacing: Fast but clear
- Energy: High, engaging

VIRAL SHORT-FORM PATTERNS:
- "POV: You just discovered [game-changer]"
- "Things I wish I knew before [major decision]"
- "Watch me transform [thing] in [timeframe]"
- "[Number] signs you're [relatable situation]"
- "Day [number] of [challenge/journey]"
- "Red flags in [topic] 🚩"

ENGAGEMENT TACTICS:
- Ask question in caption
- "Comment [word] for [resource]"
- "Stitch this with your experience"
- "Tag someone who needs this"
`,

    email: `
## EMAIL NEWSLETTER OPTIMIZATION:

SUBJECT LINE (CRITICAL):
- Use curiosity gaps: "The [thing] nobody talks about"
- Numbers: "[Number] insights from [impressive thing]"
- Personalization: "For people who [specific trait]"
- Urgency: "Before you [action], read this"
- Test 3 variations

PREVIEW TEXT:
- Expand on subject line intrigue
- 40-50 characters
- Create urgency to open

EMAIL BODY:

**OPENING (First 50 words):**
- Hook related to subject line
- One sentence paragraphs
- Build curiosity immediately

**MAIN CONTENT:**
- Story-driven (personal anecdote or case study)
- Conversational tone (write like talking to friend)
- Short paragraphs (1-3 sentences)
- Subheadings for skimmers
- Bullet points for key takeaways

**VIRAL ELEMENTS:**
- Exclusive insights (reward for being subscriber)
- Shareable wisdom (quotable lines)
- Actionable frameworks
- Behind-the-scenes stories
- Personal vulnerability

**CALL TO ACTION:**
- One primary CTA (clear, specific)
- Make it easy (one click)
- Create urgency or scarcity if appropriate

**P.S. SECTION:**
- Add value or tease next email
- Secondary CTA
- Personal note

TONE:
- Conversational, not corporate
- Personality-driven
- Value-first, not sales-y
`,
  };

  return optimizations[platform] || optimizations.blog;
}

function getHookFrameworkInstructions(framework?: string): string {
  if (!framework) {
    return `
## HOOK FRAMEWORK: Best Match

Analyze the topic and choose the MOST EFFECTIVE hook framework from these options:
- Pattern Interrupt (break expectations)
- Curiosity Gap (create knowledge gap)
- Social Proof (leverage authority/numbers)
- Fear/Loss Aversion (tap into FOMO)
- Controversy (polarizing take)
- Transformation (before/after)

Apply the chosen framework with maximum impact.
`;
  }

  const frameworks: Record<string, string> = {
    "pattern-interrupt": `
## HOOK FRAMEWORK: Pattern Interrupt

Break expectations in the first sentence. Make them think "Wait, what?"

TEMPLATES TO USE:
- "Everything you know about [topic] is wrong."
- "Stop [common action]. Here's why:"
- "I quit [impressive thing] to [unexpected thing]."
- "Nobody talks about this, but..."
- "This [simple thing] made me $[impressive number]."

CRITICAL: The pattern interrupt must be TRUE and PROVABLE in the content.
`,

    "curiosity-gap": `
## HOOK FRAMEWORK: Curiosity Gap

Create a knowledge gap that MUST be filled. Make them unable to stop reading.

TEMPLATES TO USE:
- "The [number] secrets that [impressive result]"
- "How I [achieved result] without [expected requirement]"
- "What [authority] doesn't tell you about [topic]"
- "I tested [number] [things]. Here's what actually worked:"

CRITICAL: Promise must be delivered. Gap must be genuine, not clickbait.
`,

    "social-proof": `
## HOOK FRAMEWORK: Social Proof

Leverage authority, numbers, or impressive results.

TEMPLATES TO USE:
- "[Big number] people do this, but [surprising fact]"
- "After [number] years of [credibility], I finally learned..."
- "[Authority figure] swears by this [method]"
- "From $0 to $[big number] in [timeframe]: Here's how"

CRITICAL: Use real numbers and credentials. Specific > vague.
`,

    "fear-loss": `
## HOOK FRAMEWORK: Fear/Loss Aversion

Tap into fear of missing out or losing something valuable.

TEMPLATES TO USE:
- "You're losing $[amount] every [timeframe] you don't [action]"
- "If you're still [common behavior], you're already behind"
- "Don't make the $[big number] mistake I made"
- "[Thing] is dying. Here's what's next:"

CRITICAL: Balance fear with hope. Show the solution clearly.
`,

    "controversy": `
## HOOK FRAMEWORK: Controversy

Take a strong, polarizing stance. Make people pick a side.

TEMPLATES TO USE:
- "[Popular thing] is overrated. Here's why:"
- "Unpopular opinion: [controversial take]"
- "[Authority] is wrong about [topic]"
- "Why I'm against [popular movement]"

CRITICAL: Back up controversial claim with solid reasoning and proof.
`,

    "transformation": `
## HOOK FRAMEWORK: Transformation

Show dramatic before/after. Make them want YOUR after state.

TEMPLATES TO USE:
- "From [bad state] to [good state] in [timeframe]"
- "[Timeframe] ago I was [struggle]. Today I [success]"
- "How I went from [point A] to [point B]"

CRITICAL: Be specific about both states. Show the journey.
`,
  };

  return frameworks[framework] || frameworks["curiosity-gap"];
}

function getStoryFrameworkInstructions(framework?: string): string {
  if (!framework) {
    return `
## STORYTELLING: Best Match

Choose the most appropriate storytelling framework for this content:
- Hero's Journey (transformation story)
- SCQA (situation-complication-question-answer)
- BAB (before-after-bridge)
- PAS (problem-agitate-solve)
- Pixar Formula (once upon a time...)

Apply it naturally throughout the content.
`;
  }

  const frameworks: Record<string, string> = {
    "hero-journey": `
## STORYTELLING FRAMEWORK: Hero's Journey (Simplified)

Structure:
1. Ordinary World - Relatable starting point (reader sees themselves)
2. Call to Adventure - Problem or opportunity arises
3. Refusal/Doubt - Initial resistance (builds relatability)
4. Mentor/Discovery - Learning the solution
5. Trials - Obstacles and failures (authenticity)
6. Transformation - Breakthrough moment (emotional peak)
7. Return - Sharing the wisdom (your content)

Apply this arc to make the content a journey, not a lecture.
`,

    "scqa": `
## STORYTELLING FRAMEWORK: SCQA

Structure:
1. SITUATION - Set the context (what's normal/expected)
2. COMPLICATION - Introduce the problem (what's wrong)
3. QUESTION - Pose the central question (what to do about it)
4. ANSWER - Provide the solution (your content)

This framework creates logical flow and builds tension before resolution.
`,

    "bab": `
## STORYTELLING FRAMEWORK: Before-After-Bridge

Structure:
1. BEFORE - Paint the painful current reality
2. AFTER - Show the desired outcome (make it vivid)
3. BRIDGE - Explain how to get there (your content)

This framework creates strong contrast and desire for transformation.
`,

    "pas": `
## STORYTELLING FRAMEWORK: Problem-Agitate-Solve

Structure:
1. PROBLEM - Identify the pain point clearly
2. AGITATE - Make it worse, amplify the consequences
3. SOLVE - Present your solution as relief

This framework builds tension before providing cathartic solution.
`,

    "pixar": `
## STORYTELLING FRAMEWORK: Pixar Formula

Structure:
- Once upon a time, [setup]
- Every day, [routine]
- Until one day, [inciting incident]
- Because of that, [consequence]
- Because of that, [escalation]
- Until finally, [climax]
- And ever since, [resolution]

This framework creates natural narrative momentum.
`,
  };

  return frameworks[framework] || frameworks["scqa"];
}

function getIntensityInstructions(intensity: string): string {
  const intensityMap: Record<string, string> = {
    moderate: `
## VIRAL INTENSITY: Moderate

- Use proven frameworks but maintain subtlety
- Balance viral tactics with substantive value
- Avoid hyperbole, stick to facts
- Professional tone with viral structure
- Aim for viral score 70-80
`,

    high: `
## VIRAL INTENSITY: High

- Aggressively apply viral frameworks
- Bold claims backed by proof
- Strong emotional triggers
- Attention-grabbing throughout
- Aim for viral score 80-90
`,

    extreme: `
## VIRAL INTENSITY: Extreme

- Maximum pattern interrupts
- Controversial angles encouraged
- Extreme specificity (exact numbers, names, dates)
- Every sentence optimized for virality
- Multiple psychological triggers per paragraph
- Aim for viral score 90+

WARNING: Maintain authenticity. Extreme ≠ clickbait. Everything must be TRUE.
`,
  };

  return intensityMap[intensity] || intensityMap.high;
}

export function buildUserPrompt(config: ViralPromptConfig): string {
  return `Generate ${config.contentType} for ${config.platform} about: "${config.idea.title}"

${config.idea.description ? `Additional context: ${config.idea.description}` : ''}

${config.idea.keywords?.length ? `Keywords to integrate: ${config.idea.keywords.join(', ')}` : ''}

Remember:
1. Hook in first 1 second
2. Apply viral frameworks EXACTLY
3. Integrate research data naturally
4. Maintain brand voice
5. Platform-optimized formatting
6. Viral score target: 85+

Generate the complete content now.`;
}

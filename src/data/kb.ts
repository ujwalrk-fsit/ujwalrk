/**
 * Knowledge base for the static CHAT agent.
 *
 * Ground truth only. Every claim here is already published on this site, so the
 * agent can be held to it. Nothing here invents a fact, a client name, or a
 * figure. Client, vendor and network names are withheld by agreement and are
 * deliberately absent.
 *
 * `citations` must point at real element ids — scripts/verify-chat.mjs asserts
 * every fragment resolves in the built HTML.
 */

export type Audience = 'recruiter' | 'peer' | 'client';
export type Scope = 'profile' | 'horizon' | 'adapter';

export interface Citation {
  label: string;
  href: string;
}

export interface KbEntry {
  id: string;
  scope: Scope;
  /** Which audiences this entry is most relevant to. Others still match, ranked lower. */
  audience: Audience[];
  /** Lowercase tokens and phrases used for matching. Keep synonyms generous. */
  keywords: string[];
  title: string;
  /** First person, plain, audience-aware. */
  answer: string;
  bullets?: string[];
  citations?: Citation[];
  /** Chips offered after this answer. */
  followUps?: string[];
}

export const PROFILE = {
  name: 'Ujwal Ramesh Karajgikar',
  role: 'Business Analyst + Design Engineer',
  employer: 'Fortunesoft IT Innovations',
  email: 'ukarajgikar@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ujwal-karajgikar',
  github: 'https://github.com/ujwalrk-fsit/ujwalrk',
  resume: '/resume.pdf',
} as const;

/** Shown on first open and whenever the agent is out of its depth. */
export const SUGGESTIONS: { label: string; ask: string }[] = [
  { label: 'What did you actually own at Horizon?', ask: 'What did you own at Horizon' },
  { label: 'Why manual wire transfers?', ask: 'Why did you go with manual wire transfers' },
  { label: 'Is Horizon live?', ask: 'Is Horizon live and what happened' },
  { label: 'How you work', ask: 'What is it like working with you' },
  { label: 'Skills & tools', ask: 'What tools and skills do you have' },
  { label: 'What are you doing now?', ask: 'What are you working on right now' },
];

export const KB: KbEntry[] = [
  /* ------------------------------------------------------------------ profile */
  {
    id: 'who-are-you',
    scope: 'profile',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['who', 'are', 'you', 'introduce', 'introduction', 'about', 'yourself', 'name', 'tell', 'me', 'bio', 'summary', 'short', 'version'],
    title: "I'm Ujwal — a Business Analyst who also builds things",
    answer:
      "I'm Ujwal Ramesh Karajgikar. I've worked as a Business Analyst since September 2025, currently at Fortunesoft IT Innovations across FinTech, Healthcare and Life Sciences work. The short version of what I do: I own what a product has to do — requirements, scope, trade-offs, change control — and I still wireframe and prototype so those conversations stay concrete. Two engagements on the site cover it: Horizon, a secondary-market investment platform that went live, and Adapter, a mobile money and instant payments middleware currently in UAT.",
    citations: [
      { label: 'About', href: '/about' },
      { label: 'Horizon case study', href: '/work/horizon' },
      { label: 'Adapter case study', href: '/work/adapter' },
    ],
    followUps: ['What did you own at Horizon', 'What tools and skills do you have'],
  },
  {
    id: 'what-i-do',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['what', 'do', 'you', 'do', 'role', 'responsibilities', 'work', 'job', 'day', 'day-to-day', 'duties', 'ba', 'business', 'analyst', 'product', 'owner'],
    title: 'Requirements, scope, change control — and prototypes',
    answer:
      "Four things, and they interlock. Requirements and discovery: turning stakeholder conversations, specs and edge cases into scenarios the team agrees on before anything is built. Product ownership: scoping phases, managing change requests, deciding what each release needs. Delivery governance: Jira, workflows and quality tracking, so status is visible to the client and the team. Design engineering: wireframes and small working prototypes. On Horizon that meant owning what the platform had to do while a team of nine built it.",
    bullets: [
      'Requirements and discovery — agreed scenarios before build',
      'Product ownership — phase scope, change requests, release decisions',
      'Delivery governance — Jira, workflows, quality tracking',
      'Design engineering — wireframes and prototypes to keep alignment concrete',
    ],
    citations: [{ label: 'About', href: '/about' }],
    followUps: ['What is it like working with you', 'Tell me about a hard decision you made'],
  },
  {
    id: 'working-with-me',
    scope: 'profile',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['like', 'working', 'with', 'me', 'style', 'approach', 'habits', 'ways', 'philosophy', 'personality', 'manage', 'manageable', 'collaborate', 'collaboration', 'how', 'work', 'with', 'you'],
    title: 'Clarity before code, and status you can see',
    answer:
      "Backend-heavy systems hide their risk in edge cases, so I try to get open questions turned into agreed scenarios before we build — rework in a payments backend is expensive. I keep status visible in the product and in Jira rather than in messages people miss. I write things down: requirements, flow designs and user manuals as versioned documents, so knowledge doesn't leave when people do. And I flag scope honestly — extras and new ideas become visible change requests with estimates, so you always know what you're choosing.",
    bullets: [
      'Clarity before code — edge cases agreed before build',
      'Make status visible — in the product and in Jira, not in DMs',
      'Keep scope honest — extras become priced change requests',
      'Write it down — versioned docs so knowledge outlives people',
      'Plan around dependencies — third-party specs tracked as dated risks',
      'Prototype to align — small builds keep conversations concrete',
    ],
    citations: [{ label: 'About', href: '/about' }],
    followUps: ['Tell me about a hard decision you made', 'What would you do differently'],
  },
  {
    id: 'exp-fortunesoft',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['fortunesoft', 'current', 'job', 'employer', 'work', 'at', 'company', 'experience', 'since', 'september', '2025', 'fintech', 'healthcare', 'life', 'sciences', 'sectors'],
    title: 'Business Analyst at Fortunesoft IT Innovations, since September 2025',
    answer:
      "Since September 2025 I've been a Business Analyst at Fortunesoft IT Innovations, on-site, across FinTech, Healthcare and Life Sciences clients. I own requirements, Jira workflows, wireframes and change-request management on two fintech platforms at once — an investment platform that's live and a payments middleware in UAT. I also scope future phases with clients, from a mobile app through to instant payments as the foundation for a super app, and I keep the project knowledge base current, including a version-controlled user manual.",
    bullets: [
      'Own requirements, Jira workflows, wireframes, change requests',
      'Two fintech platforms in parallel — one live, one in UAT',
      'Scope future phases with clients, mobile app through to instant payments',
      'Maintain requirements docs and a version-controlled user manual',
    ],
    citations: [{ label: 'About', href: '/about' }],
    followUps: ['Is Horizon live and what happened', 'What are you working on right now'],
  },
  {
    id: 'exp-siggraph',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['siggraph', 'bnmit', 'brand', 'development', 'lead', 'student', 'club', 'social', 'media', 'merchandise', 'events', '2022', '2025', 'leadership'],
    title: 'Brand Development Lead, Siggraph BNMIT (Nov 2022 – Jan 2025)',
    answer:
      "Before analysis I was running things. As Brand Development Lead for the Siggraph student club at BNMIT I grew social media by 200%, launched merchandise that actually sold, and organised the club's major events. It's the first time I owned an outcome end to end rather than contributing to one, and it's why I like work where the result is visible.",
    citations: [{ label: 'About', href: '/about' }],
  },
  {
    id: 'exp-ieee',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['ieee', 'cas', 'bangalore', 'web', 'developer', 'wordpress', 'accessibility', 'remote', '2023', '2024', 'frontend', 'pages', 'content'],
    title: 'Web Developer, IEEE CAS Bangalore (Jun 2023 – Jul 2024)',
    answer:
      "Remote web development for IEEE CAS Bangalore — creating and optimising WordPress pages, managing content and improving site accessibility. It's where I learned that an inaccessible interface is a requirements defect, not a polish item, which is a habit I've kept since.",
    citations: [{ label: 'About', href: '/about' }],
  },
  {
    id: 'exp-intern',
    scope: 'profile',
    audience: ['peer', 'recruiter'],
    keywords: ['intern', 'subhanu', 'cloud', 'devops', 'ansible', 'terraform', 'aws', 'linux', 'automation', '2023', 'infrastructure'],
    title: 'Cloud & DevOps Intern, Subhanu Technologies (Sep – Oct 2023)',
    answer:
      "A short cloud internship writing real automation — Ansible and Terraform scripts, working with AWS and Linux fundamentals. It gave me enough infrastructure literacy to have a cost conversation with a client without deferring it to the engineers, which is exactly what the month-8 cost review on Horizon needed.",
    citations: [{ label: 'About', href: '/about' }],
  },
  {
    id: 'skills-business',
    scope: 'profile',
    audience: ['recruiter'],
    keywords: ['skills', 'tools', 'tool', 'stack', 'business', 'analytics', 'ba', 'tooling', 'jira', 'confluence', 'teams', 'excel', 'miro', 'figjam', 'figma', 'powerpoint', 'word', 'software', 'proficient', 'experience', 'use', 'using', 'used', 'stack', 'toolset'],
    title: 'Business analysis toolkit',
    answer:
      "Teams, Jira and Confluence for the work itself; Excel, Word and PowerPoint for the artefacts clients actually read; Miro and FigJam for workshops; Figma for the parts a client needs to see rather than read. If you want the deep-dive list of methods I use rather than just tool names, ask about methods and domains.",
    bullets: ['Teams', 'Jira', 'Confluence', 'Excel', 'Word', 'Powerpoint', 'Miro', 'FigJam', 'Figma'],
    citations: [{ label: 'Skills', href: '/about' }],
    followUps: ['What methods do you use', 'What domains do you know'],
  },
  {
    id: 'skills-technical',
    scope: 'profile',
    audience: ['peer', 'recruiter'],
    keywords: ['technical', 'tech', 'skills', 'coding', 'code', 'programming', 'languages', 'web', 'dev', 'devops', 'python', 'java', 'javascript', 'sql', 'react', 'next', 'node', 'html', 'css', 'typescript', 'docker', 'kubernetes', 'k8s', 'jenkins', 'git', 'github', 'aws', 'stack', 'tools'],
    title: 'Languages, web and DevOps',
    answer:
      "Languages: Python, Java, JavaScript, SQL, R. Web: HTML, CSS, JS, TS, React, Next.js, Supabase, Firebase, Material UI. DevOps and cloud: Ubuntu WSL, Git, GitHub, AWS, Jenkins, Ansible, Terraform, Docker, Kubernetes. Also Power BI, Tableau and Qlik for analysis, and a working AI-tooling habit — I use Claude, ChatGPT, Gemini, OpenCode and Cursor as part of the job, not as a novelty.",
    bullets: [
      'Languages — Python, Java, JavaScript, SQL, R',
      'Web — HTML, CSS, JS, TS, React, Next.js, Supabase, Firebase, Material UI',
      'DevOps — Ubuntu WSL, Git, GitHub, AWS, Jenkins, Ansible, Terraform, Docker, K8s',
      'Data — Power BI, Tableau, Qlik Sense',
    ],
    citations: [{ label: 'Skills', href: '/about' }],
    followUps: ['What methods do you use', 'What projects have you built'],
  },
  {
    id: 'skills-methods',
    scope: 'profile',
    audience: ['peer', 'recruiter'],
    keywords: ['methods', 'methodology', 'how', 'you', 'work', 'process', 'practice', 'scenarios', 'edge', 'cases', 'stories', 'refinement', 'sprint', 'uat', 'stories', 'requirements', 'mapping', 'documentation', 'wireframing', 'schema', 'api'],
    title: 'How the analysis is actually done',
    answer:
      "Requirements and user stories. Scenario and edge-case analysis — the core of it, because in backend-heavy work the edge cases are the product. Process and flow mapping. Formal change-request management. Backlog refinement alongside the client. Sprint ceremonies. UAT planning and support. Wireframing. Technical documentation, including reading APIs and schemas well enough to specify against them. I'd rather do the mapping than have engineering discover the gap in a sprint.",
    bullets: [
      'Requirements and user stories',
      'Scenario and edge-case analysis',
      'Process and flow mapping',
      'Change-request management',
      'Backlog refinement with the client',
      'UAT planning and support',
      'Wireframing',
      'Technical documentation and API / schema reading',
    ],
    citations: [{ label: 'Skills', href: '/about' }],
  },
  {
    id: 'skills-domains',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['domains', 'domain', 'sectors', 'industry', 'know', 'familiar', 'expertise', 'fintech', 'healthcare', 'life', 'sciences', 'investment', 'mobile', 'money', 'payments', 'marketplace'],
    title: 'Domains I have actually worked in',
    answer:
      "FinTech is the deep one — investment platforms, mobile money, instant payments. Healthcare and Life Sciences I've supported at Fortunesoft alongside. I'd rather claim two domains I know properly than eight I've read about, and I've deliberately kept the case studies to two engagements I can defend in detail rather than a long list I can't.",
    citations: [{ label: 'About', href: '/about' }],
  },
  {
    id: 'projects',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['projects', 'built', 'build', 'side', 'personal', 'portfolio', 'apps', 'app', 'kelsa', 'logit', 'sync', 'vercel', 'nextjs', 'next.js', 'frontend', 'practice', 'hobby', 'github', 'code'],
    title: 'Side projects, and why I keep them',
    answer:
      "Four. Kelsa — a visual drag-and-drop task board for students, on Next.js, Material UI, Supabase and Vercel. Logit — a social app where developers share dev logs, on Firebase. Sync — voice-to-text with summarisation using Gemini AI and the Web Speech API. And this portfolio, an Astro static site with two full case studies. I build them to keep engineering depth current, and more usefully to feel what it costs to build the things I specify at work.",
    bullets: [
      'Kelsa — visual task board for students · Next.js, Supabase, Vercel',
      'Logit — social media for dev logs · Next.js, Firebase, Vercel',
      'Sync — voice-to-text and summarisation · Gemini AI, Web Speech API',
      'This portfolio — Astro static site with two case studies',
    ],
    citations: [{ label: 'Play', href: '/play' }],
  },
  {
    id: 'certificates',
    scope: 'profile',
    audience: ['recruiter'],
    keywords: ['certificate', 'certificates', 'certification', 'course', 'courses', 'learning', 'google', 'cybersecurity', 'analytics', 'coursera', 'study', 'trained'],
    title: 'Formal certificates',
    answer:
      "Google Cybersecurity through Coursera — Linux, SQL, Python, SIEM with Splunk and core security concepts. And Google Data Analytics — Sheets, SQL, Tableau and R. I did the security one deliberately: knowing how audit trails and access control actually work makes me a better person to scope them for a regulated client.",
    citations: [{ label: 'About', href: '/about' }],
  },
  {
    id: 'outside-work',
    scope: 'profile',
    audience: ['recruiter', 'peer'],
    keywords: ['outside', 'hobbies', 'interests', 'personally', 'life', 'beyond', 'fun', 'sports', 'running', 'trek', 'adventure', '10k', 'marathon', 'tcs', 'notes'],
    title: 'Outside work',
    answer:
      "I ran my first 10K at TCS World 10K Bengaluru in 2025, and I've been on multiple expeditions with the BNMIT Adventure Club around Karnataka. Both taught me the same thing about endurance projects — the difference between finishing and doing something reckless is preparation and pacing. Both are on the Notes page.",
    citations: [{ label: 'Notes', href: '/notes' }],
  },
  {
    id: 'communication-practice',
    scope: 'profile',
    audience: ['peer', 'client'],
    keywords: ['communication', 'communicate', 'stakeholders', 'presenting', 'speaking', 'podcast', 'fastersmarter', 'faster', 'smarter', 'listening', 'learn', 'training', 'sharpening'],
    title: 'I treat communication as something to practise',
    answer:
      "Most of what I write as requirements has to survive being said out loud first — in workshops, in UAT, in a client call. I work through Think Fast Talk Smart, a Stanford GSB lecturer's podcast on structured communication, answering questions on the spot and explaining complicated things to people who don't share my context. It feeds straight into how I scope things, write acceptance criteria and run refinement. That's the closest thing I have to reps for the stakeholder half of the role.",
    citations: [{ label: 'Play', href: '/play' }],
  },
  {
    id: 'why-me',
    scope: 'profile',
    audience: ['recruiter'],
    keywords: ['why', 'should', 'hire', 'you', 'why-me', 'fit', 'right', 'person', 'value', 'offer', 'good', 'candidate', 'convince'],
    title: 'Why you might want me on a BA seat',
    answer:
      "Three things, and they're all evidence rather than adjectives. I've taken a business off spreadsheets and phone calls and onto one system that went live — about 1,000 investors migrated. I'm comfortable in the awkward middle: I can write the requirement and read the schema it depends on, so the handoff to engineering doesn't lose anything. And I treat scope as something to make visible rather than absorb quietly, which is what keeps a project honest when the client doesn't have a technical team.",
    bullets: [
      'Shipped a live platform, not a deck — ~1,000 investors migrated',
      'Reads specs and schemas, so engineering handoffs lose nothing',
      'Makes scope visible instead of absorbing it quietly',
    ],
    citations: [{ label: 'Horizon case study', href: '/work/horizon' }],
    followUps: ['Is Horizon live and what happened', 'What would you do differently'],
  },
  {
    id: 'availability',
    scope: 'profile',
    audience: ['recruiter'],
    keywords: ['available', 'availability', 'open', 'looking', 'notice', 'join', 'start', 'remote', 'onsite', 'hybrid', 'location', 'bangalore', 'relocate', 'when', 'free'],
    title: 'Ask me directly about availability',
    answer:
      "I'm currently working at Fortunesoft IT Innovations and the site doesn't publish my availability or notice period — that changes, and I'd rather tell you accurately than have it go stale here. Email me and I'll give you a straight answer.",
    citations: [{ label: 'Contact', href: '/about' }],
    followUps: ['How do I get in touch'],
  },
  {
    id: 'contact',
    scope: 'profile',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['contact', 'email', 'touch', 'reach', 'talk', 'call', 'meeting', 'chat', 'connect', 'linkedin', 'message', 'hire', 'discuss', 'get in touch', 'contact you', 'email me', 'reach out', 'say hello'],
    title: 'Get in touch',
    answer:
      "Email is best — ukarajgikar@gmail.com. I'm on LinkedIn and GitHub too, both linked at the bottom of every page. If it's about Horizon or Adapter specifically, I'm genuinely happy to walk through the parts that don't fit on a page, including the parts I'd have chosen differently.",
    citations: [
      { label: 'Email', href: 'mailto:ukarajgikar@gmail.com' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ujwal-karajgikar' },
    ],
    followUps: ['Draft an intro email to Ujwal'],
  },
  {
    id: 'resume',
    scope: 'profile',
    audience: ['recruiter'],
    keywords: ['resume', 'cv', 'download', 'pdf', 'document', 'paper', 'credentials', 'have a resume', 'curriculum vitae', 'send me your cv'],
    title: 'Resume',
    answer:
      "The resume is a one-page PDF linked from the nav and the footer of every page. For anything behind it — how a decision got made, what I'd do differently, what a release actually cost — the two case studies are the better document, and I'd rather you read those.",
    citations: [{ label: 'Resume (PDF)', href: '/resume.pdf' }],
  },
  {
    id: 'is-ai',
    scope: 'profile',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['ai', 'bot', 'chatbot', 'robot', 'real', 'human', 'you', 'actually', 'typing', 'generated', 'llm', 'gpt', 'claude', 'model', 'how', 'work', 'does', 'this', 'technology'],
    title: 'This is a static agent — and no, it is not a human',
    answer:
      "I should be upfront about this. I'm a small program that matches your question against a fixed set of answers written from this site, and shows you the section each answer came from. There's no language model here and nothing you type leaves your browser. That means I can't improvise, I can only be as good as what's written down — and if your question isn't covered, I'll say so rather than guess. For anything that needs judgement, email me instead.",
    citations: [{ label: 'About', href: '/about' }],
    followUps: ['What data does this see', 'How do I get in touch'],
  },
  {
    id: 'privacy',
    scope: 'profile',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['privacy', 'data', 'tracking', 'track', 'cookies', 'cookie', 'analytics', 'record', 'store', 'stored', 'send', 'leak', 'gdpr', 'personal', 'information', 'log', 'logs', 'third', 'party', 'secure', 'security'],
    title: 'Nothing you type leaves your browser',
    answer:
      "There is no server behind this. Your questions are matched against answers that were already compiled into this page, in your browser, and then discarded. No cookies, no analytics on the chat, no third-party API calls, no local storage — nothing you type is saved anywhere, including when you close the tab. I never receive your questions.",
    bullets: [
      'Matching runs entirely in your browser',
      'No cookies, no chat analytics, no third-party calls',
      'No local storage — nothing is kept after you close the tab',
      'I never receive your questions',
    ],
    citations: [],
    followUps: ['Is this a real person', 'How do I get in touch'],
  },

  /* ------------------------------------------------------------------ horizon */
  {
    id: 'h-overview',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'case', 'study', 'platform', 'investment', 'investments', 'secondary', 'market', 'fintech', 'project', 'own', 'owned', 'ownership', 'responsible', 'accountable', 'contribution', 'what', 'was', 'tell', 'about'],
    title: 'Horizon — secondary-market investments, twelve months to go-live',
    answer:
      "Horizon is a secondary-market investment platform. Investors buy units in curated fund offerings backed by private companies, and the platform runs the whole lifecycle — publishing an offering, onboarding the investor, taking the investment, tracking returns. The business already worked; investors were onboarded over the phone, documents were produced by hand, and deal status lived in spreadsheets and in advisors' heads. My brief was to turn a process people already understood into a system that could carry it, and to get a first release live without losing the control the manual process gave the business. I was the only Business Analyst and Product Owner on a nine-person team.",
    bullets: [
      'Oct 2025 – Oct 2026, 12 months kickoff to go-live',
      '~1,000 investors migrated off phone calls and spreadsheets',
      'One pipeline: Submitted → Approved → Subscribed → Allocated',
      '6 staff roles, 3 investor tiers, privilege matrix over 14 modules',
      '3 formal change requests delivered',
    ],
    citations: [
      { label: 'Horizon overview', href: '/work/horizon' },
      { label: 'Context', href: '/work/horizon#context' },
    ],
    followUps: ['Is Horizon live and what happened', 'What did you own at Horizon', 'Summarise Horizon in three bullets'],
  },
  {
    id: 'h-status',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'live', 'status', 'launched', 'launch', 'go-live', 'production', 'shipped', 'current', 'now', 'done', 'complete', 'phase', '2', 'outcome'],
    title: 'Live, with about 1,000 investors migrated',
    answer:
      "Horizon is live. It went to production in October 2026, about twelve months from kickoff, with roughly 1,000 investors migrated from the old records. The client has come back with three change requests since launch, which is the best possible signal for me — the platform is being used, not just delivered. Phase 2 is planned: document migration, automated KYC and suitability checks, and a mobile app.",
    bullets: [
      'Live in production since October 2026',
      '~1,000 investors migrated',
      '3 change requests delivered post-launch',
      'Phase 2 planned: documents, automated KYC and suitability, mobile app',
    ],
    citations: [
      { label: 'Outcomes', href: '/work/horizon#outcomes' },
      { label: "What's Next", href: '/work/horizon#next' },
    ],
    followUps: ['What results did Horizon produce', 'What are you working on right now'],
  },
  {
    id: 'h-results',
    scope: 'horizon',
    audience: ['recruiter'],
    keywords: ['horizon', 'results', 'metrics', 'numbers', 'impact', 'achieved', 'kpi', 'outcome', 'success', 'quantify', 'evidence', 'prove'],
    title: 'The headline numbers',
    answer:
      "Five numbers I'd put in front of anyone asking. About 1,000 investors migrated. Twelve months from kickoff to production go-live. Three change requests delivered. The signing screen went from over ten seconds to about 0.8 seconds when we built the e-signature module in-house. And monthly operating cost came down from roughly $1,500 to under $800 after a month-8 cost review. The two that matter most to me are the signing load time and the cost — both were things I found and argued for, not things that arrived as a requirement.",
    bullets: [
      '~1,000 investors migrated',
      '12 months kickoff → go-live',
      '3 change requests delivered',
      'Signing screen 10s+ → ~0.8s',
      'Monthly cost ~$1,500 → under $800',
    ],
    citations: [
      { label: 'Results at a glance', href: '/work/horizon#context' },
      { label: 'Outcomes', href: '/work/horizon#outcomes' },
    ],
    followUps: ['How did you cut the cost', 'Tell me about the e-signature decision'],
  },
  {
    id: 'h-context',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'context', 'background', 'problem', 'started', 'situation', 'before', 'client', 'business', 'manual', 'spreadsheet', 'phone', 'calls', 'why', 'build'],
    title: 'A working business that couldn\'t scale',
    answer:
      "The client already ran a real investment business — it just didn't scale. Investor onboarding happened over phone calls with KYC actions spread across several people. Documents were produced by hand. The status of every deal lived in a spreadsheet and in advisors' heads. So the problem wasn't a missing product; it was a working process with no shared visibility, where one missed call could stall a deal. We didn't redesign how investing worked. We kept the mental model and made the state visible.",
    citations: [
      { label: 'Context', href: '/work/horizon#context' },
      { label: 'Problem', href: '/work/horizon#problem' },
    ],
    followUps: ['What were the product principles', 'What did you build'],
  },
  {
    id: 'h-principles',
    scope: 'horizon',
    audience: ['peer', 'client'],
    keywords: ['horizon', 'principles', 'principle', 'approach', 'design', 'thinking', 'philosophy', 'guidance', 'mental', 'model', 'status', 'communication', 'role', 'clarity'],
    title: 'Three principles we scoped every decision against',
    answer:
      "We shaped three principles with our UX designer and used them to settle every scope argument. Same mental model: keep the steps, roles and sequence the business already knew, so adoption wasn't a fight. Role clarity over feature richness: each role sees only what it needs to act on. And status as the communication layer: a handoff shows up as a status that stays until someone acts, rather than a notification that gets missed. That last one is the one I'd argue hardest for in any product.",
    bullets: [
      'Same mental model as the business already had',
      'Role clarity over feature richness',
      'Status as the communication layer, not notifications',
    ],
    citations: [{ label: 'Product principles', href: '/work/horizon#principles' }],
    followUps: ['What did you build', 'What is it like working with you'],
  },
  {
    id: 'h-pipeline',
    scope: 'horizon',
    audience: ['peer', 'client', 'recruiter'],
    keywords: ['horizon', 'pipeline', 'lifecycle', 'stages', 'submitted', 'approved', 'subscribed', 'allocated', 'rejected', 'flow', 'states', 'status', 'indication', 'indicate', 'units', 'subscription', 'agreement', 'counter'],
    title: 'One pipeline: Submitted → Approved → Subscribed → Allocated',
    answer:
      "Every investment moves through one pipeline. The investor indicates interest and signs a subscription agreement, an advisor reviews and approves it, the investor sends a wire and confirms it, and a fund manager countersigns and allocates. Rejected is the exit. The important part is that each stage has an owner and an action, so status is never ambiguous — that was the whole point of making status the communication layer.",
    citations: [{ label: 'What We Built', href: '/work/horizon#built' }],
    followUps: ['How did you handle payments', 'How did you design the signing flow'],
  },
  {
    id: 'h-roles',
    scope: 'horizon',
    audience: ['peer', 'client'],
    keywords: ['horizon', 'roles', 'permissions', 'rbac', 'access', 'privilege', 'matrix', 'modules', 'admin', 'advisor', 'fund', 'manager', 'affiliate', 'monitor', 'content', 'writer', 'lite', 'plus', 'pro', 'tiers', 'accounts', 'joint', 'ira', 'entity'],
    title: 'Six staff roles, three investor tiers, 14 modules',
    answer:
      "A privilege matrix across 14 modules defines every action each role can take, and permissions are checked live on every request, so revoking access takes effect immediately. Staff roles are admin, advisor, fund manager, affiliate, monitor and content writer. Investors sit in three tiers — Lite, Plus and Pro — which unlock more of the product step by step; Plus and Pro can open Individual, Joint, IRA or Entity accounts. Every role also gets news and settings.",
    citations: [{ label: 'Who sees what', href: '/work/horizon#roles' }],
    followUps: ['Why did you build tiers as a funnel', 'What security did you specify'],
  },
  {
    id: 'h-d1-tiers',
    scope: 'horizon',
    audience: ['peer', 'client'],
    keywords: ['horizon', 'tiers', 'funnel', 'lite', 'plus', 'pro', 'suitability', 'kyc', 'gating', 'decision', 'why', 'manual', 'automated', 'qualified', 'serious'],
    title: 'Investor tiers as a funnel',
    answer:
      "The business needed to tell serious investors from casual browsers without spending staff time on everyone, so tiers work as a funnel rather than a feature gate. A person reviews the questionnaire for suitability — Lite to Plus — then verifies documents for KYC — Plus to Pro. Only committed investors reach live opportunities. Both gates are manual at launch, and automated KYC and suitability checks are a Phase 2 item. Each tier also gets its own dashboard analytics.",
    bullets: [
      'Lite — dashboard, news, onboarding questionnaire',
      'Plus — investor accounts, documents, named advisor',
      'Pro — live opportunities, portfolio',
      'Manual suitability then manual KYC; automation planned',
    ],
    citations: [{ label: 'Decision 01 · Investor tiers', href: '/work/horizon#d1' }],
    followUps: ['How did you handle payments', 'What is in Phase 2'],
  },
  {
    id: 'h-d2-payments',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'payment', 'payments', 'wire', 'wires', 'transfer', 'transfers', 'money', 'processor', 'stripe', 'card', 'ach', 'decision', 'why', 'manual', 'bank', 'reconciliation', 'compliance', 'restricted'],
    title: 'Why we shipped manual wire transfers',
    answer:
      "This is the decision I'm most comfortable defending. Financial services sit on many payment processors' restricted-business lists. One declined us outright on category policy, and none of the other options we evaluated got us to launch on schedule. So we agreed manual wire transfers jointly with the client. Wire instructions appear in the platform only after approval, the investor sends the transfer and confirms it in the same step, and an admin links the fund's bank when the offering is created so investors never connect their own. What we gave up: confirmation and reconciliation depend on people, not automation. I think trading automation for launch certainty was right, and I'd want the same trade again with a shorter runway.",
    bullets: [
      'Card/ACH processor — declined on category policy',
      'Bank-data aggregator, payments platform, partner bank — evaluated, none shipped',
      'Landed on manual wire transfers, agreed jointly with the client',
      'Trade-off: automated reconciliation for launch on time',
    ],
    citations: [{ label: 'Decision 02 · Payments', href: '/work/horizon#d2' }],
    followUps: ['What would you do differently', 'Tell me about the e-signature decision'],
  },
  {
    id: 'h-d3-esign',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'e-sign', 'esign', 'esignature', 'signing', 'signature', 'sign', 'document', 'vendor', 'third-party', 'third', 'party', 'template', 'draw', 'upload', 'slow', 'load', 'performance', 'decision', 'why'],
    title: 'We built the signing module ourselves',
    answer:
      "At month 8 a cost review flagged the third-party signing tool: over ten seconds to load, recurring licence and webhook fees, and investors redirected off our platform to sign. So we proposed a native module. It's a full signing engine — a drag-and-drop template builder, multi-stage routing, and three ways to sign: draw, type or upload. It ended per-envelope vendor costs, kept investor data in-platform, and cut the signing screen from over ten seconds to about 0.8. We kept it on a separate code branch so the working integration stayed untouched, and it fit inside an existing two-week staging window with testing and rollout running to the end of June. The client approved it. The trade is that we now own the module.",
    bullets: [
      'Third-party tool: 10s+ load, per-envelope fees, redirect off-platform',
      'Built native — template builder, multi-stage routing, draw / type / upload',
      'Result: ~0.8s load, no per-envelope cost, data stays in-platform',
      'Separate branch, fit a two-week staging window',
    ],
    citations: [{ label: 'Decision 03 · E-signature', href: '/work/horizon#d3' }],
    followUps: ['How did you cut the cost', 'What security did you specify'],
  },
  {
    id: 'h-d4-cost',
    scope: 'horizon',
    audience: ['recruiter', 'peer'],
    keywords: ['horizon', 'cost', 'costs', 'cloud', 'spend', 'budget', 'infrastructure', 'infra', 'kubernetes', 'k8s', 'environment', 'staging', 'production', 'provisioning', 'optimisation', 'optimization', 'review', 'month-8'],
    title: 'The month-8 cost review',
    answer:
      "Early provisioning assumptions between us and the client weren't fully aligned, and cloud spend ran above plan. Rather than absorb it quietly we ran a cost review, which brought monthly operating cost from roughly $1,500 to under $800. Part of it was environment work: staging moved from single-host containers to managed Kubernetes, and because production reused the staging work it took about 30% fewer hours — 80 hours for staging, 56 for production. That reuse is the clearest example of visible scope paying for itself. The client has no technical team, so environment setup became two priced change requests rather than hidden scope.",
    bullets: [
      'Monthly cost ~$1,500 → under $800',
      'CR01 staging to managed Kubernetes — 80 hours',
      'CR02 production — 56 hours, ~30% fewer by reusing staging work',
      'Environment setup sold as priced change requests, not hidden scope',
    ],
    citations: [{ label: 'Decision 04 · Infrastructure & cost', href: '/work/horizon#d4' }],
    followUps: ['What security did you specify', 'What would you do differently'],
  },
  {
    id: 'h-d5-scope',
    scope: 'horizon',
    audience: ['peer', 'client'],
    keywords: ['horizon', 'scope', 'bank', 'connection', 'csv', 'migration', 'migrated', 'documents', 'deferred', 'smallest', 'piece', 'trade', 'cut', 'phase', '2'],
    title: 'Keeping the smallest useful piece',
    answer:
      "When the full bank integration didn't fit the timeline, we kept the smallest piece that was still useful: an admin links the fund's bank when creating an offering, so verified details reach investors and balances can be retrieved to check incoming wires. Investors never link a bank. Investor records came across from CRM exports as CSV, and about 1,000 were migrated. Document migration moved to Phase 2, for when the client is ready. Shipping the read-only connection beat shipping nothing and is the pattern I'd repeat.",
    citations: [{ label: 'Decision 05 · Scope', href: '/work/horizon#d5' }],
    followUps: ['What is in Phase 2', 'How did you handle payments'],
  },
  {
    id: 'h-security',
    scope: 'horizon',
    audience: ['peer', 'client'],
    keywords: ['horizon', 'security', 'encryption', 'audit', 'compliance', 'kms', 'cognito', 'encryption', 'at', 'rest', 'transit', 'permissions', 'retention', 'three', 'years', 'soc', 'pci', 'gdpr', 'traceability', 'immutable'],
    title: 'Security and audit I specified',
    answer:
      "Five layers between a user and stored financial data. Login through Cognito with role groups and a 30-minute inactivity logout. Fine-grained permissions checked live on every request. In transit, API payloads use KMS envelope encryption with AES-256-GCM. At rest, bank and payment fields are encrypted at field level in the database. Secrets live in AWS SSM with scoped IAM roles and no static keys. On top of that every action is logged and kept for three years, with an Audit Log admins can search by actor and role, and a downloadable report for bulk user migrations. I own the requirements and scope here — engineering built it, but these are my acceptance criteria.",
    bullets: [
      'Cognito login, role groups, 30-minute inactivity logout',
      'KMS envelope encryption, AES-256-GCM, in transit',
      'Field-level encryption at rest for bank and payment data',
      'AWS SSM, scoped IAM roles, no static keys',
      'Three-year audit retention with searchable Audit Log',
    ],
    citations: [{ label: 'Security & access', href: '/work/horizon#f2' }, { label: 'Audit & compliance', href: '/work/horizon#f4' }],
    followUps: ['How did you design the signing flow', 'What did you build'],
  },
  {
    id: 'h-delivery',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'delivery', 'timeline', 'schedule', 'team', 'sprint', 'scrum', 'delay', 'blocked', 'holiday', 'rebrand', 'change', 'request', 'cr03', 'cr02', 'cr01', 'staff', 'join', 'leave', 'churn', 'gone'],
    title: 'Delivering through a team change and a client delay',
    answer:
      "Two things went sideways and both are in the case study. A backend developer who joined in November left in January without a knowledge transfer, leaving real technical debt; we ran with one backend developer for about a month until two joined in February, and the scrum master spread the work across the whole team including himself. Then the client held deployment in mid-August for reasons on their side. We used the window to confirm the brand direction and complete the rebrand change request, so the hold turned into progress rather than idle time. CR03 was 320 hours — about two thirds rebrand, domain and UI refresh, the rest unit batches with FIFO allocation, cost basis and non-compounding returns, plus the bank connection.",
    bullets: [
      'Nov: backend developer joins · Jan: leaves without KT · Feb: two join',
      'Mid-August: client held deployment; we completed the rebrand in the window',
      'CR03 — 320 hours: brand and UI 125h, infra/domain/QA/DevOps 83h, unit batches 56h, bank connection 56h',
      'Three formal change requests, each scoped and estimated in writing',
    ],
    citations: [
      { label: 'Delivery Story', href: '/work/horizon#delivery' },
      { label: 'Quality & ways of working', href: '/work/horizon#quality' },
    ],
    followUps: ['What would you do differently', 'How did you cut the cost'],
  },
  {
    id: 'h-quality',
    scope: 'horizon',
    audience: ['peer', 'client'],
    keywords: ['horizon', 'quality', 'testing', 'test', 'qa', 'uat', 'sonarqube', 'canary', 'gates', 'manual', 'knowledge', 'base', 'manual', 'user', 'version', 'controlled', 'process', 'sprint', 'ceremonies'],
    title: 'How quality was run',
    answer:
      "Two-week sprints with backlog refinement alongside the client, Jira as the single source of truth for workflows, bugs and delivery tracking, and three change requests each scoped and estimated in writing before work started. Developers tested through the build until a QA engineer joined in April, ahead of the UAT environment. On the engineering side SonarQube gates the code and canary releases run automated success checks before full rollout. We also kept a version-controlled user manual and requirement documents as a knowledge base.",
    citations: [{ label: 'Quality & Ways of Working', href: '/work/horizon#quality' }],
    followUps: ['Tell me about the delivery', 'How did you handle the team change'],
  },
  {
    id: 'h-outcomes',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'outcome', 'quote', 'client', 'said', 'feedback', 'testimonial', 'satisfied', 'happy', 'result', 'launch', 'success', 'impact'],
    title: 'The client keeps coming back',
    answer:
      "The client launched with about 1,000 investors migrated, and then kept coming back with change requests — which is the outcome I care most about, because it means the platform is being used rather than just delivered. They said this: \"This is exactly what we talked about wanting — all those little things here and there where you think, 'I wish they had this, I wish they had that.'\" That was client leadership, on Horizon.",
    citations: [{ label: 'Outcomes', href: '/work/horizon#outcomes' }],
    followUps: ['What is in Phase 2', 'How do I get in touch'],
  },
  {
    id: 'h-learned',
    scope: 'horizon',
    audience: ['recruiter', 'peer'],
    keywords: ['horizon', 'learned', 'lessons', 'learn', 'different', 'mistake', 'mistakes', 'retrospective', 'retros', 'regret', 'wish', 'again', 'reflection', 'better'],
    title: "What I'd do differently",
    answer:
      "Two things. First, test external dependencies in discovery, not mid-build. We learned the payment processor would decline us only after designing around one; dropping to manual wires plus a read-only bank connection got us to launch, but an early eligibility check would have saved weeks of rework. Second, write handovers and assumptions down as deliverables. A developer left without a knowledge transfer and our early cloud sizing assumptions were never signed off — both cost time and money. I'd now treat a handover checklist and an approved environment-sizing note as part of the scope, not as goodwill.",
    bullets: [
      'Test external dependencies like payment eligibility during discovery',
      'Treat handover checklists and sizing sign-offs as scope deliverables',
    ],
    citations: [{ label: 'What I learned', href: '/work/horizon#learned' }],
    followUps: ['Tell me about the payment decision', 'What is it like working with you'],
  },
  {
    id: 'h-next',
    scope: 'horizon',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['horizon', 'next', 'phase', '2', 'future', 'roadmap', 'planned', 'plan', 'coming', 'upcoming', 'mobile', 'app', 'assistant', 'documents', 'kyc', 'automated'],
    title: 'What Phase 2 covers',
    answer:
      "Three things. Document migration and enhancements — bringing existing documents into the platform and refining what's already live. Automated KYC and suitability — replacing the two manual gates we run today. And a mobile app, plus an internal knowledge assistant the client raised as an idea, to query their own knowledge sources. That's the plan of record; I'd expect the first two to land before the app.",
    bullets: ['Document migration and enhancements', 'Automated KYC and suitability checks', 'Mobile app and an internal knowledge assistant'],
    citations: [{ label: "What's Next", href: '/work/horizon#next' }],
    followUps: ['What are you working on right now', 'Is Horizon live and what happened'],
  },
  {
    id: 'h-summary',
    scope: 'horizon',
    audience: ['recruiter', 'peer'],
    keywords: ['horizon', 'summarise', 'summarize', 'summary', 'tl', 'dr', 'brief', 'short', 'quick', 'three', 'bullets', 'tldr', 'in', 'a', 'nutshell', 'condensed'],
    title: 'Horizon in three lines',
    answer:
      "Twelve months to take a working investment business off phone calls and spreadsheets onto one platform, now live with about 1,000 investors migrated. I owned requirements, scope and change control as the only BA and Product Owner on a nine-person team. The two decisions I'd lead a conversation with: we shipped manual wire transfers after a regulated platform got declined by every processor we evaluated, and we built the e-signature module in-house after the third-party tool took over ten seconds to load and cost us per envelope.",
    bullets: [
      '12 months, live, ~1,000 investors migrated',
      'Only BA/PO on a 9-person team; owned requirements, scope, change control',
      'Manual wires after processor decline · in-house signing, 10s+ → 0.8s',
    ],
    citations: [{ label: 'Horizon case study', href: '/work/horizon' }],
    followUps: ['Why manual wire transfers', 'What would you do differently'],
  },

  /* ------------------------------------------------------------------ adapter */
  {
    id: 'a-overview',
    scope: 'adapter',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['adapter', 'case', 'study', 'middleware', 'ussd', 'wallet', 'mobile', 'money', 'payments', 'project', 'network', 'what', 'was', 'tell', 'about', 'second', 'project'],
    title: 'Adapter — mobile money and instant payments middleware',
    answer:
      "Adapter is middleware that connects a mobile money wallet to a national instant-payment network. Customers dial a USSD menu, Adapter turns each step into the messages the wallet and the network expect, and returns the response as a menu or an SMS. It also handles onboarding and account changes, and keeps every message validated, signed and logged. I was Business Analyst and Product Owner: defining what it had to do, in what order, and for which scenarios. It's my current engagement and it's in UAT, not live yet.",
    bullets: [
      'Kick-off 10 April 2026, phased delivery, currently in UAT',
      '1,155 hours logged · 5 delivery phases planned',
      '3 message formats unified · 30 XSD schemas managed',
      'Stack: React, Node.js, MongoDB',
    ],
    citations: [
      { label: 'Adapter overview', href: '/work/adapter' },
      { label: 'Context', href: '/work/adapter#a-context' },
    ],
    followUps: ['Is Adapter live', 'Summarise Adapter in three bullets'],
  },
  {
    id: 'a-status',
    scope: 'adapter',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['adapter', 'live', 'uat', 'status', 'launched', 'launch', 'go-live', 'production', 'current', 'now', 'done', 'complete', 'phase', 'in', 'testing'],
    title: 'In UAT — no launch results yet',
    answer:
      "Adapter is in UAT, not live, so there are no launch results to report and I won't dress up design targets as outcomes. Where we stand: 1,155 hours logged against a five-phase plan, three message formats unified and 30 XSD schemas managed. The recovery figures on the case study — ten to fifteen minutes to restore, under thirty seconds of data loss — are targets from the design, not results. I'll update the page when it goes live.",
    citations: [
      { label: 'Where it stands', href: '/work/adapter#a-context' },
      { label: 'Outcomes', href: '/work/adapter#a-outcomes' },
    ],
    followUps: ['What did you build', 'What are you working on right now'],
  },
  {
    id: 'a-context',
    scope: 'adapter',
    audience: ['peer', 'client'],
    keywords: ['adapter', 'context', 'background', 'problem', 'started', 'situation', 'before', 'why', 'build', 'client', 'wallet', 'network', 'registration', 'onboarding', 'fragmented', 'formats'],
    title: 'A wallet and a network that spoke different languages',
    answer:
      "A mobile money provider needed its customers to register and transact on a national instant-payment network from a basic USSD menu. Registration was fragmented across several paths, onboarding was slow, and the network's interfaces used formats the wallet's own APIs didn't speak — SOAP, ISO 20022 XML and JSON, none of them agreeing. So the real problem was translation, not transactions. Everything else in the build follows from that: one shared model, then adapters that map into and out of it.",
    citations: [{ label: 'Context', href: '/work/adapter#a-context' }],
    followUps: ['How does the architecture work', 'What did you build'],
  },
  {
    id: 'a-architecture',
    scope: 'adapter',
    audience: ['peer', 'client'],
    keywords: ['adapter', 'architecture', 'layers', 'design', 'structure', 'canonical', 'model', 'mapping', 'flow', 'engine', 'routing', 'channels', 'adapters', 'soap', 'iso', '20022', 'xml', 'json', 'how', 'works'],
    title: 'Six layers from channel to network',
    answer:
      "A request passes through six layers. Channels are the USSD menus and SMS notifications. Adapters handle SOAP, ISO 20022 XML and JSON. Everything then translates into one canonical transaction object — a single shared set of fields. Mapping converts between formats and field names, including masking, encryption and date conversion. A flow engine runs each journey step by step, and routing picks the destination by rule. The practical consequence is that a new channel or API only ever maps to the canonical model, never to another channel, so integrations don't multiply.",
    bullets: [
      'Channels — USSD menus and SMS',
      'Adapters — SOAP, ISO 20022 XML, JSON',
      'Canonical model — one shared transaction object',
      'Mapping — format conversion, masking, encryption, date conversion',
      'Flow engine — step-by-step journeys · Routing — destination by rule',
    ],
    citations: [{ label: 'Architecture', href: '/work/adapter#a-arch' }],
    followUps: ['Why the canonical model', 'What can the product do'],
  },
  {
    id: 'a-capabilities',
    scope: 'adapter',
    audience: ['peer', 'client'],
    keywords: ['adapter', 'capabilities', 'features', 'can', 'do', 'built', 'capability', 'onboarding', 'bulk', 'account', 'lifecycle', 'recovery', 'activation', 'deactivation', 'blocking', 'ussd', 'menu', 'templates', 'schemas', 'orchestration', 'reconciliation', 'logs'],
    title: 'What the product does',
    answer:
      "Unified onboarding — customers register through the USSD menu or in bulk from the back office, in one configurable flow. Full account lifecycle — activation, recovery, deactivation, blocking and default-account changes, with token-based strong authentication where the network requires it. Configurable USSD menus and SMS templates built in the back office, using variables from the transaction. Schema-driven APIs: upload a contract or schema and its fields are extracted automatically for mapping. Flow orchestration where each journey runs as steps — menu, API request, callback, condition, SMS. And every message logged against its transaction for tracing and reconciliation.",
    bullets: [
      'Unified onboarding — USSD or bulk from back office',
      'Account lifecycle — activation, recovery, deactivation, blocking, default-account change',
      'Configurable USSD menus and SMS templates with transaction variables',
      'Schema-driven APIs with automatic field extraction',
      'Flow orchestration and full message-level reconciliation logs',
    ],
    citations: [{ label: 'Capabilities', href: '/work/adapter#a-caps' }],
    followUps: ['How does the architecture work', 'What security did you specify'],
  },
  {
    id: 'a-d1-canonical',
    scope: 'adapter',
    audience: ['peer', 'client'],
    keywords: ['adapter', 'decision', 'canonical', 'model', 'transaction', 'one', 'single', 'shared', 'mapping', 'why', 'chose', 'translation', 'formats', 'iso', 'soap', 'json', 'multiplier', 'integration', 'one model'],
    title: 'One shared transaction model',
    answer:
      "USSD, SOAP, ISO 20022 and JSON each describe the same payment differently. We translate everything into one canonical transaction, so a field captured in a menu is literally the same field the network message uses. New channels and APIs map to the model, never to each other, which means adding an integration doesn't create N squared mappings. Each mapping can convert formats, mask sensitive values, encrypt, and normalise dates. It's the decision I'd defend hardest in this build.",
    citations: [{ label: 'Decision 01 · Canonical model', href: '/work/adapter#a-d1' }],
    followUps: ['How does the architecture work', 'What did you build'],
  },
  {
    id: 'a-d2-config',
    scope: 'adapter',
    audience: ['peer', 'client'],
    keywords: ['adapter', 'decision', 'config', 'configuration', 'code', 'deployment', 'release', 'no', 'without', 'release', 'menus', 'templates', 'flows', 'routing', 'rules', 'business', 'change', 'why', 'trade-off'],
    title: 'Business changes shouldn\'t need a release',
    answer:
      "Menus, SMS templates, API definitions, field mappings, flows and routing rules are all configuration rather than code, so the business can change them without a deployment. The trade-off is more design effort up front for the configuration model itself — which is the right spend when the client has to run this after go-live and may not have a technical team. Same reasoning as making environment setup a visible change request on Horizon.",
    citations: [{ label: 'Decision 02 · Configuration', href: '/work/adapter#a-d2' }],
    followUps: ['What did you learn', 'What is it like working with you'],
  },
  {
    id: 'a-d3-clarity',
    scope: 'adapter',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['adapter', 'decision', 'clarity', 'clear', 'edge', 'cases', 'scenarios', 'questions', 'ambiguity', 'gaps', 'specification', 'spec', 'requirements', 'slow', 'why', 'communication', 'client', 'miscommunication'],
    title: 'Clarity first — the edge cases are the product',
    answer:
      "Adapter is backend-heavy, so the edge cases are the product: every scenario a specification leaves open becomes a decision in code. Requirements from the client sometimes arrived slowly, with gaps and miscommunication. I worked with both sides to close them, turning open questions into agreed scenarios before we built, because rework in a payments backend is expensive. It took time and we chose it over rework. Next time I'd start a shared scenario list in the first week rather than building it up as questions arrived.",
    citations: [{ label: 'Decision 03 · Clarity first', href: '/work/adapter#a-d3' }],
    followUps: ['What did you learn', 'What is it like working with you'],
  },
  {
    id: 'a-phases',
    scope: 'adapter',
    audience: ['peer', 'client', 'recruiter'],
    keywords: ['adapter', 'phases', 'phase', 'plan', 'roadmap', 'five', '5', 'foundation', 'instant', 'payments', 'reversals', 'disputes', 'mobile', 'qr', 'merchants', 'state', 'taxes', 'obligations', 'order', 'sequence', 'implementation'],
    title: 'The five-phase plan',
    answer:
      "The network's implementation plan sets the order, and it's not mine to reorder: one, foundation — secure connection and account data. Two, instant payments — transfers, confirmations, timeouts. Three, reversals — returns and disputes. Four, mobile payments — QR, requests, merchants. Five, state payments — taxes and obligations. Foundation first because everything else depends on the secure connection and account data being right. A dependency-driven plan like this is much easier to defend than one built around visible deliverables.",
    bullets: [
      '1 · Foundation — secure connection, account data',
      '2 · Instant payments — transfers, confirmations, timeouts',
      '3 · Reversals — returns and disputes',
      '4 · Mobile payments — QR, requests, merchants',
      '5 · State payments — taxes, obligations',
    ],
    citations: [{ label: 'Delivery Story', href: '/work/adapter#a-delivery' }],
    followUps: ['Is Adapter live', 'What did you learn'],
  },
  {
    id: 'a-quality',
    scope: 'adapter',
    audience: ['peer', 'client'],
    keywords: ['adapter', 'quality', 'resilience', 'security', 'validation', 'signatures', 'logging', 'masked', 'retention', 'archive', 'snapshot', 'replica', 'recovery', 'restore', 'rpo', 'rto', 'uptime', 'controls', 'built-in'],
    title: 'Controls built in, not bolted on',
    answer:
      "Validation checks every message against its XML or JSON schema. Digital signatures are verified and sensitive data encrypted. Every request and response is logged with masked payloads. Recovery uses daily snapshots plus a cross-region replica, and retention is 30 days live then archived for up to ten years. Recovery targets in the design are ten to fifteen minutes to restore and under thirty seconds of data loss — and I want to be precise that those are targets, not measured results.",
    bullets: [
      'Schema validation on every message',
      'Signature verification and encryption of sensitive data',
      'Masked request/response logging for tracing',
      'Daily snapshots, cross-region replica · 30 days live, archived up to 10 years',
    ],
    citations: [{ label: 'Quality & Resilience', href: '/work/adapter#a-quality' }],
    followUps: ['What did you learn', 'Is Adapter live'],
  },
  {
    id: 'a-learned',
    scope: 'adapter',
    audience: ['recruiter', 'peer'],
    keywords: ['adapter', 'learned', 'lessons', 'learn', 'different', 'mistake', 'retrospective', 'reflections', 'dependencies', 'risks', 'owner', 'dated', 'clarity', 'week', 'one', 'would'],
    title: 'Treat clarity as a deliverable',
    answer:
      "In a backend-heavy build, the edge cases are the product, and time spent aligning the client and the team was cheaper than rework later. Next time I'd start a shared scenario list in week one instead of building it up as questions arrived. The second lesson is to track external dependencies like scope: specifications, credentials and test environments all came from outside the team, so I'd log each as a dated risk with an owner from day one.",
    bullets: [
      'Start a shared scenario list in week one',
      'Log every external dependency as a dated risk with an owner',
    ],
    citations: [{ label: 'What I learned', href: '/work/adapter#a-learned' }],
    followUps: ['What is it like working with you', 'Why the canonical model'],
  },
  {
    id: 'a-next',
    scope: 'adapter',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['adapter', 'next', 'future', 'planned', 'plan', 'super', 'app', 'foundation', 'later', 'phases', 'complete', 'uat', 'go-live', 'reversals', 'mobile', 'state'],
    title: 'Completing UAT, then the super app foundation',
    answer:
      "Immediate priority is completing UAT — resolve findings and prepare for go-live. After that the plan continues with reversals and disputes, then mobile payments, then state payments. The bigger opportunity is using instant payments as the financial foundation of a super app, which is how the client has framed the longer horizon. I scope those phases with them as the earlier ones stabilise.",
    citations: [{ label: "What's Next", href: '/work/adapter#a-next' }],
    followUps: ['Is Adapter live', 'What are you working on right now'],
  },
  {
    id: 'a-summary',
    scope: 'adapter',
    audience: ['recruiter', 'peer'],
    keywords: ['adapter', 'summarise', 'summarize', 'summary', 'tl', 'dr', 'brief', 'short', 'quick', 'three', 'bullets', 'tldr', 'in', 'a', 'nutshell', 'condensed'],
    title: 'Adapter in three lines',
    answer:
      "Middleware that lets a mobile money wallet's USSD customers register and transact on a national instant-payment network, translating between SOAP, ISO 20022 XML and JSON through one canonical transaction model. In UAT since kick-off on 10 April 2026, with 1,155 hours logged against a five-phase plan. The decisions I'd lead with: one shared model so integrations don't multiply, configuration over code so the client can run it without us, and agreeing scenarios before building because in a payments backend the edge cases are the product.",
    bullets: [
      'USSD → wallet APIs → national instant-payment network, via one canonical model',
      'In UAT since 10 April 2026 · 1,155 hours · 5 phases planned',
      'One shared model · config over code · scenarios agreed before build',
    ],
    citations: [{ label: 'Adapter case study', href: '/work/adapter' }],
    followUps: ['Why the canonical model', 'Is Adapter live'],
  },

  /* ------------------------------------------------------------------- now */
  {
    id: 'working-now',
    scope: 'profile',
    audience: ['recruiter', 'peer', 'client'],
    keywords: ['now', 'current', 'working', 'today', 'presently', 'right', 'busy', 'currently', 'focus', 'split', 'time', 'between', 'latest', 'recent', 'this', 'year'],
    title: 'Two engagements in parallel',
    answer:
      "Two things at once. Horizon is live and in its Phase 2 planning — about 1,000 investors migrated, three change requests delivered. Adapter is in UAT, following a five-phase plan, with instant payments intended as the foundation for a future super app. Since Horizon is in production, my Horizon time is steady-state governance and Phase 2 scoping; Adapter is where the discovery and clarification work is right now.",
    bullets: [
      'Horizon — live, Phase 2 planning, steady-state governance',
      'Adapter — in UAT, clarification and UAT support',
    ],
    citations: [
      { label: 'Horizon', href: '/work/horizon' },
      { label: 'Adapter', href: '/work/adapter' },
    ],
    followUps: ['Is Adapter live', 'Is Horizon live and what happened'],
  },
];

/**
 * Terms that must never appear in an answer. Client, vendor and network names are
 * withheld by agreement; the site's own engagement aliases are safe.
 */
export const FORBIDDEN: string[] = [
  'tsg invest',
  'tsginvest',
  'tsg vault',
  'terminasone',
  'termina one',
  'venture 50',
  'v50',
  'akipaga',
  'iguana',
  'kwik',
  'emirates nbd',
  'hubspot',
  'stripe',
  'docusign',
];
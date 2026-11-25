# AI-assisted programming: references and further reading

Software Development: Programming and Algorithms (SDPA), University of Bristol  

## Core readings

### 1. Effective prompts require programming understanding

Lucchetti, F., Wu, Z., Guha, A., Feldman, M. Q., and Anderson, C. J. (2024). [Substance Beats Style: Why Beginning Students Fail to Code with LLMs](https://arxiv.org/abs/2410.19792). Research paper, arXiv:2410.19792.

Read for the distinction between using technical vocabulary and communicating the information needed to solve a task. Connect it to specifying inputs, outputs, constraints and examples before requesting code.

### 2. Reviewing code and controlling access

OWASP. [Secure Coding with AI Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Coding_with_AI_Cheat_Sheet.html). Living practitioner guidance.

For more info on responsible use: review generated code, protect sensitive context, and restrict tool permissions. A prompt instruction alone is not an access-control mechanism.

### 3. Matching oversight to risk

UK National Cyber Security Centre, Toby W. [The 'vibe coding spectrum' approach to AI-assisted software development](https://www.ncsc.gov.uk/blogs/the-vibe-coding-spectrum-approach-to-ai-assisted-software-development). Practitioner guidance.

Consider how the consequences of failure should affect the amount of human oversight. Useful for distinguishing disposable experiments from sensitive or safety-critical systems.

### 4. Readability and appropriate complexity

Knuth, D. E. (1992). [Literate Programming](https://www-cs-faculty.stanford.edu/~knuth/lp.html). CSLI Lecture Notes 27.

Treating programs as communication for human readers.

Fowler, M. (2015). [Yagni](https://martinfowler.com/bliki/Yagni.html). Software-design essay.

Read for good software design practices and avoiding speculative capabilities and abstractions.

### 5. Learning versus completing a task

Bastani, H., et al. (2025). [Generative AI without guardrails can harm learning: Evidence from high school mathematics](https://doi.org/10.1073/pnas.2422633122). *Proceedings of the National Academy of Sciences*.

Read for the difference between assisted practice and subsequent unassisted performance, and the role of learning-oriented guardrails.

## Further reading: AI-assisted programming

- **Porter, L., and Zingaro, D.** [Learn AI-Assisted Python Programming, Second Edition](https://www.manning.com/books/learn-ai-assisted-python-programming-second-edition). A structured route through Python programming with AI assistance.
- **GitHub.** [Best practices for using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices). Practical guidance on breaking tasks into smaller steps, supplying useful context and examples, and checking generated code. A useful starting point even if you use a different assistant.
- **Anthropic.** [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices). Official guidance on giving an agent project context, specifying checks it can run, and enforcing boundaries through permissions rather than prompts alone. Useful for moving from chatbot assistance to tool-enabled coding..
- **Willison, S.** [Agentic Engineering Patterns](https://simonwillison.net/guides/agentic-engineering-patterns/). An evolving practitioner guide covering testing, Git, code walkthroughs and reviewing agent-generated work. The sections on running tests and understanding code connect particularly well to the lecture; this is experience-based guidance rather than a controlled research study.
- **Taylor, M., Carnegie Mellon University (Spring 2026).** [15-113: Effective Coding with AI](https://www.cs.cmu.edu/~mdtaylor/113/S26/). Public course materials and project examples covering AI-assisted development, quality assurance and responsible use. A route for further exploration after learning the basics: the course assumes prior programming study.

## Further reading: security, packages and real incidents

- **Spracklen, J., et al. (2025).** [We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs](https://www.usenix.org/conference/usenixsecurity25/presentation/spracklen). USENIX Security research paper. [Direct PDF](https://www.usenix.org/system/files/usenixsecurity25-spracklen.pdf). Supports checking that a recommended package exists and is the intended, trustworthy package.
- **Flood, R., IOActive (2026).** [The Security Gap in AI-Generated Code: A Large-Scale Empirical Analysis of LLM Code Generators](https://www.ioactive.com/wp-content/uploads/2026/05/IOA-The-Security-Gap-in-AI-Generated-Code.pdf). Industry research report. Read its task selection and evaluation methods before generalising model or infrastructure-as-code comparisons.
- **Sidhpurwala, H., Red Hat (1 April 2025).** [When bots commit: AI-generated code in open source projects](https://www.redhat.com/en/blog/when-bots-commit-ai-generated-code-open-source-projects). Practitioner discussion of security and governance for generated contributions.
- **Replit (29 July 2025).** [Doubling down on our commitment to secure vibe coding](https://replit.com/blog/doubling-down-on-our-commitment-to-secure-vibe-coding). Vendor acknowledgement of the database incident and discussion of rollback and environment separation.
- **Lemkin, J., SaaStr (2025).** [Replit's New Release Addressed Most of the Challenges We Hit Vibe Coding. But Is 'Prosumer' Vibe Coding Really Ready for Commercial Apps Yet?](https://www.saastr.com/replits-new-release-address-most-of-the-challenges-we-hit-vibe-coding-but-is-prosumer-vibe-coding-really-ready-for-commercial-apps-yet/). Affected party's account. Describes false recovery advice as well as the deletion; recovery succeeded. Read alongside Replit's account, and distinguish the application under development from SaaStr's entire business.
- **Amazon Web Services (23 July 2025; updated 25 July 2025).** [Security Update for Amazon Q Developer Extension for Visual Studio Code, AWS-2025-015](https://aws.amazon.com/security/security-bulletins/AWS-2025-015/). Official security bulletin. Malicious code reached an extension release, but AWS says a syntax error prevented execution and changes to customer environments. A supply-chain compromise, not a confirmed customer data breach.
- **CrowdStrike (2026).** [2026 Global Threat Report](https://go.crowdstrike.com/2026-global-threat-report.html). Industry threat-intelligence report linked in the outline; download may require registration. General threat context does not establish that AI coding caused an increase in cyberattacks.

## ## Further reading: Environmental impact

- **Lacoste, A., Luccioni, A., Schmidt, V., and Dandres, T. (2019).** [Quantifying the Carbon Emissions of Machine Learning](https://arxiv.org/abs/1910.09700). Research paper on estimating training emissions, including hardware, duration and electricity-grid factors. It does not provide a universal carbon cost per modern chatbot prompt. **
- **[AI Carbon Footprint Calculator](https://aiimpactcalculator.com/).** Tool linked by the PDF outline. Use to discuss assumptions and sensitivity, not as a precise audit of a student's actual energy or water use. Its site describes tier-based estimates.


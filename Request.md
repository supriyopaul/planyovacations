User Request: 
I want you to look at the UI screenshot and fix the following issues.
1. In the Yearly view the months are not coming fully. I should be able to see the full dates in the calendar.
2. Move all the controls to the left panel.
3. The First should be the start and the end date selector. By default this year start and this year end should be selected. I should be able to change the dates.
4. Then the leave balance in which I should be able to put in the leave balance number. By default 20 is put.
5. Then the actions part. REmove the Suggest leave from there.
6. Put the Leave suggestions panel from the right to below the actions.
Everything else from the Left panel should be the calendar.

---

Based on the user request detailed above the `---` separator, proceed with the implementation. You MUST rigorously follow your core operating principles (`core.md`/`.cursorrules`/User Rules), paying specific attention to the following for **this particular request**:

1.  **Deep Analysis & Research:** Fully grasp the user's intent and desired outcome. Accurately locate *all* relevant system components (code, config, infrastructure, documentation) using tools. Thoroughly investigate the existing state, patterns, and context at these locations *before* planning changes.
2.  **Impact, Dependency & Reuse Assessment:** Proactively analyze dependencies and potential ripple effects across the entire system. Use tools to confirm impacts. Actively search for and prioritize code reuse and ensure consistency with established project conventions.
3.  **Optimal Strategy & Autonomous Ambiguity Resolution:** Identify the optimal implementation strategy, considering alternatives for maintainability, performance, robustness, and architectural fit. **Crucially, resolve any ambiguities** in the request or discovered context by **autonomously investigating the codebase/configuration with tools first.** Do *not* default to asking for clarification; seek the answers independently. Document key findings that resolved ambiguity.
4.  **Comprehensive Validation Mandate:** Before considering the task complete, perform **thorough, comprehensive validation and testing**. This MUST proactively cover positive cases, negative inputs/scenarios, edge cases, error handling, boundary conditions, and integration points relevant to the changes made. Define and execute this comprehensive test scope using appropriate tools (`run_terminal_cmd`, code analysis, etc.).
5.  **Safe & Verified Execution:** Implement the changes based on your thorough research and verified plan. Use tool-based approval mechanisms (e.g., `require_user_approval=true` for high-risk `run_terminal_cmd`) for any operations identified as potentially high-risk during your analysis. Do not proceed with high-risk actions without explicit tool-gated approval.
6.  **Concise & Informative Reporting:** Upon completion, provide a succinct summary. Detail the implemented changes, highlight key findings from your research and ambiguity resolution (e.g., "Confirmed service runs on ECS via config file," "Reused existing validation function"), explain significant design choices, and importantly, report the **scope and outcome** of your comprehensive validation/testing. Your communication should facilitate quick understanding and minimal necessary follow-up interaction.
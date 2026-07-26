import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CommentGenerator {
  constructor(configPath = null) {
    const defaultCfgPath = path.join(__dirname, 'config.json');
    this.config = JSON.parse(fs.readFileSync(configPath || defaultCfgPath, 'utf8'));
  }

  async generateDraftComment(analyzedItem) {
    const prompt = `
You are drafting a LinkedIn comment on behalf of Santhosh Kumar N (19-year-old founder of Project Nebula — the "Cloudflare for AI Agents").

TARGET EXECUTIVE:
Name: ${analyzedItem.target_name}
Title: ${analyzedItem.target_title}
Company: ${analyzedItem.target_company}

POST CONTEXT:
Title/Snippet: ${analyzedItem.title} - ${analyzedItem.snippet}
Signal Score: ${analyzedItem.analysis.relevance_score}/10 (${analyzedItem.analysis.signal_classification})
Extracted Hooks: ${analyzedItem.analysis.extracted_hooks.join(', ')}

STRICT COMMENT RULES:
1. NEVER use generic compliments like "Great post!", "Insightful!", or "Couldn't agree more!"
2. Length: Exactly 2 to 4 sentences maximum.
3. Content: Provide a concrete technical insight (e.g. "70-80% of agent queries are routine classification intents that don't need frontier models", "Aho-Corasick DFA scanning achieves sub-millisecond PII detection with zero false positives", "tiered LLM routing cuts spend by 50%+").
4. Tone: Peer-to-peer technical founder, sharp, humble, and value-first.
5. Ending: End with a subtle, natural question inviting discussion.

Draft the comment:
`;

    try {
      const response = await fetch(`${this.config.llm_gateway.base_url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.llm_gateway.api_key}`
        },
        body: JSON.stringify({
          model: this.config.llm_gateway.generator_model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4
        })
      });

      if (!response.ok) {
        console.warn(`[CommentGen] Gateway HTTP ${response.status}. Using template generator.`);
        return this.fallbackTemplateComment(analyzedItem);
      }

      const resData = await response.json();
      const draft = resData.choices[0].message.content.trim().replace(/^"/, '').replace(/"$/, '');
      return draft;
    } catch (err) {
      console.error(`[CommentGen] LLM error: ${err.message}`);
      return this.fallbackTemplateComment(analyzedItem);
    }
  }

  fallbackTemplateComment(item) {
    const name = item.target_name.split(' ')[0];
    const theme = item.analysis.primary_theme || 'AI infrastructure';

    return `Spot on analysis, ${name}. In enterprise agent pipelines, we typically see 70-80% of requests being routine intent checks that don't require frontier models like GPT-4o. Routing those through a deterministic classifier to cheaper local models or DFA parsers cuts LLM spend by 50%+ while maintaining millisecond latencies. Have you explored tiered intent routing for this at ${item.target_company}?`;
  }
}

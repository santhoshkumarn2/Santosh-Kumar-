import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DorkScanner {
  constructor(configPath = null) {
    const defaultCfgPath = path.join(__dirname, 'config.json');
    this.config = JSON.parse(fs.readFileSync(configPath || defaultCfgPath, 'utf8'));
    this.targetsPath = path.join(__dirname, 'targets', 'ceo_cto_100.json');
    this.processedPath = path.join(__dirname, 'data', 'processed_urls.json');
    this.ensureDirs();
  }

  ensureDirs() {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(this.processedPath)) {
      fs.writeFileSync(this.processedPath, JSON.stringify([], null, 2));
    }
  }

  loadTargets() {
    const data = JSON.parse(fs.readFileSync(this.targetsPath, 'utf8'));
    return data.targets || [];
  }

  loadProcessedUrls() {
    return new Set(JSON.parse(fs.readFileSync(this.processedPath, 'utf8')));
  }

  saveProcessedUrl(url) {
    const urls = Array.from(this.loadProcessedUrls());
    if (!urls.includes(url)) {
      urls.push(url);
      fs.writeFileSync(this.processedPath, JSON.stringify(urls, null, 2));
    }
  }

  generateDorkQueries(target) {
    const templates = this.config.scanner.google_dork_templates;
    return templates.map(tmpl => {
      return tmpl
        .replace('{name}', target.name)
        .replace('{company}', target.company);
    });
  }

  normalizeLinkedInUrl(rawUrl, target) {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return this.getFallbackTargetUrl(target);
    }

    try {
      let cleanUrl = rawUrl.trim();

      if (cleanUrl.includes('uddg=')) {
        const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : 'https://duckduckgo.com' + cleanUrl);
        cleanUrl = decodeURIComponent(urlObj.searchParams.get('uddg') || cleanUrl);
      } else if (cleanUrl.includes('google.com/url?q=')) {
        const urlObj = new URL(cleanUrl);
        cleanUrl = decodeURIComponent(urlObj.searchParams.get('q') || cleanUrl);
      }

      if (cleanUrl.includes('?')) {
        cleanUrl = cleanUrl.split('?')[0];
      }

      if (!cleanUrl.includes('linkedin.com/')) {
        return this.getFallbackTargetUrl(target);
      }

      if (cleanUrl.includes('linkedin.com/in/')) {
        let profileBase = cleanUrl.replace(/\/+$/, '');
        if (!profileBase.endsWith('/recent-activity/all') && !profileBase.includes('/posts/')) {
          profileBase = `${profileBase}/recent-activity/all/`;
        }
        return profileBase;
      }

      return cleanUrl;
    } catch (e) {
      return this.getFallbackTargetUrl(target);
    }
  }

  getFallbackTargetUrl(target) {
    if (target && target.linkedin_url) {
      let base = target.linkedin_url.replace(/\/+$/, '');
      return `${base}/recent-activity/all/`;
    }
    return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(target?.name || '')}`;
  }

  async executeGoogleSearch(query) {
    const googleSearchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    try {
      const response = await fetch(googleSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      if (!response.ok) {
        return [];
      }

      const html = await response.text();
      return this.parseSearchResults(html);
    } catch (err) {
      return [];
    }
  }

  parseSearchResults(html) {
    const results = [];
    const linkRegex = /<a class="result__url" href="([^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>/g;
    const snippetRegex = /<a class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

    const urls = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      let rawUrl = match[1];
      urls.push({ url: rawUrl, title: match[2].replace(/<[^>]+>/g, '').trim() });
    }

    const snippets = [];
    while ((match = snippetRegex.exec(html)) !== null) {
      snippets.push(match[1].replace(/<[^>]+>/g, '').trim());
    }

    for (let i = 0; i < Math.min(urls.length, snippets.length); i++) {
      const item = urls[i];
      if (item.url.includes('linkedin.com/')) {
        results.push({
          raw_url: item.url,
          title: item.title,
          snippet: snippets[i] || '',
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  async scanAllTargets(limit = 100) {
    const targets = this.loadTargets().slice(0, limit);
    const processed = this.loadProcessedUrls();
    const newItems = [];

    console.log(`[Scanner] Starting scan cycle across ALL ${targets.length} CEO/CTO targets...`);

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const queries = this.generateDorkQueries(target);
      const query = queries[0];

      if ((i + 1) % 10 === 0 || i === 0) {
        console.log(`[Scanner] Progress: [${i + 1}/${targets.length}] scanning ${target.name} (${target.company})...`);
      }

      const searchResults = await this.executeGoogleSearch(query);

      for (const res of searchResults) {
        const normalizedUrl = this.normalizeLinkedInUrl(res.raw_url, target);
        if (!processed.has(normalizedUrl)) {
          newItems.push({
            target_id: target.id,
            target_name: target.name,
            target_title: target.title,
            target_company: target.company,
            target_segment: target.segment,
            target_linkedin_url: target.linkedin_url,
            post_url: normalizedUrl,
            title: res.title,
            snippet: res.snippet,
            discovered_at: res.timestamp
          });
          this.saveProcessedUrl(normalizedUrl);
        }
      }

      await new Promise(r => setTimeout(r, 100)); // fast scanning delay
    }

    console.log(`[Scanner] Completed scanning all ${targets.length} targets. Found ${newItems.length} fresh signals.`);
    return newItems;
  }
}

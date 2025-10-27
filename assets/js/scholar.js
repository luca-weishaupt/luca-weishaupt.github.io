// assets/js/scholar.js

async function tryLoadStaticData() {
  try {
    const resp = await fetch('assets/data/publications.json');
    if (!resp.ok) throw new Error('Static data not found');
    return await resp.json();
  } catch (err) {
    console.log('Could not load static publications data:', err.message);
    return null;
  }
}

async function tryFetchWithProxy(scholarUrl, proxyUrl) {
  const resp = await fetch(proxyUrl, { timeout: 5000 });
  if (!resp.ok) throw new Error(`Proxy fetch failed: ${resp.status}`);
  
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // --- Parse the citation summary ---
  const summary = {};
  doc.querySelectorAll('#gsc_rsb_st tbody tr').forEach(row => {
    const metric = row.children[0]?.textContent.trim() || '';
    const value = row.children[1]?.textContent.trim() || '';
    if (/Citations/i.test(metric)) summary.total_citations = value;
    else if (/h-index/i.test(metric)) summary.h_index = value;
    else if (/i10-index/i.test(metric)) summary.i10_index = value;
  });

  // --- Parse the list of papers ---
  const papers = [];
  doc.querySelectorAll('tr.gsc_a_tr').forEach(tr => {
    const titleEl = tr.querySelector('.gsc_a_at');
    const yearEl = tr.querySelector('.gsc_a_y span');
    const citeEl = tr.querySelector('.gsc_a_c a') || tr.querySelector('.gsc_a_c');
    const linkEl = tr.querySelector('.gsc_a_at');
    
    const title = titleEl?.textContent.trim();
    const year = yearEl?.textContent.trim() || 'N/A';
    const citations = citeEl?.textContent.trim() || '0';
    const url = linkEl?.href || '';
    
    if (title) papers.push({ title, year, citations, url });
  });

  return { summary, publications: papers };
}

async function tryLiveFetch(scholarUrl) {
  // Try multiple CORS proxies
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
  ];
  
  for (const proxy of proxies) {
    try {
      const proxyUrl = proxy + encodeURIComponent(scholarUrl);
      const data = await tryFetchWithProxy(scholarUrl, proxyUrl);
      if (data && data.summary && data.summary.total_citations) {
        console.log(`Successfully fetched via ${proxy}`);
        return data;
      }
    } catch (err) {
      console.log(`Proxy ${proxy} failed:`, err.message);
      continue;
    }
  }
  
  return null;
}

async function loadScholar() {
  const scholarUrl = 'https://scholar.google.com/citations?user=KUDBcugAAAAJ&hl=en&cstart=0&pagesize=100';
  
  // Try to load static data first (faster and more reliable)
  let data = await tryLoadStaticData();
  
  // If static data not available or outdated, try live fetch
  if (!data || !data.summary || !data.summary.total_citations || data.summary.total_citations === "Loading...") {
    console.log('Attempting live fetch from Google Scholar...');
    data = await tryLiveFetch(scholarUrl);
  } else {
    console.log('Loaded publications from static data');
  }

  // Display the data
  const summaryEl = document.getElementById('pub-summary');
  const listEl = document.getElementById('pub-list');

  if (data && data.summary && data.summary.total_citations && data.summary.total_citations !== "Loading...") {
    // Successfully got data
    if (summaryEl) {
      summaryEl.innerHTML = `
        <p style="margin-bottom: 1em;">
          <strong>Citations:</strong> ${data.summary.total_citations} |
          <strong>h-index:</strong> ${data.summary.h_index} |
          <strong>i10-index:</strong> ${data.summary.i10_index}
        </p>`;
    }

    if (listEl) {
      listEl.innerHTML = '';
      if (data.publications && data.publications.length) {
        data.publications.slice(0, 10).forEach(p => {
          const li = document.createElement('li');
          li.style.marginBottom = '1em';
          
          if (p.url && p.url.startsWith('http')) {
            li.innerHTML = `<strong><a href="${p.url}" target="_blank" rel="noopener">${p.title}</a></strong><br>
                           <span style="color: #999;">(${p.year}) — ${p.citations} citation${p.citations !== '1' ? 's' : ''}</span>`;
          } else {
            li.innerHTML = `<strong>${p.title}</strong><br>
                           <span style="color: #999;">(${p.year}) — ${p.citations} citation${p.citations !== '1' ? 's' : ''}</span>`;
          }
          
          listEl.appendChild(li);
        });
      } else {
        listEl.innerHTML = '<li>No publications found.</li>';
      }
    }
  } else {
    // All methods failed - show a direct link to Google Scholar
    console.error('Could not load publications data. Showing direct link.');
    
    if (summaryEl) {
      summaryEl.innerHTML = `
        <p style="margin-bottom: 1em;">
          For the latest publication data and citation metrics, please visit my 
          <a href="${scholarUrl}" target="_blank" rel="noopener" style="color: #18bfef;">Google Scholar profile</a>.
        </p>`;
    }
    
    if (listEl) {
      listEl.innerHTML = `
        <li style="margin-bottom: 0.5em;">
          <a href="${scholarUrl}" target="_blank" rel="noopener" style="color: #18bfef;">
            View all publications on Google Scholar →
          </a>
        </li>`;
    }
  }
}

document.addEventListener('DOMContentLoaded', loadScholar);

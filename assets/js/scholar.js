// assets/js/scholar.js

async function loadScholar() {
  // 1) Build the Google Scholar URL
  const scholarUrl =
    'https://scholar.google.com/citations?user=KUDBcugAAAAJ&hl=en&cstart=0&pagesize=100';

  // 2) Proxy it through AllOrigins to bypass CORS
  const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(scholarUrl);

  try {
    const resp = await fetch(proxyUrl);
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
      const citeEl = tr.querySelector('.gsc_a_c a')    // note: citations often come in an <a>
        || tr.querySelector('.gsc_a_c');    // or fallback to the <td> if no link
      const title = titleEl?.textContent.trim();
      const year = yearEl?.textContent.trim() || 'N/A';
      const citations = citeEl?.textContent.trim() || '0';
      if (title) papers.push({ title, year, citations });
    });

    // --- Inject into your page ---
    const summaryEl = document.getElementById('pub-summary');
    if (summaryEl && summary.total_citations) {
      summaryEl.innerHTML = `
        <p>
          Total citations: ${summary.total_citations} |
          H-index: ${summary.h_index} |
          i10-index: ${summary.i10_index}
        </p>`;
    }

    const listEl = document.getElementById('pub-list');
    if (listEl) {
      listEl.innerHTML = '';                // clear “No publications found.”
      if (papers.length) {
        // show top 5, or change to papers.forEach(...) for all
        papers.slice(0, 5).forEach(p => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${p.title}</strong>
                           (${p.year}) — ${p.citations} citations`;
          listEl.appendChild(li);
        });
      } else {
        listEl.innerHTML = '<li>No publications found.</li>';
      }
    }

  } catch (err) {
    console.error('Could not load Google Scholar data', err);
    const summaryEl = document.getElementById('pub-summary');
    if (summaryEl) summaryEl.textContent = 'Publication data unavailable.';
  }
}

document.addEventListener('DOMContentLoaded', loadScholar);

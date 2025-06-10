// Fetch Google Scholar profile and display publication data in real-time
// Uses r.jina.ai as a simple CORS proxy to access the public profile page
async function loadScholar() {
  const profileUrl =
    'https://r.jina.ai/https://scholar.google.com/citations?user=KUDBcugAAAAJ&hl=en&cstart=0&pagesize=100';
  try {
    const resp = await fetch(profileUrl);
    if (!resp.ok) throw new Error('Network response was not ok');
    const html = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const summary = {};
    doc.querySelectorAll('#gsc_rsb_st tbody tr').forEach(row => {
      const metric = row.children[0]?.textContent.trim();
      const value = row.children[1]?.textContent.trim();
      if (/Citations/i.test(metric)) summary.total_citations = value;
      else if (/h-index/i.test(metric)) summary.h_index = value;
      else if (/i10-index/i.test(metric)) summary.i10_index = value;
    });

    const papers = [];
    doc.querySelectorAll('#gsc_a_t .gsc_a_tr').forEach(tr => {
      const title = tr.querySelector('.gsc_a_at')?.textContent.trim();
      const year = tr.querySelector('.gsc_a_y span')?.textContent.trim();
      const citations = tr.querySelector('.gsc_a_c')?.textContent.trim() || '0';
      if (title) papers.push({ title, year, citations });
    });

    const summaryEl = document.getElementById('pub-summary');
    if (summaryEl && summary.total_citations) {
      summaryEl.innerHTML = `<p>Total citations: ${summary.total_citations} | H-index: ${summary.h_index} | i10-index: ${summary.i10_index}</p>`;
    }

    const listEl = document.getElementById('pub-list');
    if (listEl && papers.length) {
      papers.slice(0, 5).forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.title} (${p.year}) - ${p.citations} citations`;
        listEl.appendChild(li);
      });
    } else if (listEl) {
      listEl.innerHTML = '<li>No publications found.</li>';
    }
  } catch (err) {
    console.error('Could not load Google Scholar data', err);
    const summaryEl = document.getElementById('pub-summary');
    if (summaryEl) summaryEl.textContent = 'Publication data unavailable.';
  }
}

document.addEventListener('DOMContentLoaded', loadScholar);

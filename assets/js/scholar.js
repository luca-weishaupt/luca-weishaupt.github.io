// Load scholar data and populate publication list
fetch('assets/data/scholar-data.json')
  .then(resp => resp.json())
  .then(data => {
    const summaryEl = document.getElementById('pub-summary');
    const listEl = document.getElementById('pub-list');
    if (summaryEl && data.summary) {
      summaryEl.innerHTML = `<p>Total citations: ${data.summary.total_citations} | H-index: ${data.summary.h_index} | i10-index: ${data.summary.i10_index}</p>`;
    }
    if (listEl && data.papers && data.papers.length) {
      data.papers.forEach(p => {
        const li = document.createElement('li');
        li.textContent = `${p.title} (${p.year}) - ${p.citations} citations`;
        listEl.appendChild(li);
      });
    } else if (listEl) {
      listEl.innerHTML = '<li>No publications found.</li>';
    }
  })
  .catch(err => {
    console.error('Could not load scholar data', err);
    const summaryEl = document.getElementById('pub-summary');
    if (summaryEl) summaryEl.textContent = 'Publication data unavailable.';
  });

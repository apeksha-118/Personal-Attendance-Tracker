document.addEventListener('DOMContentLoaded', () => {
  const subjectsContainer = document.getElementById('subjects');
  const addSubjectBtn = document.getElementById('addSubject');
  const STORAGE_KEY = 'attendanceData';

  function saveAll() {
    const data = [];
    document.querySelectorAll('.subject-card').forEach(card => {
      const name = card.querySelector('.subject-name').value.trim();
      if (!name) return;
      const days = [];
      card.querySelectorAll('tbody tr').forEach(row => {
        const date = row.querySelector('input[type="date"]').value;
        const present = row.querySelector('input[type="checkbox"]').checked;
        const reason = row.querySelector('.reason-input').value.trim();
        days.push({ date, present, reason });
      });
      data.push({ name, days });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function addDayRow(tableBody, initial = {}) {
    const tr = document.createElement('tr');
    const today = new Date().toISOString().split('T')[0];

    // Date cell
    const tdDate = document.createElement('td');
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.value = initial.date || today;
    dateInput.addEventListener('change', saveAll);
    tdDate.appendChild(dateInput);
    tr.appendChild(tdDate);

    // Present checkbox cell
    const tdPresent = document.createElement('td');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = initial.present || false;
    check.addEventListener('change', () => {
      updateRowColor(tr, check.checked);
      saveAll();
    });
    tdPresent.appendChild(check);
    tr.appendChild(tdPresent);

    // Reason cell
    const tdReason = document.createElement('td');
    const reasonInput = document.createElement('input');
    reasonInput.type = 'text';
    reasonInput.placeholder = 'Reason (if absent)';
    reasonInput.className = 'reason-input';
    reasonInput.value = initial.reason || '';
    reasonInput.addEventListener('change', saveAll);
    tdReason.appendChild(reasonInput);
    tr.appendChild(tdReason);

    updateRowColor(tr, check.checked);
    tableBody.appendChild(tr);
  }

  function updateRowColor(row, isPresent) {
    row.classList.toggle('present-row', isPresent);
    row.classList.toggle('absent-row', !isPresent);
  }

  function updateSummary(card) {
    const rows = card.querySelectorAll('tbody tr');
    let attended = 0, total = 0;
    rows.forEach(r => {
      const chk = r.querySelector('input[type="checkbox"]');
      if (!chk.closest('tr').classList.contains('disabled')) {
        total++;
        if (chk.checked) attended++;
      }
    });
    const percent = total ? ((attended / total) * 100).toFixed(1) : 0;
    return { attended, total, percent };
  }

  function createSubject(subject = '', days = []) {
    const card = document.createElement('div');
    card.className = 'subject-card';

    // Header
    const header = document.createElement('div');
    header.className = 'card-header';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Subject Name';
    nameInput.value = subject;
    nameInput.className = 'subject-name';
    nameInput.addEventListener('change', saveAll);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-subject';
    removeBtn.textContent = '×';
    removeBtn.title = 'Remove subject';
    removeBtn.addEventListener('click', () => {
      subjectsContainer.removeChild(card);
      saveAll();
    });
    header.appendChild(nameInput);
    header.appendChild(removeBtn);
    card.appendChild(header);

    // Table
    const table = document.createElement('table');
    table.className = 'subject-table';
    table.innerHTML = `
      <thead>
        <tr><th>Date</th><th>Present</th><th>Reason</th></tr>
      </thead>
      <tbody></tbody>`;
    card.appendChild(table);
    const tbody = table.querySelector('tbody');

    // Add Day button
    const addDayBtn = document.createElement('button');
    addDayBtn.className = 'add-day-btn';
    addDayBtn.textContent = '+ Add Day';
    addDayBtn.addEventListener('click', () => addDayRow(tbody));
    card.appendChild(addDayBtn);

    // Calculate Attendance button
    const calcBtn = document.createElement('button');
    calcBtn.className = 'calculate-btn';
    calcBtn.textContent = 'Calculate Attendance';
    calcBtn.addEventListener('click', () => {
      const { attended, total, percent } = updateSummary(card);
      const subj = nameInput.value.trim() || 'Subject';
      alert(`${subj}\nAttended: ${attended}/${total} (${percent}%)`);
    });
    card.appendChild(calcBtn);

    subjectsContainer.appendChild(card);

    // Restore stored rows
    days.forEach(d => addDayRow(tbody, d));
  }

  // Load from localStorage
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      JSON.parse(raw).forEach(item => {
        createSubject(item.name, item.days);
      });
    } catch {}
  }

  addSubjectBtn.addEventListener('click', () => createSubject());
});
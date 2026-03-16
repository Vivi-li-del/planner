const form = document.getElementById('plan-form');
const tripList = document.getElementById('trip-list');
const weekendList = document.getElementById('weekend-list');
const familyList = document.getElementById('family-list');
const upcomingList = document.getElementById('upcoming-list');
const upcomingCount = document.getElementById('upcoming-count');
const ideaText = document.getElementById('idea-text');
const shuffleIdea = document.getElementById('shuffle-idea');
const filterButtons = document.querySelectorAll('.filter-btn');
const filterAll = document.getElementById('filter-all');
const calendarView = document.getElementById('calendar-view');
const listView = document.getElementById('list-view');
const viewCalendarBtn = document.getElementById('view-calendar');
const viewListBtn = document.getElementById('view-list');
const submitBtn = document.querySelector('#plan-form button[type="submit"], #plan-form button');
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthLabel = document.getElementById('calendar-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const ideas = [
  'Sunset picnic at the park',
  'Try a new brunch spot',
  'Bike ride on the trail',
  'Board game night with pizza',
  'Farmers market + homemade dinner',
  'Hike and coffee after',
  'Movie marathon with popcorn bar',
  'Visit a nearby museum or gallery'
];

let plans = [];
let activeFilter = 'all';
let editingId = null;
let calendarCursor = new Date();

function renderPlans() {
  const now = new Date();
  const lists = { trip: tripList, weekend: weekendList, family: familyList };
  Object.values(lists).forEach(list => list.innerHTML = '');
  upcomingList.innerHTML = '';
  calendarGrid.innerHTML = '';
  listView.innerHTML = '';

  const filtered = plans.filter(p => activeFilter === 'all' || p.type === activeFilter);

  filtered.forEach(plan => {
    const startDate = parseDate(plan.date);
    if (!startDate) return; // require valid start date
    let endDate = parseDate(plan.endDate) || startDate;
    if (endDate < startDate) endDate = startDate;

    const card = document.createElement('div');
    card.className = 'card rounded-xl bg-slate-900 border border-white/10 p-3 flex flex-col gap-2';
    const range = formatRange(startDate, endDate);
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-semibold">${plan.title}</span>
        <span class="text-xs px-2 py-1 rounded-full ${badgeClass(plan.type)}">${plan.type}</span>
      </div>
      <div class="text-xs text-slate-400 flex items-center gap-2">
        ${range}
        ${plan.location ? `• <i class='fa-solid fa-location-dot'></i> ${plan.location}` : ''}
      </div>
      <div class="flex gap-2 text-xs mt-1">
        <button class="edit-btn px-2 py-1 rounded bg-white/10" data-id="${plan.id}"><i class="fa-regular fa-pen-to-square"></i> Edit</button>
        <button class="delete-btn px-2 py-1 rounded bg-white/10 text-rose-300" data-id="${plan.id}"><i class="fa-regular fa-trash-can"></i> Delete</button>
      </div>
      ${plan.note ? `<p class="text-sm text-slate-200">${plan.note}</p>` : ''}
    `;
    lists[plan.type].appendChild(card);

    if (startDate >= new Date(now.toDateString())) { // compare date-only
      const upcomingItem = document.createElement('div');
      upcomingItem.className = 'rounded-lg bg-slate-900 border border-white/10 p-3 flex items-center justify-between text-sm';
      upcomingItem.innerHTML = `
        <div class="flex flex-col">
          <span class="font-semibold">${plan.title}</span>
          <span class="text-slate-400 text-xs">${range}</span>
          ${plan.location ? `<span class="text-slate-500 text-xs">${plan.location}</span>` : ''}
        </div>
        <span class="text-xs px-2 py-1 rounded-full ${badgeClass(plan.type)}">${plan.type}</span>
      `;
      upcomingList.appendChild(upcomingItem);
    }

    // Calendar view will be rendered separately after loop

    // List view
    const listItem = document.createElement('div');
    listItem.className = 'rounded-lg bg-slate-900 border border-white/10 p-3 text-sm flex flex-col gap-1';
    listItem.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-semibold">${plan.title}</span>
        <span class="text-xs px-2 py-1 rounded-full ${badgeClass(plan.type)}">${plan.type}</span>
      </div>
      <div class="text-xs text-slate-400 flex items-center gap-2">${range}${plan.location ? ` • ${plan.location}` : ''}</div>
      ${plan.note ? `<p class="text-slate-200">${plan.note}</p>` : ''}
    `;
    listView.appendChild(listItem);
  });

  upcomingCount.textContent = `${upcomingList.childElementCount} upcoming`;

  // bind edit/delete
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => startEdit(btn.dataset.id);
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => deletePlan(btn.dataset.id);
  });

  renderCalendar();
}

function badgeClass(type) {
  if (type === 'trip') return 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30';
  if (type === 'weekend') return 'bg-pink-500/20 text-pink-200 border border-pink-500/30';
  return 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30';
}

function formatRange(start, end) {
  const sDate = start instanceof Date ? start : parseDate(start);
  const eDate = end instanceof Date ? end : parseDate(end);
  if (!sDate && !eDate) return 'Anytime';
  if (sDate && !eDate) return sDate.toDateString();
  if (!sDate && eDate) return `Until ${eDate.toDateString()}`;
  if (eDate < sDate) return sDate.toDateString();
  if (sDate.getTime() === eDate.getTime()) return sDate.toDateString();
  return `${sDate.toDateString()} — ${eDate.toDateString()}`;
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(`${str}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function renderCalendar() {
  if (!calendarGrid || !calendarMonthLabel) return;
  calendarGrid.innerHTML = '';
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const startDay = start.getDay();
  calendarMonthLabel.textContent = `${start.toLocaleString('default', { month: 'long' })} ${year}`;

  // prepare date map
  const dayPlans = {};
  plans.forEach(p => {
    const s = parseDate(p.date);
    if (!s) return;
    let e = parseDate(p.endDate) || s;
    if (e < s) e = s;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0,10);
      if (!dayPlans[key]) dayPlans[key] = [];
      dayPlans[key].push(p);
    }
  });

  // leading blanks
  for (let i = 0; i < startDay; i++) {
    const cell = document.createElement('div');
    cell.className = 'min-h-[90px] rounded-xl bg-slate-900/40 border border-white/5';
    calendarGrid.appendChild(cell);
  }

  for (let day = 1; day <= end.getDate(); day++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const cell = document.createElement('div');
    cell.className = 'min-h-[110px] rounded-xl bg-slate-900 border border-white/10 p-2 flex flex-col gap-1';
    cell.innerHTML = `<div class="text-xs text-slate-400">${day}</div>`;
    const items = dayPlans[dateStr] || [];
    items.forEach(item => {
      const badge = document.createElement('div');
      badge.className = `text-[11px] px-2 py-1 rounded bg-white/10 border ${badgeClass(item.type)}`;
      badge.textContent = item.title;
      cell.appendChild(badge);
    });
    calendarGrid.appendChild(cell);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const plan = {
    id: editingId || createId(),
    title: data.get('title')?.trim() || 'Untitled',
    location: data.get('location')?.trim() || '',
    type: data.get('type') || 'trip',
    date: data.get('date') || '',
    endDate: data.get('endDate') || '',
    note: data.get('note')?.trim() || ''
  };
  if (editingId) {
    plans = plans.map(p => (p.id === editingId ? plan : p));
    editingId = null;
    submitBtn.textContent = 'Add';
  } else {
    plans.unshift(plan);
  }
  renderPlans();
  form.reset();
});

filterAll.addEventListener('click', () => {
  activeFilter = 'all';
  setFilters();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter;
    setFilters(btn);
  });
});

function setFilters(activeBtn) {
  filterButtons.forEach(b => b.classList.remove('bg-indigo-600', 'text-white'));
  filterAll.classList.remove('bg-indigo-600', 'text-white');
  if (activeBtn) {
    activeBtn.classList.add('bg-indigo-600', 'text-white');
  } else {
    filterAll.classList.add('bg-indigo-600', 'text-white');
  }
  renderPlans();
}

shuffleIdea.addEventListener('click', () => {
  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  ideaText.textContent = idea;
});

function startEdit(id) {
  const plan = plans.find(p => p.id === id);
  if (!plan) return;
  editingId = id;
  form.title.value = plan.title;
  form.location.value = plan.location;
  form.type.value = plan.type;
  form.date.value = plan.date;
  form.endDate.value = plan.endDate;
  form.note.value = plan.note;
  submitBtn.textContent = 'Update';
  form.scrollIntoView({ behavior: 'smooth' });
}

function deletePlan(id) {
  plans = plans.filter(p => p.id !== id);
  if (editingId === id) {
    editingId = null;
    submitBtn.textContent = 'Add';
    form.reset();
  }
  renderPlans();
}

function createId() {
  return 'p_' + Math.random().toString(36).slice(2, 9) + Date.now();
}

// View toggle
function setView(view) {
  if (view === 'list') {
    listView.classList.remove('hidden');
    calendarView.classList.add('hidden');
    viewListBtn.classList.add('bg-indigo-600', 'text-white');
    viewCalendarBtn.classList.remove('bg-indigo-600', 'text-white');
    viewCalendarBtn.classList.add('bg-white/10');
  } else {
    calendarView.classList.remove('hidden');
    listView.classList.add('hidden');
    viewCalendarBtn.classList.add('bg-indigo-600', 'text-white');
    viewListBtn.classList.remove('bg-indigo-600', 'text-white');
    viewListBtn.classList.add('bg-white/10');
  }
}

viewCalendarBtn.addEventListener('click', () => setView('calendar'));
viewListBtn.addEventListener('click', () => setView('list'));
prevMonthBtn?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() - 1); renderCalendar(); });
nextMonthBtn?.addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() + 1); renderCalendar(); });

// Seed some sample plans
plans = [
  { id: createId(), title: 'Spring break road trip', location: 'San Diego', type: 'trip', date: '2026-04-10', endDate: '2026-04-15', note: 'Book hotel, pack layers, bring snacks' },
  { id: createId(), title: 'Saturday soccer', location: 'Community field', type: 'family', date: '2026-03-21', endDate: '', note: 'Bring water and snacks' },
  { id: createId(), title: 'Brunch + farmers market', location: 'Downtown', type: 'weekend', date: '2026-03-22', endDate: '', note: 'Try the new coffee spot' }
];

setFilters();
renderPlans();

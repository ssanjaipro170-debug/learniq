// js/sidebar.js — inject sidebar into every page

function getSidebarHTML(activePage) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html', icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>` },
    { id: 'courses',   label: 'Courses',   href: 'courses.html',   icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M5 3V2M11 3V2M2 7h12"/></svg>` },
    { id: 'test',      label: 'Tests',     href: 'test.html',      icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M5 6h6M5 9h4M5 12h3"/></svg>` },
    { id: 'analytics', label: 'Analytics', href: 'analytics.html', icon: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12l3.5-4 3 2.5L12 5l2 2"/></svg>` },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Student","email":"student@college.edu"}');
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return `
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
          <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white"/>
          <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white"/>
          <rect x="10" y="10" width="6" height="6" rx="1.5" fill="rgba(255,255,255,0.5)"/>
        </svg>
      </div>
      <span class="logo-text">Learn<span>IQ</span></span>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">Main</div>
      ${nav.map(n => `
        <a href="${n.href}" class="nav-item ${activePage === n.id ? 'active' : ''}">
          ${n.icon} ${n.label}
        </a>
      `).join('')}
      <div class="nav-section" style="margin-top:8px;">Account</div>
      <a href="#" class="nav-item">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"/></svg>
        Profile
      </a>
      <a href="#" class="nav-item" onclick="logout()">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l3-3-3-3M14 8H6"/></svg>
        Logout
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="avatar">${initials}</div>
        <div class="user-info">
          <p>${user.name}</p>
          <span>${user.role || 'Student'}</span>
        </div>
      </div>
    </div>
  </aside>`;
}

function injectSidebar(activePage) {
  const placeholder = document.getElementById('sidebar-placeholder');
  if (placeholder) placeholder.outerHTML = getSidebarHTML(activePage);
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../login.html';
}

function authGuard() {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = '../login.html';
}

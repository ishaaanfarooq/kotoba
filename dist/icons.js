const shapes={
 story:'<path d="M3 5h18v13H8l-5 3z"/><path d="m10 9 5 3-5 3z"/>',
 book:'<path d="M3 4c4-1 6 0 9 2 3-2 5-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2zM12 6v14"/>',
 levels:'<path d="M5 19v-4m6 4v-9m6 9V5" stroke-width="3"/>',
 down:'<path d="m6 9 6 6 6-6"/>',
 mic:'<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-3 0h6"/>',
 volume:'<path d="M11 4 6 8H3v8h3l5 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
 cup:'<path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a3 3 0 0 1 0 6h-2M7 3v3m4-4v4M2 22h17"/>',
 size:'<path d="M2 10h6l-1 10H3zM12 6h9l-1 14h-7zM11 6h11M13 3h6"/>',
 store:'<path d="m3 9 2-5h14l2 5M4 12v8h16v-8M9 20v-6h6v6M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>',
 chat:'<path d="M3 4h18v13H9l-6 4zM7 9h10m-10 4h6"/>',
 quiz:'<rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 3 3 5-6"/>',
 skip:'<path d="m5 6 9 6-9 6zM18 6v12"/>',
 hand:'<path d="M8 13V6a2 2 0 0 1 4 0v5l2-1 6 2v3c0 4-2 6-5 6h-3c-2 0-3-1-4-3l-4-5a1.5 1.5 0 0 1 2-2z"/>',
 film:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="m3 7-1-4 18-2 1 4zM7 3l3 3m3-4 3 3"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2"/>',
 route:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h9a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9"/>',
 x:'<path d="m6 6 12 12M18 6 6 18"/>', check:'<path d="m4 12 5 5L20 6"/>',
 wave:'<path d="M3 10v4m4-8v12m5-15v18m5-15v12m4-8v4"/>',
 play:'<path d="m8 4 12 8-12 8z"/>', user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 1 1 16 0"/>'
};
export const icon=n=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+shapes[n]+'</svg>';

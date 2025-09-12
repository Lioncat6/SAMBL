const newUrl = 'http://sambl.lioncat6.com' + window.location.pathname.replace('/SAMBL', '') + window.location.search + window.location.hash;
window.location.replace(newUrl);
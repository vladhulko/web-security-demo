(function () {
  var raw = location.hash ? location.hash.slice(1) : '';
  var name = raw ? decodeURIComponent(raw) : 'Гість';
  document.getElementById('welcome').innerHTML = 'Привіт, ' + name;
})();

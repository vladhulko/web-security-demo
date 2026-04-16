(function () {
  if (new URLSearchParams(location.search).get('error')) {
    var el = document.getElementById('err');
    if (el) el.classList.remove('error-hidden');
  }
})();

function resizer() {
  if (!$('#fullsize')) {
    window.setTimeout(resizer,50);
  } else {
    $('body').on('DOMSubtreeModified', '#fullsize', resize);
    resize();
  }
}

function resize() {
  let width = document.getElementById("events").clientWidth;
  let textwidth = document.getElementById("fullsize").clientWidth;
  let size = 90;
  document.getElementById("fullsize").style.fontSize = size + "vh";
  
  while (width < textwidth && size > 0) {
    size--;
    document.getElementById("fullsize").style.fontSize = size + "vh";
    textwidth = document.getElementById("fullsize").clientWidth;
  }
}

resizer();
function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;
      
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;
  
    clearTimeout(timeout);

    timeout = setTimeout(later, wait);
  
    if (callNow) func.apply(context, args);
  };
};

var theme_previews = document.getElementsByClassName("theme-preview");

var getThemeParams = function() {
  var form_data = new FormData(document.getElementById('theme-form'))
  return(new URLSearchParams(form_data).toString());
}

var getBundleParams = function() {
  var bundle_data = new FormData(document.getElementById('bundle-form'))
  return(new URLSearchParams(bundle_data).toString());
}

var updateThemePreview = function(){
  var theme_params =  getThemeParams();
  Array.from(theme_previews).forEach(e => e['src'] = e['dataset']['themePreviewUrl'] + '?' + theme_params);
}

var debouncedUpdateThemePreview = debounce(updateThemePreview, 500, false);

var updateBundleLink = function(){
  document.getElementById("download-bundle")['href'] = '/bundle?' + getThemeParams() + '&' + getBundleParams();
}

var themePreviewDidLoad = function(evt){
  evt.target.classList.remove('awaiting-update');
}

Array.from(theme_previews).forEach(e => e.addEventListener('load', themePreviewDidLoad));

var themeFormDidChange = function(e){
  Array.from(theme_previews).forEach(e => e.classList.add('awaiting-update'));
  debouncedUpdateThemePreview();
  updateBundleLink();

  if(e != null){
    const params = new URLSearchParams(location.search);
    params.set(e.target['name'], e.target['value']);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
  }
}

const params = new URLSearchParams(location.search);
for (let p of params){
  var pe = document.getElementById("theme-input-"+p[0]);
  if(pe != null){
    pe['value'] = p[1];
  }
}

var themeFormInputs = document.querySelectorAll("#theme-form input, #theme-form select");
Array.from(themeFormInputs).forEach(i => i.addEventListener('input', themeFormDidChange));

themeFormDidChange();

var updateBundleFormInputs = function(){
  var bundleFormInputs = document.getElementById("bundle-form").getElementsByTagName("input");
  var countOfRequestedSkinnableIds = 0;
  Array.from(bundleFormInputs).forEach(i => {
    if (i['name'] == 'requested_skinnable_id[]' && i['checked']) {
      countOfRequestedSkinnableIds += 1;
    }
  })

  if(countOfRequestedSkinnableIds >= 16){
    Array.from(bundleFormInputs).forEach(i => {if (!i['checked']) {i['disabled'] = true;}})
  }else{
    Array.from(bundleFormInputs).forEach(i => i['disabled'] = false)
  }

}

var bundleFormDidChange = function(e){
  updateBundleLink();
  updateBundleFormInputs();
}

var bundleFormInputs = document.querySelectorAll("#bundle-form input, #bundle-form select");
Array.from(bundleFormInputs).forEach(i => i.addEventListener('input', bundleFormDidChange));


bundleFormDidChange();

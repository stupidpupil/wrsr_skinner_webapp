var MaxRequestedSkinnableIdsCount = 16;
var RequestedSkinnableIdsCount = 0;
var VisibleUncheckedSkinnableRowsCount = 0;
var VisibleCheckedSkinnableRowsCount = 0;

var updateVisibleSkinnableRowsCounts = function() {
  VisibleUncheckedSkinnableRowsCount =
    document.querySelectorAll("#bundle-form-skinnable-table tr:not(.hidden-by-search) input:not(:checked)").length;

  VisibleCheckedSkinnableRowsCount =
    document.querySelectorAll("#bundle-form-skinnable-table tr:not(.hidden-by-search) input:checked").length;

  updateAddVisibleSkinnableButton();
  updateRemoveVisibleSkinnableButton();
}

var updateBundleFormInputs = function(){
  var bundleFormInputs = document.getElementById("bundle-form").getElementsByTagName("input");
  var countOfRequestedSkinnableIds = 0;
  Array.from(bundleFormInputs).forEach(i => {
    if (i['name'] == 'requested_skinnable_id[]' && i['checked']) {
      countOfRequestedSkinnableIds += 1;
    }
  })

  RequestedSkinnableIdsCount = countOfRequestedSkinnableIds;

  if(RequestedSkinnableIdsCount >= MaxRequestedSkinnableIdsCount){
    Array.from(bundleFormInputs).forEach(i => {if (!i['checked']) {i['disabled'] = true;}});
  }else{
    Array.from(bundleFormInputs).forEach(i => i['disabled'] = false);
  }

  updateVisibleSkinnableRowsCounts();
}

var updateAddVisibleSkinnableButton = function(){
  var addVisibleSkinnableButton = document.querySelector('#add-visible-skinnable-button');
  addVisibleSkinnableButton.innerHTML = 'Add ' + VisibleUncheckedSkinnableRowsCount + ' to Bundle';

  if( 
    VisibleUncheckedSkinnableRowsCount > 0 &&
    (RequestedSkinnableIdsCount + VisibleUncheckedSkinnableRowsCount) <= MaxRequestedSkinnableIdsCount ){
    addVisibleSkinnableButton['disabled'] = false;
  }else{
    addVisibleSkinnableButton['disabled'] = true;
  }

}

var updateRemoveVisibleSkinnableButton = function(){
  var removeVisibleSkinnableButton = document.querySelector('#remove-visible-skinnable-button');
  removeVisibleSkinnableButton.innerHTML = 'Remove ' + VisibleCheckedSkinnableRowsCount + ' from Bundle';

  if(VisibleCheckedSkinnableRowsCount > 0){
    removeVisibleSkinnableButton['disabled'] = false;
  }else{
    removeVisibleSkinnableButton['disabled'] = true;
  }
}

var addVisibleSkinnables = function(e){
  var visibleSkinnables = document.querySelectorAll("#bundle-form-skinnable-table tr:not(.hidden-by-search) input");
  Array.from(visibleSkinnables).forEach(i => i.checked = true);
  bundleFormDidChange();
}

var removeVisibleSkinnables = function(e){
  var visibleSkinnables = document.querySelectorAll("#bundle-form-skinnable-table tr:not(.hidden-by-search) input");
  Array.from(visibleSkinnables).forEach(i => i.checked = false);
  bundleFormDidChange();
}

document.querySelector('#add-visible-skinnable-button').addEventListener('click', addVisibleSkinnables);
document.querySelector('#remove-visible-skinnable-button').addEventListener('click', removeVisibleSkinnables);


var updateBundleSelectedCount = function(){
  document.querySelector('#bundle-selected-count').innerHTML = '' + RequestedSkinnableIdsCount + ' / ' + MaxRequestedSkinnableIdsCount;
}

var bundleFormDidChange = function(e){
  updateBundleLink();
  updateBundleFormInputs();
  updateBundleSelectedCount();
}

var bundleFormInputs = document.querySelectorAll("#bundle-form input, #bundle-form select");
Array.from(bundleFormInputs).forEach(i => i.addEventListener('input', bundleFormDidChange));

bundleFormDidChange();

var searchSkinnableTableInputDidChange = function(e){
  var skinnableRows = document.querySelectorAll("#bundle-form-skinnable-table tr");
  var searchText = document.querySelector('#search-skinnable-table-input').value;
  var countOfUncheckedVisibleRows = 0;

  var trMatchesSearchText = function(tr, searchText){

    var mustIncludeTerms = searchText.split(' ').filter(i => i[0] != '-')
    var mustNotIncludeTerms = searchText.split(' ').filter(i => i[0] == '-').map(i => i.substring(1))

    return(
      mustIncludeTerms.every(term => tr.textContent.includes(term)) && 
      mustNotIncludeTerms.every(term => !tr.textContent.includes(term)))
  }

  Array.from(skinnableRows).forEach(tr => {
    if(searchText == '' || trMatchesSearchText(tr, searchText)){
      tr.classList.remove('hidden-by-search');
    }else{
      tr.classList.add('hidden-by-search');
    }
  })

  updateVisibleSkinnableRowsCounts();
}

document.querySelector('#search-skinnable-table-input').addEventListener('input', searchSkinnableTableInputDidChange);
searchSkinnableTableInputDidChange();
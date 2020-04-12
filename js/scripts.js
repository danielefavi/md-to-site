$(document).ready(function() {
    $('#search-text').on("keyup", function(e) {
        if (e.keyCode == 13) {
            search();
        }
    });
});


// Toggle between showing and hiding the sidebar, and add overlay effect
function openSidebarMenu() {
  if (document.getElementById("menuSidebar").style.display === 'block') {
      $('#menuSidebar').hide();
      $('#overlayLayer').hide();
  } else {
      $('#menuSidebar').show();
      $('#overlayLayer').show();
  }
}

function closeSidebarMenu() {
    $('#menuSidebar').hide();
    $('#overlayLayer').hide();
}

function closeSearchResult() {
    $('#search-result-container').hide();
    $('#markdown-body').fadeIn();
    $('#toc').fadeIn();
}

function search() {
    $('#error-search').text('');
    $('#error-search').hide();

    var strToSearch = $('#search-text').val();

    if (strToSearch.length < 2) {
        $('#error-search').text('The string you are looking for is too short.');
        $('#error-search').show();
        return;
    }

    $('#strToSearch').text(strToSearch);

    var res = getSearchResult(strToSearch);

    $('#markdown-body').hide();
    $('#search-result-container').fadeIn();
    $('#toc').fadeOut();

    if (!res.length) {
        $('#search-result').html('<h3 class="text-center">Nothing was found</h3>');
        return;
    }

    $('#totFound').text(res.length);

    var html = '';
    for (var i=0; i<res.length; i++) {
        html += '<div class="result-entry"><h4><a href="'+ res[i].f +'">'+ res[i].t +'</a></h4>';
        html += '<p><b>Items found</b>: ';
        for (var j=0; j<res[i].found.length; j++) {
            html += '<i>' + res[i].found[j] + '</i>';

            if (j < res[i].found.length-1) html += ', ';
        }
        html += '</p>';
        html += '<p class="text-right"><a href="'+ res[i].f +'">Read More >></a></p></div>'

        $('#search-result').html(html);
    }
}

function getSearchResult(strToSearch) {
    var result = [];

    strToSearch = strToSearch.toLowerCase();

    for(var i=0; i<searchIndex.length; i++) {
        var entry = { f: searchIndex[i].f, t: searchIndex[i].t, found: [] };

        if (searchIndex[i].f.toLowerCase().indexOf(strToSearch) > -1) {
            entry.found.push(searchIndex[i].f);
        }
        if (searchIndex[i].t.toLowerCase().indexOf(strToSearch) > -1) {
            entry.found.push(searchIndex[i].t);
        }

        for (var j=0; j<searchIndex[i].c.length; j++) {
            var str = searchIndex[i].c[j];
            if (str.toLowerCase().indexOf(strToSearch) > -1) entry.found.push(str);
        }

        if (entry.found.length) result.push(entry);
    }

    return result;
}

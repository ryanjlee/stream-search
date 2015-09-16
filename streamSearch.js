document.addEventListener("DOMContentLoaded", function(event) { 
  
  var dataStore = {
    total: 0,
    maxPages: 1,
    limit: 10,
    page: 1,
    prev: '',
    next: ''
  }

  // makeSearchRequest('https://api.twitch.tv/kraken/search/streams?q=starcraft');

  document.getElementById('stream-search').addEventListener('submit', function(e) {
    e.preventDefault();

    var limit = dataStore.limit;
    var query = e.target.firstElementChild.value;
    var url = 'https://api.twitch.tv/kraken/search/streams?limit=' + limit + '&q=' + query;
    
    makeSearchRequest(url);
    e.target.firstElementChild.value = '';
    dataStore.page = 1;
  });

  document.getElementById('pager').lastElementChild.addEventListener('click', function(e) {
    updatePage(1);
  });
  document.getElementById('pager').firstElementChild.addEventListener('click', function(e) {
    updatePage(0);
  });


  function updatePage(direction) {
    if (direction && dataStore.page < dataStore.maxPages) {
      var url = dataStore.next;
      dataStore.page++;
    } else if (!direction && dataStore.page > 1) {
      url = dataStore.prev;
      dataStore.page--;
    } else {
      return;
    }
    
    makeSearchRequest(url);
  }


  function makeSearchRequest(url) {
    if (window.XMLHttpRequest) {
      var httpRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      try {
        httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
      } 
      catch (e) {
        try {
          httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
        } 
        catch (e) {}
      }
    }
    if (!httpRequest) {
      return false;
    }

    httpRequest.onreadystatechange = function(){
      if (httpRequest.readyState == XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          console.log(JSON.parse(httpRequest.responseText));
          updateDom(JSON.parse(httpRequest.responseText));
        } else {
          console.log(httpRequest.responseText);
        }
      }
    }

    httpRequest.open('GET', url);
    httpRequest.setRequestHeader('Accept', 'application/vnd.twitchtv.v3+json');
    httpRequest.send();
  }


  function updateDom(streamObj) {
    // update streamlist
    var streamList = streamObj.streams;
    var parent = document.getElementById('stream-list');
    var oldStreams = document.getElementsByClassName('stream');
    for (var i = oldStreams.length - 1; i >= 0; i--) {
      parent.removeChild(oldStreams[i]);
    }
    streamList.forEach(function(stream) {
      parent.appendChild(createStreamNode(stream));
    });

    // update results count
    dataStore.total = streamObj._total;
    document.getElementById('results-info').lastChild.innerHTML = dataStore.total;

    // update pagination functionality
    var pagerNode = document.getElementById('pager');
    
    if (dataStore.total) {
      toggleVisibility(pagerNode, 1);

      var pageStatus = pagerNode.children[1];
      dataStore.next = streamObj._links.next;
      dataStore.prev = streamObj._links.prev;
      dataStore.maxPages = Math.ceil(streamObj._total / dataStore.limit);
      pageStatus.firstChild.innerHTML = dataStore.page;
      pageStatus.lastChild.innerHTML = dataStore.maxPages;

      var firstPageStatus = dataStore.page === 1 ? 0 : 1;
      var lastPageStatus = dataStore.page === dataStore.maxPages ? 0 : 1;
      toggleVisibility(document.getElementById('pager').firstElementChild, firstPageStatus);
      toggleVisibility(document.getElementById('pager').lastElementChild, lastPageStatus);

    } else {
      toggleVisibility(pagerNode, 0);
      toggleVisibility(document.getElementById('pager').firstElementChild, 0);
      toggleVisibility(document.getElementById('pager').lastElementChild, 0);
    }
  }


  function toggleVisibility(node, status) {
    node.style.visibility = status ? 'initial' : 'hidden';
  }


  // Sample Stream Node
  // ==================
  // <div class='stream'>
  //   <a href='http://www.twitch.tv/professorbroman'>
  //     <span class='mobile-link'></span>
  //     <img src='http://static-cdn.jtvnw.net/previews-ttv/live_user_eghuk-160x90.jpg'>
  //   </a>
  //   <div class='stream-info'>
  //     <h2>
  //       <a href='http://www.twitch.tv/professorbroman'>Stream display name</a>
  //     </h2>
  //     <div class='stream-description'>
  //       <p><a href="http://www.twitch.tv/directory/game/Fallout 2">Game Name</a> - 1234 viewers</p>
  //       <p>Stream description text text text text text text text text text text text text...</p>
  //     </div>
  //   </div>
  // </div>

  function createStreamNode(stream) {
    var previewImage = stream.preview.template.replace(/{width}/, 160).replace(/{height}/, 90);

    var streamNode = createNode('div', '', 'class', 'stream');
    var imageNode = createNode('a', '', 'href', stream.channel.url);
    var infoNode = createNode('div', '', 'class', 'stream-info');
    var titleNode = createNode('h2', '');
    var descriptionNode = createNode('div', '', 'class', 'stream-description');
    var gameInfoNode = createNode('p', '');

    gameInfoNode.appendChild(createNode('a', stream.game, 'href', 'http://www.twitch.tv/directory/game/' + stream.game));
    gameInfoNode.appendChild(document.createTextNode(' - ' + stream.viewers + ' viewers'));

    descriptionNode.appendChild(gameInfoNode);
    descriptionNode.appendChild(createNode('p', stream.channel.status));
    
    titleNode.appendChild(createNode('a', stream.channel.display_name, 'href', stream.channel.url));

    infoNode.appendChild(titleNode);
    infoNode.appendChild(descriptionNode);

    imageNode.appendChild(createNode('span', '', 'class', 'mobile-link'));
    imageNode.appendChild(createNode('img', '', 'src', previewImage));
    
    streamNode.appendChild(imageNode);
    streamNode.appendChild(infoNode);

    return streamNode;
  }


  function createNode(el, contents, attr, value) {
    var node = document.createElement(el);
    if (contents.length) {
      node.appendChild(document.createTextNode(contents));
    }
    if (attr) {
      var att = document.createAttribute(attr);
      att.value = value;
      node.setAttributeNode(att);
    }
    return node;
  }
});

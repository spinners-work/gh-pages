
function makeWhatsNewLiElementForEntry(entry) {
  if (entry.url) {
    entry.blogLink = entry.url
  } else if (entry.origLink) {
    entry.blogLink = entry.origLink
  } else if ($.isArray(entry.link)) {
    entry.blogLink = entry.link[0].href
  } else {
    entry.blogLink = entry.link
  }

  if (entry.title.content) {
    entry.title = entry.title.content
  }

  if (entry.blogLink.match(/kudakurage/i)){
    entry.author = '@kudakurage';
  } else {
    entry.author = '@tokorom';
  }

  entry.description = entry.content.content.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''); // strip html tags
  entry.description = truncate(entry.description, 70, "…");

  if ($.isArray(entry.updated)) {
    entry.date = entry.updated[0]
  } else {
    entry.date = entry.updated
  }

  if ($.isArray(entry.link) && entry.link.length > 1) {
    entry.imageUrl = entry.link[1].href;
  } else {
    result = entry.content.content.match(/\<img(.*)src=\"?([\-_\.\!\~\*\'\(\)a-z0-9\;\/\?\:@&=\+\$\,\%\#]+(jpg|jpeg|gif|png))/i);
    if (result && $.isArray(result) && result.length > 2) {
      entry.imageUrl = result[2];
    } else {
      date = new Date(entry.date);
      entry.imageUrl = './images/entry_thumbnail_placeholder_'+ ((date.getTime() / 1000) % 6 + 1) +'.png';
    }
  }

  var html = '';
  html += "<a href='"+ entry.blogLink + "' class='feed-item-image'><img src='" + entry.imageUrl + "' width='300' /></a>";
  html += "<a href='"+ entry.blogLink + "' class='feed-item-title'>" + entry.title + "</a>";
  html += "<span class='feed-item-date'>" + formatDate(new Date(entry.date), 'YYYY年MM月DD日') + "</span>";
  html += "<span class='feed-item-author'>by " + entry.author + "</span>";
  html += "<div class='feed-item-desc'>" + entry.description + "</div>"
  return "<li>"+ html +"</li>";
}

function truncate(str, size, afterText){
  if (str.length > size) {
    str = str.substr(0, size);
    str += afterText;
  }
  return str;
}

function formatDate(date, format) {
  if (!format) format = 'YYYY-MM-DD hh:mm:ss.SSS';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, (date.getMonth() + 1));
  format = format.replace(/DD/g, date.getDate());
  format = format.replace(/hh/g, ('0' +date.getHours()).slice(-2));
  format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
  format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
  if (format.match(/S/g)) {
    var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
    var length = format.match(/S/g).length;
    for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
  }
  return format;
};

jQuery(function () {
  if(!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === "[object Array]";
    };
  }
  jQuery.getJSON("http://query.yahooapis.com/v1/public/yql?callback=?", {
    q : "select * from feed where url='http://kudakurage.hatenadiary.com/feed/category/design' or url='http://feeds.feedburner.com/tokorom?format=xml' or url='http://qiita.com/tokorom/feed' | sort(field='updated',descending='true');",
    format : "json"
  }, function (json) {
    var feedElement = jQuery("#feed").html("");
    if (Array.isArray(json.query.results.entry)){
      maxLength = json.query.results.entry.length < 6 ? json.query.results.entry.length : 6;
      for (var i = 0; i < maxLength; i++) {
        feedElement.append(makeWhatsNewLiElementForEntry(json.query.results.entry[i]));
      }
    }
  });
});

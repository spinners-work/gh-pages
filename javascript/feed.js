
function makeWhatsNewLiElement(item) {
  if (item.link.match(/kudakurage/gi)){
    item.author = '@kudakurage';
  } else {
    item.author = '@tokorom';
  }

  item.description = item.description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''); // strip html tags
  item.description = truncate(item.description, 70, "…");

  if (item.enclosure.type.match(/image\//gi)){
    item.imageUrl = item.enclosure.url;
  } else {
    date = new Date(item.pubDate);
    item.imageUrl = './images/entry_thumbnail_placeholder_'+ ((date.getTime() / 1000) % 6 + 1) +'.png';
  }

  var html = '';
  html += "<a href='"+ item.link + "' class='feed-item-image'><img src='" + item.imageUrl + "' width='300' /></a>";
  html += "<a href='"+ item.link + "' class='feed-item-title'>" + item.title + "</a>";
  html += "<span class='feed-item-date'>" + formatDate(new Date(item.pubDate), 'YYYY年MM月DD日') + "</span>";
  html += "<span class='feed-item-author'>by " + item.author + "</span>";
  html += "<div class='feed-item-desc'>" + item.description + "</div>"
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
    // q : "select * from rss where url='http://kudakurage.hatenadiary.com/rss' or url='http://feeds.feedburner.com/tokorom?format=xml' | sort(field='pubDate',descending='true');",
    q : "select * from rss where url='http://kudakurage.hatenadiary.com/rss' | sort(field='pubDate',descending='true');",
    format : "json"
  }, function (json) {
    var feedElement = jQuery("#feed");
    if (Array.isArray(json.query.results.item)){
      maxLength = json.query.results.item.length < 6 ? json.query.results.item.length : 6;
      for (var i = 0; i < maxLength; i++) {
        feedElement.append(makeWhatsNewLiElement(json.query.results.item[i]));
      }
    }
  });
});

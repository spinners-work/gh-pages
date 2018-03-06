
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

  var description = '';
  if (entry.description) {
    description = entry.description;
  } else if (entry.content) {
    if (entry.content.content) {
      description = entry.content.content;
    } else {
      description = entry.content;
    }
  }

  entry.description = description.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,''); // strip html tags
  entry.description = truncate(entry.description, 70, "…");

  if ($.isArray(entry.published)) {
    entry.date = entry.published[0];
  } else if (entry.published) {
    entry.date = entry.published;
  } else if (entry.pubDate) {
    entry.date = entry.pubDate;
  } else {
    entry.date = entry.date;
  }

  if (entry.coverImage) {
    entry.imageUrl = entry.coverImage;
  } else if ($.isArray(entry.link) && entry.link.length > 1) {
    entry.imageUrl = entry.link[1].href;
  } else {
    date = new Date(entry.date);
    entry.imageUrl = './images/entry_thumbnail_placeholder_'+ ((date.getTime() / 1000) % 6 + 1) +'.png';
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
  maxLength = 12
  feedCount = 2
  maxLengthByFeed = maxLength / feedCount
  jQuery.getJSON("http://query.yahooapis.com/v1/public/yql?callback=?", {
    q : "select * from feed where url='http://kudakurage.hatenadiary.com/feed/category/design' limit " + maxLengthByFeed,
    format : "json"
  }, function (designJSON) {
    jQuery.getJSON("http://query.yahooapis.com/v1/public/yql?callback=?", {
      q : "select * from feed where url='http://www.tokoro.me/atom.xml' limit " + maxLengthByFeed,
      format : "json"
    }, function (devJSON) {
      published = function(entry) {
        if (entry.published) {
          return new Date(entry.published);
        } else if (entry.pubDate) {
          return new Date(entry.pubDate);
        } else {
          return new Date(entry.date);
        }
      };

      var feedElement = jQuery("#feed").html("");
      var entries = [];

      designEntries = designJSON.query.results.entry;
      if (Array.isArray(designEntries)) {
        entries = entries.concat(designEntries);
      }
      devEntries = devJSON.query.results.item;
      if (Array.isArray(devEntries)) {
        entries = entries.concat(devEntries);
      }

      entries = entries.sort(function(lhs, rhs) {
        lhsDate = published(lhs);
        rhsDate = published(rhs);
        if (lhsDate < rhsDate) {
          return 1;
        } else {
          return -1;
        }
      });
      entries.forEach(function(entry) {
        feedElement.append(makeWhatsNewLiElementForEntry(entry));
      });
    });
  });
});

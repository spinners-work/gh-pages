
function makeWhatsNewLiElementForEntry(entry) {
  if (!entry.imageUrl) {
    date = new Date(entry.date);
    entry.imageUrl = './images/entry_thumbnail_placeholder_'+ ((date.getTime() / 1000) % 6 + 1) +'.png';
  }

  var html = '';
  html += "<a href='"+ entry.url + "' class='feed-item-image'><img src='" + entry.imageUrl + "' width='300' /></a>";
  html += "<a href='"+ entry.url + "' class='feed-item-title'>" + entry.title + "</a>";
  html += "<span class='feed-item-date'>" + formatDate(new Date(entry.publishedAt), 'YYYY年MM月DD日') + "</span>";
  html += "<span class='feed-item-author'>by " + entry.author + "</span>";
  html += "<div class='feed-item-desc'>" + entry.description + "</div>"
  return "<li>"+ html +"</li>";
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
  jQuery.getJSON("https://s3-ap-northeast-1.amazonaws.com/feed.spinners.work/feed.json", function() {
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    var feedElement = jQuery("#feed").html("");
    console.log("error: " + textStatus);
    console.log("text: " + jqXHR.responseText);
  })
  .done(function(json) {
    var feedElement = jQuery("#feed").html("");

    var entries = json;

    entries.forEach(function(entry) {
      feedElement.append(makeWhatsNewLiElementForEntry(entry));
    });
  });
});

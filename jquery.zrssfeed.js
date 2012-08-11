/**
 * Plugin: jquery.zRSSFeed
 * 
 * Version: 1.1.6
 * (c) Copyright 2010-2012, Zazar Ltd
 * 
 * Description: jQuery plugin for display of RSS feeds via Google Feed API
 *              (Based on original plugin jGFeed by jQuery HowTo. Filesize function by Cary Dunn.)
 * 
 * History:
 * 1.1.6 - Added sort options
 * 1.1.5 - Target option now applies to all feed links
 * 1.1.4 - Added option to hide media and now compressed with Google Closure
 * 1.1.3 - Check for valid published date
 * 1.1.2 - Added user callback function due to issue with ajaxStop after jQuery 1.4.2
 * 1.1.1 - Correction to null xml entries and support for media with jQuery < 1.5
 * 1.1.0 - Added support for media in enclosure tags
 * 1.0.3 - Added feed link target
 * 1.0.2 - Fixed issue with GET parameters (Seb Dangerfield) and SSL option
 * 1.0.1 - Corrected issue with multiple instances
 *
 **/

(function($){

	$.fn.rssfeed = function(urls, options, fn) {	
	
		// Set pluign defaults
		var defaults = {
			limit: 10,
			header: true,
			titletag: 'h4',
			date: true,
			content: true,
			snippet: true,
			media: true,
			showerror: true,
			errormsg: '',
			key: null,
			ssl: false,
			linktarget: '_self',
			sort: '',
			sortasc: true
		};  
		var options = $.extend(defaults, options); 
		
		// Functions
		return this.each(function(i, e) {
			var $e = $(e);
			var s = '';

			// Check for SSL protocol
			if (options.ssl) s = 's';
			
			// Add feed class to user div
			if (!$e.hasClass('rssFeed')) $e.addClass('rssFeed');
			
			// Check for valid url
			if(urls == null || urls.length == 0) return false;
			
			//Storage for multiple feeds.
			var rowArray = [];
			var feedsToHandle = urls.length;
			
			// Send request
			for(var ndx in urls){
				var url = urls[ndx];
				// Create Google Feed API address
				var api = "http"+ s +"://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent(url);
				if (options.limit != null) api += "&num=" + options.limit;
				if (options.key != null) api += "&key=" + options.key;
				api += "&output=json_xml"
			
			
				$.getJSON(api, function(data){
				
				// Check for error
				if (data.responseStatus == 200) {
					feedsToHandle--;
					// Process the feeds
					
					rowArray = _process(e, data.responseData, options, rowArray);
					
				} else {
					feedsToHandle--;
					
					// Handle error if required
					if (options.showerror)
						if (options.errormsg != '') {
							var msg = options.errormsg;
						} else {
							var msg = data.responseDetails;
						};
						//$(e).html('<div class="rssError"><p>'+ msg +'</p></div>');
				};
				if(feedsToHandle == 0){
					
					//SORT IF REQUIRED.
					rowArray = sortArray(rowArray, options);
					
					//write to page
					writeToPage(e, rowArray, options );
					
					
					// Optional user callback function
					if ($.isFunction(fn)) fn.call(this,$e);
				}
			});
			
			
			}
			
			

			
			
							
		});
	};
	
	// Function to create HTML result array
	var _process = function(e, data, options, rowArray) {

		// Get JSON feed data
		var feeds = data.feed;
		if (!feeds) {
			return false;
		}
		
		
		// Get XML data for media (parseXML not used as requires 1.5+)
		if (options.media) {
			var xml = getXMLDocument(data.xmlString);
			var xmlEntries = xml.getElementsByTagName('item');
		}
			
		// Add body




		// Add feeds
		for (var i=0; i<feeds.entries.length; i++) {
			
			var currentItem = rowArray.length;
			rowArray[currentItem] = {};

			// Get individual feed
			var entry = feeds.entries[i];
			var pubDate;
			var sort = '';

			// Apply sort column
			switch (options.sort) {
				case 'title':
					sort = entry.title;
					break;
				case 'date':
					sort = entry.publishedDate;
					break;
			}
			rowArray[currentItem]['sort'] = sort;

			// Format published date
			if (entry.publishedDate) {
				var entryDate = new Date(entry.publishedDate);
				var pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();
			}
			
			// Add feed row
			rowArray[currentItem]['html'] = '<'+ options.titletag +'><a href="'+ entry.link +'" title="View this feed at '+ feeds.title +'">'+ entry.title +'</a></'+ options.titletag +'>'

			if (options.date && pubDate) rowArray[currentItem]['html'] += '<div>'+ pubDate +'</div>'
			if (options.content) {
			
				// Use feed snippet if available and optioned
				if (options.snippet && entry.contentSnippet != '') {
					var content = entry.contentSnippet;
				} else {
					var content = entry.content;
				}
				
				rowArray[currentItem]['html'] += '<p>'+ content +'</p>'
			}
			
			// Add any media
			if (options.media && xmlEntries.length > 0) {
				var xmlMedia = xmlEntries[i].getElementsByTagName('enclosure');
				if (xmlMedia.length > 0) {
					
					rowArray[currentItem]['html'] += '<div class="rssMedia"><div>Media files</div><ul>'
					
					for (var m=0; m<xmlMedia.length; m++) {
						var xmlUrl = xmlMedia[m].getAttribute("url");
						var xmlType = xmlMedia[m].getAttribute("type");
						var xmlSize = xmlMedia[m].getAttribute("length");
						rowArray[currentItem]['html'] += '<li><a href="'+ xmlUrl +'" title="Download this media">'+ xmlUrl.split('/').pop() +'</a> ('+ xmlType +', '+ formatFilesize(xmlSize) +')</li>';
					}
					
				}
			}
					
		}
		
		
		return rowArray;

		
	};
	function sortArray(rowArray, options){
		// Sort if required
		if (options.sort) {
			rowArray.sort(function(a,b) {

				// Apply sort direction
				if (options.sortasc) {
					var c = a['sort'];
					var d = b['sort'];
				} else {
					var c = b['sort'];
					var d = a['sort'];
				}

				if (options.sort == 'date') {
					return new Date(c) - new Date(d);
				} else {
					c = c.toLowerCase();
					d = d.toLowerCase();
					return (c < d) ? -1 : (c > d) ? 1 : 0;
				}
			});
		}
		return rowArray;
	}
	
	
	
	function writeToPage(e, rowArray, options ){
		// Add rows to output
		var row = 'odd';
		var html = '<ul>'
		$.each(rowArray, function(e) {

			html += '<li class="rssRow '+row+'">' + rowArray[e]['html'] + '</li>';

			// Alternate row classes
			if (row == 'odd') {
				row = 'even';
			} else {
				row = 'odd';
			}			
		});

		html+='</ul>';
		$(e).html(html);

		// Apply target to links
		$('a',e).attr('target',options.linktarget);
	}
	
	
	function formatFilesize(bytes) {
		var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
		var e = Math.floor(Math.log(bytes)/Math.log(1024));
		return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
	}

	function getXMLDocument(string) {
		var browser = navigator.appName;
		var xml;
		if (browser == 'Microsoft Internet Explorer') {
			xml = new ActiveXObject('Microsoft.XMLDOM');
			xml.async = 'false'
			xml.loadXML(string);
		} else {
			xml = (new DOMParser()).parseFromString(string, 'text/xml');
		}
		return xml;
	}

})(jQuery);
